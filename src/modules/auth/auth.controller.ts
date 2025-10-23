import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiOperation, ApiResponse, ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';

import { CurrentUser } from '@/src/common/decorators/current-user.decorator';
import { Public } from '@/src/common/decorators/public.decorator';
import { User } from '@/src/generated/client';

@ApiTags('Auth')
@Public()
@Controller('auth')
export class AuthController {
  private readonly authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 201, description: 'Successfully logged in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(
    @Body() loginDto: LoginDto,
    @I18n() i18n: I18nContext,
  ): Promise<Record<string, unknown>> {
    const result = await this.authService.login(loginDto);
    return {
      ...result,
      message: i18n.t('auth.login.success'),
    };
  }

  @Post('signup')
  @ApiOperation({ summary: 'User registration' })
  @ApiResponse({ status: 201, description: 'Successfully registered' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async signup(
    @Body() signupDto: SignupDto,
    @I18n() i18n: I18nContext,
  ): Promise<Record<string, unknown>> {
    const result = await this.authService.signup(signupDto);
    return {
      ...result,
      message: i18n.t('auth.signup.success'),
    };
  }

  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  @ApiResponse({ status: 201, description: 'Password reset email sent if account exists' })
  async forgotPassword(
    @Body() body: { email: string },
    @I18n() i18n: I18nContext,
  ): Promise<{ message: string }> {
    const result = await this.authService.sendPasswordResetEmail(body.email);
    return {
      message: i18n.t('auth.password_reset.sent', {
        defaultValue: result.message
      }),
    };
  }

  @Post('refresh')
  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'New access token generated' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(
    @CurrentUser() user: User,
    @I18n() i18n: I18nContext,
  ): Promise<Record<string, unknown>> {
    const result = await this.authService.refresh(user.id);
    return {
      ...result,
      message: i18n.t('auth.refresh.success'),
    };
  }

  @Post('logout')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Successfully logged out' })
  async logout(
    @CurrentUser() user: User,
    @I18n() i18n: I18nContext,
  ): Promise<{ message: string }> {
    const result = await this.authService.logout(user.id);
    return {
      message: i18n.t('auth.logout.success', {
        defaultValue: result.message
      }),
    };
  }
}
