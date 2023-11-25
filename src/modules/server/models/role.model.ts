import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose'

@Schema()
export class Role {
  @Prop({ type: Types.ObjectId, ref: 'Role' })
  id: Types.ObjectId;

  @Prop({ type: String })
  name: string;

  @Prop({ type: Number })
  level: number;

  @Prop({ type: [String] }) // Array di permessi
  permissions: string[];
}