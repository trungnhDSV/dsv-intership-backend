import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { DocumentMember, DocumentMemberSchema } from './document-member.schema';

@Schema({
  toJSON: {
    transform: (_, ret) => {
      ret.id = ret._id;
      ret.name = ret.name.replace('.pdf', '');
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
})
export class PDFDocument extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  ownerId: mongoose.Schema.Types.ObjectId;

  @Prop({ type: Number })
  fileSize?: number;

  @Prop({ required: true })
  s3Key: string;

  @Prop({ type: Date, default: Date.now })
  uploadedAt: Date;

  @Prop({ type: String })
  ownerName: string;

  @Prop({ type: [DocumentMemberSchema], default: [] })
  members: DocumentMember[];
}

export const PDFDocumentSchema = SchemaFactory.createForClass(PDFDocument);
