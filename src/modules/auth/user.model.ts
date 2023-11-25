import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Exclude } from 'class-transformer';
import { randomBytes } from 'crypto';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose'

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({type: String, required: true, unique: true, index:true})
  email: string;

  @Prop({type: String, required: true})
  username: string;

  @Prop({type: String, required: true, unique: true, index:true})
  handle: string;

  @Prop({type: String, required: true})
  @Exclude({ toPlainOnly: true })
  password: string;

  @Prop({type: String, default: () => randomBytes(16).toString('hex')})
  @Exclude({ toPlainOnly: true })
  emailVerifCode: string;

  @Prop({type: Boolean, default: false})
  emailConfirmed: boolean;

  @Prop({type: String})
  avatarUrl: string;

  @Prop({ type: Date })
  birthdate: Date;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  friendList: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Server' }] })
  servers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Server' }] })
  ownedServers: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Server' }] })
  invites: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);

/**
* User interface
*/
export interface User extends mongoose.Document {
  id: Types.ObjectId;
  password: string;
  username: string;
  handle: string;
  email: string;
  emailVerifCode: string;
  emailConfirmed: boolean;
  avatarUrl: string;
  birthdate: Date;
  friendList: Types.ObjectId[];
  servers: Types.ObjectId[];
  ownedServers: Types.ObjectId[];
  invites: Types.ObjectId[];
}