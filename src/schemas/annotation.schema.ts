import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Annotation extends Document {
  @Prop({ required: true, index: true })
  docId: string; // Document PDF Id

  @Prop({ required: true })
  s3Key: string; // Đường dẫn/key file XFDF trên S3
}

export const AnnotationSchema = SchemaFactory.createForClass(Annotation);
