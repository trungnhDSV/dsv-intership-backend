import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  comparePassword,
  generateHashPassword,
} from '../common/helpers/hash.helper';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dtos/create-user.dto';

import { JwtService } from '@nestjs/jwt';
import { User } from 'src/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    const user = await this.usersService.find(email);
    if (!user) {
      console.error('USER NOT FOUND');
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      console.error('PASSWORD NOT VALID');
      throw new UnauthorizedException('Wrong password');
    }

    return {
      token: this.generateJwt(user),
      user,
    };
  }

  async signUp(body: CreateUserDto) {
    console.log('body', body);
    // check existing user
    const existingUser = await this.usersService.find(body.email);

    if (existingUser) {
      console.log('EXISTING USER', existingUser);
      throw new ConflictException('Email in use');
    }
    // hash password
    const result = await generateHashPassword(body.password);

    // create new user and save to database
    const user = await this.usersService.create({
      ...body,
      password: result,
      provider: 'credentials',
    });
    // return user
    return {
      token: this.generateJwt(user),
      user,
    };
  }

  private generateJwt(user: User) {
    return this.jwtService.sign({
      sub: user._id,
      email: user.email,
      name: user.fullName,
    });
  }
}
