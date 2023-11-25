import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';


@Schema()
export class Member {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  _id: Types.ObjectId;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  avatar: string;
}

export const MemberSchema = SchemaFactory.createForClass(Member);