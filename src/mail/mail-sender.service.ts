import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailSenderService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  async sendVerificationEmail(to: string, token: string) {
    const verifyUrl = `${process.env.APP_URL}/verify?token=${token}`;

    await this.transporter.sendMail({
      from: '"LuminPDF" <no-reply@luminpdf.com>',
      to,
      subject: 'Verify your email',
      html: `
        <p>Welcome!</p>
        <p>Click here to verify your email:</p>
        <a href="${verifyUrl}">${verifyUrl}</a>
        <p>This link will expire in 10 minutes.</p>
      `,
    });

    console.log(`Verification email sent to ${to}`);
  }
}
