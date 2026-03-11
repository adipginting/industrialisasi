import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';
import * as argon2 from 'argon2';

export type User = any;

@Injectable()
export class UsersService {
  constructor(@Inject(PG_CONNECTION) private conn: any) {}

  async findOne(username: string): Promise<User | undefined> {
    try {
      const res = await this.conn.query(
        `SELECT id, username, email, hashed_password FROM idst.users WHERE username = $1`,
        [username],
      );
      if (res.rows.length === 0) {
        return null;
      }
      const user = res.rows[0];
      return {
        userId: user.id,
        username: user.username,
        password: user.hashed_password,
      };
    } catch (error) {
      console.error('findOne error:', error);
      return null;
    }
  }

  async validatePassword(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    try {
      return await argon2.verify(hashedPassword, plainPassword);
    } catch (error) {
      console.error('validatePassword error:', error);
      return false;
    }
  }
}
