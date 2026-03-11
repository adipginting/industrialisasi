import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DbService } from './db/db.service';

@Module({
  imports: [dbModule, AuthModule, UsersModule],
  controllers: [AppController],
  providers: [AppService, DbService],
})
export class AppModule {}
