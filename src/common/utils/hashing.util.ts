import { BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

export abstract class Hashing {
  static async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  static async compareOrFail(password: string, hashedPassword: string, message: string = 'username or email is incorrect') {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    if (!isMatch) {
      throw new BadRequestException(message);
    }
    return isMatch;
  }
}
