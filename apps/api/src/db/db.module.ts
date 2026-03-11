import { Module } from '@nestjs/common';
import { pgConnection } from './db.helper';

@Module({
  providers: [pgConnection],
  exports: [pgConnection],
})
export class dbModule {}
