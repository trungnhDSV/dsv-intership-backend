import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { EmailVerification } from '../schemas/email-verification.schema';
import { Model } from 'mongoose';
import { EmailService } from 'src/auth/email.service';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectModel(EmailVerification.name)
    private readonly evModel: Model<EmailVerification>,
    private readonly emailService: EmailService,
  ) {
    this.evModel.collection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 },
    );
  }

  async deleteByToken(token: string) {
    return this.evModel.deleteOne({
      token,
    });
  }

  async create(data: Partial<EmailVerification>) {
    return this.evModel.create(data);
  }

  async findByToken(token: string) {
    return this.evModel.findOne({ token });
  }

  async markUsed(token: string) {
    return this.evModel.updateOne({ token }, { isUsed: true });
  }

  async isTokenValid(token: string) {
    const record = await this.findByToken(token);
    if (!record || record.isUsed || record.expiresAt < new Date()) {
      return false;
    }
    return true;
  }

  async findByEmail(email: string) {
    return this.evModel.findOne({
      email,
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const record = await this.findByEmail(email);
    if (record && record.isUsed) {
      throw new Error('Email already verified');
    }
    try {
      this.emailService.sendVerificationEmail(email, token);
      if (record) {
        await this.evModel.updateOne(
          {
            email,
          },
          {
            token,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000),
          },
        );
      }
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Error sending email');
    }
  }
}
