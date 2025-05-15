import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmailVerification,
  EmailVerificationSchema,
} from '../schemas/email-verification.schema';
import { EmailVerificationService } from 'src/auth/email-verification.service';
import { EmailService } from 'src/auth/email.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({}), // Token config sẽ nằm trong JwtStrategy
    MongooseModule.forFeature([
      { name: EmailVerification.name, schema: EmailVerificationSchema },
    ]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailVerificationService, EmailService],
  exports: [AuthService, EmailVerificationService],
})
export class AuthModule {}
