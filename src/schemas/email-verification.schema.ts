// src/auth/schemas/email-verification.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class EmailVerification extends Document {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  fullName: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  isUsed: boolean;
}

export const EmailVerificationSchema =
  SchemaFactory.createForClass(EmailVerification);
