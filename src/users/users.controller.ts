import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  Session,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { AuthGuard } from 'src/common/auth/auth.guard';
import { AuthService } from 'src/users/auth.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {}

  @Get('/whoami')
  @UseGuards(AuthGuard)
  async whoAmI() {
    return {
      message: 'Hello from whoami',
    };
  }

  @Post('/signup')
  async signUp(@Body() body: CreateUserDto, @Session() session: any) {
    const data = await this.authService.signUp(body);
    // session.userId = user._id;
    console.log('session', session);
    console.log('user in controller: ', data.user);
    console.log('return to FE', {
      token: data.token,
      user: data.user.toJSON(),
    });
    return {
      token: data.token,
      user: data.user.toJSON(),
    };
  }

  @Post('/signin')
  async signin(@Body() body: { email: string; password: string }) {
    const data = await this.authService.signIn(body.email, body.password);
    console.log(data);
    return data;
  }
}
