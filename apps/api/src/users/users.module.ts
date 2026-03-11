import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DbService } from '../db/db.service';
import { dbModule } from 'src/db/db.module';

@Module({
  providers: [UsersService, DbService],
  exports: [UsersService],
  imports: [dbModule],
})
export class UsersModule {}
