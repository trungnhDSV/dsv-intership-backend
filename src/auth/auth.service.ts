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
import {
  JWT_ACTIVE_EXPIRATION,
  JWT_MAIL_VALIDATE_EXPIRATION,
  SHORT_JWT_EXPIRATION,
} from 'src/constants/JWTExpiredTime';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailService: MailService,
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
    console.log('----------Normal login------------', {
      token: 'random token',
      user,
    });

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

    const user = await this.mailService.create({
      email: body.email,
      fullName: body.fullName,
      password: result,
      token,
      expiresAt,
    });
    await this.mailService.sendVerificationEmail(body.email, token);
    return user;
  }
  async verifyLogin(token: string) {
    let payload: { email: string; fullName: string };

    try {
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (err) {
      console.error('Invalid token', err);
      if (err.name === 'TokenExpiredError') {
        throw new BadRequestException('Token đã hết hạn');
      }
      throw new BadRequestException('Token không hợp lệ');
    }

    const user = await this.usersService.find(payload.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const loginToken = this.generateJwt(user);

    return {
      token: loginToken,
      user,
    };
  }

  async resendVerificationEmail(email: string) {
    const record = await this.mailService.findByEmail(email);
    if (!record) {
      throw new NotFoundException('User not found');
    }
    if (record.isUsed) {
      throw new BadRequestException('Email already verified');
    }
    const newToken = this.jwtService.sign(
      {
        email: record.email,
        fullName: record.fullName,
      },
      {
        expiresIn: JWT_MAIL_VALIDATE_EXPIRATION,
        secret: process.env.JWT_SECRET,
      },
    );
    await this.mailService.sendVerificationEmail(record.email, newToken);
    return { message: 'Verification email resent' };
  }

  async verifyEmail(token: string) {
    try {
      let payload: {
        email: string;
        fullName: string;
      };
      payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      const mailVerifiRecord = await this.mailService.findByEmail(
        payload.email,
      );
      if (!mailVerifiRecord) {
        console.error('token not found');
        throw new NotFoundException('token not found');
      }
      if (mailVerifiRecord.isUsed) {
        console.error('Email already verified');
        throw new BadRequestException('Email already verified');
      }
      await this.mailService.deleteByToken(token);
      const user = await this.usersService.create({
        email: mailVerifiRecord.email,
        fullName: mailVerifiRecord.fullName,
        password: mailVerifiRecord.password,
        provider: 'credentials',
      });

      return {
        token: this.generateJwt(user),
        user,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token đã hết hạn');
      }
      console.error('Invalid token', error);
      throw new BadRequestException('Invalid token');
    }
  }

  async checkOauthEmail(email: string, fullName: string) {
    const user = await this.usersService.find(email);
    if (user && user.provider === 'credentials') {
      console.warn('[OAuth Check] Blocked sign-in for credentials user');
      throw new BadRequestException(
        'This email is already registered. Please sign in with your email and password',
      );
    }
    if (user && user.provider === 'google') {
      return { ok: true };
    }
    try {
      const newUser = await this.usersService.create({
        email,
        fullName,
        provider: 'google',
      });
      return { ok: true, user: newUser };
    } catch (error) {
      console.error('Error creating user', error);
      throw new ConflictException('Error creating user');
    }
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
