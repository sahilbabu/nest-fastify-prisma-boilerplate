import { BadRequestException, ConflictException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import dayjs from 'dayjs';

import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

import { Hashing } from '@/src/common/utils/hashing.util';
import { MailService } from '@/src/core/mail/mail.service';
import { PrismaService } from '@/src/core/prisma/prisma.service';

interface AuthResponse {
  id: number;
  token: string;
  refreshToken?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly jwtService: JwtService;
  private readonly prismaService: PrismaService;
  private readonly mailService: MailService;
  private readonly configService: ConfigService;

  constructor(
    jwtService: JwtService,
    prismaService: PrismaService,
    mailService: MailService,
    configService: ConfigService,
  ) {
    this.jwtService = jwtService;
    this.prismaService = prismaService;
    this.mailService = mailService;
    this.configService = configService;
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.prismaService.prisma.user.findFirst({
      where: {
        OR: [{ email: loginDto.email }, { username: loginDto.username }],
      },
      select: {
        id: true,
        username: true,
        password: true,
      },
    });
    if (!user) throw new BadRequestException('username or email is incorrect');
    await Hashing.compareOrFail(loginDto.password, user.password);
    const payload = {
      id: user.id,
      username: user.username,
    };
    const accessTokenExpiry = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') ?? '15m';
    const refreshTokenExpiry = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') ?? '7d';
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: accessTokenExpiry } as JwtSignOptions);
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: refreshTokenExpiry } as JwtSignOptions);
    const refreshTokenExp = dayjs().add(7, 'days').toDate();
    await this.prismaService.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: dayjs().toDate(), refreshToken, refreshTokenExp },
    });
    return {
      id: user.id,
      token: accessToken,
      refreshToken,
    };
  }

  async signup(signupDto: SignupDto): Promise<AuthResponse> {
    const user = await this.prismaService.prisma.user.findFirst({
      where: {
        OR: [{ email: signupDto.email }, { username: signupDto.username }],
      },
      select: { id: true },
    });
    if (user) throw new ConflictException('User already exists');
    const hashedPassword = await Hashing.hash(signupDto.password);
    const newUser = await this.prismaService.prisma.user.create({
      data: {
        ...signupDto,
        password: hashedPassword,
        lastLogin: dayjs().toDate(),
      },
      select: { id: true, username: true, email: true },
    });

    const userPayload = {
      id: newUser.id,
      username: newUser.username,
    };

    const accessTokenExpiry = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') ?? '15m';
    const refreshTokenExpiry = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') ?? '7d';
    const accessToken = this.jwtService.sign(userPayload, { expiresIn: accessTokenExpiry } as JwtSignOptions);
    const refreshToken = this.jwtService.sign(userPayload, { expiresIn: refreshTokenExpiry } as JwtSignOptions);
    const refreshTokenExp = dayjs().add(7, 'days').toDate();

    await this.prismaService.prisma.user.update({
      where: { id: newUser.id },
      data: { refreshToken, refreshTokenExp },
    });

    // Send welcome email (non-blocking)
    void this.sendWelcomeEmailAsync(newUser.email, newUser.username);

    return {
      id: newUser.id,
      token: accessToken,
      refreshToken,
    };
  }

  /**
   * Send welcome email asynchronously without blocking the signup process
   */
  private async sendWelcomeEmailAsync(email: string, username: string): Promise<void> {
    try {
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
      await this.mailService.sendTemplate({
        to: email,
        subject: 'Welcome to Our Platform! 🎉',
        template: 'welcome',
        context: {
          name: username,
          dashboardUrl: `${frontendUrl}/dashboard`,
        },
      });
      this.logger.log(`Welcome email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<{ message: string }> {
    const user = await this.prismaService.prisma.user.findUnique({
      where: { email },
      select: { id: true, username: true },
    });

    if (!user) {
      // Return success even if user doesn't exist (security best practice)
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    // Generate reset token (you might want to store this in database with expiration)
    const passwordResetTokenExpiry = this.configService.get<string>('JWT_PASSWORD_RESET_TOKEN_EXPIRES_IN') ?? '1h';
    const resetToken = await this.jwtService.signAsync(
      { id: user.id, type: 'password-reset' },
      { expiresIn: passwordResetTokenExpiry } as JwtSignOptions
    );

    // Create reset link (adjust URL as needed)
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
      await this.mailService.sendTemplate({
        to: email,
        subject: 'Reset Your Password',
        template: 'password-reset',
        context: {
          name: user.username,
          resetLink,
        },
      });
      this.logger.log(`Password reset email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      throw new BadRequestException('Failed to send password reset email. Please try again later.');
    }

    return { message: 'If an account with that email exists, a password reset link has been sent.' };
  }

  /**
   * Refresh access token using refresh token
   */
  async refresh(userId: number): Promise<{ token: string; refreshToken: string }> {
    const user = await this.prismaService.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const payload = {
      id: user.id,
      username: user.username,
    };

    const accessTokenExpiry = this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') ?? '15m';
    const refreshTokenExpiry = this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') ?? '7d';
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: accessTokenExpiry } as JwtSignOptions);
    const refreshToken = await this.jwtService.signAsync(payload, { expiresIn: refreshTokenExpiry } as JwtSignOptions);
    const refreshTokenExp = dayjs().add(7, 'days').toDate();

    await this.prismaService.prisma.user.update({
      where: { id: userId },
      data: { refreshToken, refreshTokenExp },
    });

    return { token: accessToken, refreshToken };
  }

  /**
   * Logout user by clearing refresh token
   */
  async logout(userId: number): Promise<{ message: string }> {
    await this.prismaService.prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null, refreshTokenExp: null },
    });

    return { message: 'Logged out successfully' };
  }
}
