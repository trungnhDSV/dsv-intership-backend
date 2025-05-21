import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@Req() req) {
    const userId = req.user.userId;
    return {
      status: 'success',
    };
    return this.usersService.find(userId);
  }
  // Add more routes like update profile, change password, etc.
}
