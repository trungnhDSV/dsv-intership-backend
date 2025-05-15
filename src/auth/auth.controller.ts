import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Req,
  Query,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { SignInDto } from 'src/auth/dtos/sign-in.dto';
import { Response } from 'express';
import { User } from 'src/schemas/user.schema';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

@Controller('auth')
export class AuthController {
  // private readonly logger = new Logger(AuthController.name);
  private readonly frontendUrl = process.env.FRONTEND_URL;

  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signUp(@Body() body: CreateUserDto): Promise<ApiResponse<void>> {
    await this.authService.signUp(body);
    return { success: true, message: 'Verification email sent' };
  }

  @Post('signin')
  async signIn(
    @Body() credentials: SignInDto,
  ): Promise<ApiResponse<{ token: string; user: User }>> {
    return {
      success: true,
      data: await this.authService.signIn(
        credentials.email,
        credentials.password,
      ),
    };
  }

  @Get('verify')
  async verifyEmail(
    @Query('token') token: string,
  ): Promise<ApiResponse<{ token: string; user: User }>> {
    console.log('CONTROLLER: token', token);
    return { success: true, data: await this.authService.verifyEmail(token) };
  }

  @Post('verify')
  async resendVerification(
    @Query('email') email: string,
  ): Promise<ApiResponse<void>> {
    await this.authService.resendVerificationEmail(email);
    return { success: true, message: 'Verification email resent' };
  }

  @Post('verify-login')
  async verifyLogin(@Body('token') token: string) {
    const data = await this.authService.verifyEmail(token); // giống logic kích hoạt tài khoản
    if (!data) {
      throw new BadRequestException('Token không hợp lệ hoặc đã hết hạn');
    }

    const jwt = this.authService.generateJwt(data.user); // return access token

    return {
      token: jwt,
      user: data.user,
    };
  }

  @Get('test-expired-token')
  async getShortToken(): Promise<ApiResponse<{ token: string }>> {
    const mockUser = {
      _id: '1234567890',
      email: 'test@example.com',
      fullName: 'Test User',
    } as User;

    return {
      success: true,
      data: { token: this.authService.generateShortLivedJwt(mockUser) },
    };
  }
}
