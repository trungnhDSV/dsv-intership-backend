import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.s3Key;
      return ret;
    },
  },
})
export class PDFDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  ownerId: string;

  @Prop({ type: Number })
  fileSize?: number;

  @Prop({ required: true })
  s3Key: string;

  @Prop({ type: Date, default: Date.now })
  uploadedAt: Date;
}

export const PDFDocumentSchema = SchemaFactory.createForClass(PDFDocument);
