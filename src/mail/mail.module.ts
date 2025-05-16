import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailSenderService } from 'src/mail/mail-sender.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  EmailVerification,
  EmailVerificationSchema,
} from 'src/schemas/email-verification.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: EmailVerification.name, schema: EmailVerificationSchema },
    ]),
  ],
  providers: [MailService, MailSenderService],
  exports: [MailService],
})
export class MailModule {}
