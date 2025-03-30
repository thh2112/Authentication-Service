import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashingService {
  public static SALT_ROUNDS = 10;

  async hash(
    plainPassword: string,
    saltRound = HashingService.SALT_ROUNDS,
  ): Promise<string> {
    return await bcrypt.hash(plainPassword, saltRound);
  }

  public async compare(
    plainPassword: string,
    hashPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashPassword);
  }
}
