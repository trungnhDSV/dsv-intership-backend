import {
  BadRequestException,
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
import { EmailVerificationService } from 'src/auth/email-verification.service';
import {
  JWT_ACTIVE_EXPIRATION,
  JWT_MAIL_VALIDATE_EXPIRATION,
  SHORT_JWT_EXPIRATION,
} from 'src/constants/JWTExpiredTime';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailVerificationService: EmailVerificationService,
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

    const existingUser = await this.usersService.find(body.email);
    if (existingUser) {
      console.error('user already exist', existingUser.email);
      throw new ConflictException('Email in use');
    }

    // hash password
    const result = await generateHashPassword(body.password);
    const token = this.jwtService.sign(
      {
        email: body.email,
        fullName: body.fullName,
        password: result,
      },
      {
        expiresIn: JWT_MAIL_VALIDATE_EXPIRATION,
        secret: process.env.JWT_SECRET,
      },
    );
    // create email verification record
    const expirationStr = JWT_MAIL_VALIDATE_EXPIRATION?.replace('s', '');
    const expirationSeconds = Number(expirationStr);

    if (isNaN(expirationSeconds)) {
      throw new Error('Invalid JWT_MAIL_VALIDATE_EXPIRATION format');
    }

    const expiresAt = new Date(Date.now() + expirationSeconds * 1000);

    const user = await this.emailVerificationService.create({
      email: body.email,
      fullName: body.fullName,
      password: result,
      token,
      expiresAt,
    });
    await this.emailVerificationService.sendVerificationEmail(
      body.email,
      token,
    );
    return { message: 'Verification email sent' };
  }

  async resendVerificationEmail(email: string) {
    const record = await this.emailVerificationService.findByEmail(email);
    if (!record) {
      throw new NotFoundException('User not found');
    }
    if (record.isUsed) {
      throw new BadRequestException('Email already verified');
    }
    const token = this.jwtService.sign(
      {
        email: record.email,
        fullName: record.fullName,
        password: record.password,
      },
      {
        expiresIn: JWT_MAIL_VALIDATE_EXPIRATION,
        secret: process.env.JWT_SECRET,
      },
    );
    await this.emailVerificationService.sendVerificationEmail(
      record.email,
      token,
    );
    return { message: 'Verification email resent' };
  }

  async verifyEmail(token: string) {
    console.log('VERIFY: token', token);
    const record = await this.emailVerificationService.findByToken(token);

    console.log('record', record);

    if (!record || record.isUsed || record.expiresAt < new Date()) {
      throw new BadRequestException('Token expired or invalid');
    }

    const user = await this.usersService.create({
      email: record.email,
      fullName: record.fullName,
      password: record.password,
      provider: 'credentials',
    });
    // delete email verification record
    await this.emailVerificationService.deleteByToken(token);

    await this.emailVerificationService.markUsed(token);

    return {
      token: this.generateJwt(user),
      user,
    };
  }

  generateJwt(user: User) {
    return this.jwtService.sign(
      {
        sub: user._id,
        email: user.email,
        name: user.fullName,
      },
      {
        expiresIn: JWT_ACTIVE_EXPIRATION,
        secret: process.env.JWT_SECRET,
      },
    );
  }

  generateShortLivedJwt(user: User) {
    return this.jwtService.sign(
      {
        sub: user._id,
        email: user.email,
        name: user.fullName,
      },
      {
        expiresIn: SHORT_JWT_EXPIRATION,
        secret: process.env.JWT_SECRET,
      },
    );
  }
}
