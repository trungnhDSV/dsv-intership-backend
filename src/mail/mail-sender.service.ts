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
      from: '"LuminPDF Support" <no-reply@luminpdf.com>',
      to,
      subject: 'Please verify your email address',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h2>Welcome to LuminPDF!</h2>
          <p>Thank you for signing up.</p>
          <p>To get started, please verify your email address by clicking the button below:</p>
          <p style="text-align: center;">
            <a href="${verifyUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
              Verify Email
            </a>
          </p>
          <p>If the button doesn't work, copy and paste the following URL into your browser:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p><small>This link will expire in 10 minutes.</small></p>
          <hr />
          <p style="font-size: 12px; color: #999;">If you did not request this, please ignore this email.</p>
        </div>
      `,
    });

    console.log(`Verification email sent to ${to}`);
  }
}
