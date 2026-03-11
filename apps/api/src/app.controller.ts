import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
} from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt.auth.guard';
import { DbService } from './db/db.service';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private dbService: DbService,
  ) {}
  @UseGuards(LocalAuthGuard)
  @Post('auth/login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post('auth/logout')
  async logout(@Request() req) {
    return req.logout();
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('posts')
  async createPost(
    @Request() req,
    @Body() body: { title: string; content: string },
  ) {
    try {
      return this.dbService.createPost(
        req.user.userId,
        body.title,
        body.content,
      );
    } catch (error) {
      console.error('createPost error:', error);
      throw error;
    }
  }

  @Get('posts')
  async getPosts() {
    return this.dbService.getPosts();
  }

  @Get('users')
  async getUsers() {
    return this.dbService.getUsers();
  }
}
