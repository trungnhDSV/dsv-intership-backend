import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

export type MemberRole = 'viewer' | 'editor';

@Schema({ _id: false })
export class DocumentMember {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: String, enum: ['viewer', 'editor'], required: true })
  role: MemberRole;
}

export const DocumentMemberSchema =
  SchemaFactory.createForClass(DocumentMember);
