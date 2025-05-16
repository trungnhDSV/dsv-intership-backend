import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { SignInDto } from 'src/auth/dtos/sign-in.dto';
import { User } from 'src/schemas/user.schema';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { OAuthCheckDto } from 'src/auth/dtos/oauth-check.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  // private readonly logger = new Logger(AuthController.name);
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'success',
    schema: {
      example: {
        status: 'success',
        statusCode: 201,
        data: {
          email: 'nam@example.com',
          fullName: 'Nam Pham',
          token: 'verification_token',
          expiresAt: '2023-10-01T00:00:00Z',
          isUsed: false,
          id: '1234567890',
        },
      },
    },
  })
  async signUp(@Body() body: CreateUserDto) {
    const mailVerification = await this.authService.signUp(body);
    return mailVerification;
  }

  @Post('signin')
  async signIn(@Body() credentials: SignInDto) {
    return await this.authService.signIn(
      credentials.email,
      credentials.password,
    );
  }
  @Post('verify-login')
  async verifyLogin(@Body('token') token: string) {
    const user = await this.authService.verifyLogin(token);
    console.log('Google login', user);
    return user;
  }

  @Post('verify')
  @ApiResponse({
    status: 200,
    description: 'success',
    schema: {
      example: {
        status: 'success',
        statusCode: 200,
        data: {
          token: 'verification_token',
          user: {
            email: '',
            fullName: '',
            password: '',
          },
        },
      },
    },
  })
  async verifyEmail(@Body('token') token: string) {
    const data = await this.authService.verifyEmail(token);
    console.log('Verify success', data);
    return data;
  }

  @Get('verify')
  async resendVerification(@Query('email') email: string) {
    await this.authService.resendVerificationEmail(email);
    return { success: true, message: 'Verification email resent' };
  }

  @Post('oauth-check')
  async checkOauthEmail(@Body() body: OAuthCheckDto) {
    return this.authService.checkOauthEmail(body.email, body.fullName);
  }

  @Get('test-expired-token')
  async getShortToken() {
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
