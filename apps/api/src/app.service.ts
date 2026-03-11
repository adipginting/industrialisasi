import { Injectable, Inject } from '@nestjs/common';
import { PG_CONNECTION } from './constants';

@Injectable()
export class AppService {
  constructor(@Inject(PG_CONNECTION) private connection: any) {}

  async getHello() {
    const res = await this.connection.query('Select * from users');
    return res;
  }
}
