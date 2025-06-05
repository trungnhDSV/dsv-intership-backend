import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false }) // subdocument
export class GoogleDriveInfo {
  @Prop({ required: true })
  fileId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  accountId: string;

  @Prop()
  mimeType?: string;
}

export const GoogleDriveInfoSchema =
  SchemaFactory.createForClass(GoogleDriveInfo);
