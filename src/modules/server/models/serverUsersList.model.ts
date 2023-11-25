import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Member, MemberSchema } from './member.model';

@Schema()
export class ServerUsersList {
    author: { type: Types.ObjectId, required: true, ref: 'server' }
    _id: Types.ObjectId;

    @Prop({ type: [MemberSchema], default: [] })
    members: Member[];

    @Prop({ type: [MemberSchema], default: [] })
    invites: Member[];
}

export const ServerUsersListSchema = SchemaFactory.createForClass(ServerUsersList);
ServerUsersListSchema.index({ serverId: 1 });

export interface ServerUsersList extends Document {
    _id: Types.ObjectId;
    members: Member[];
    invites: Member[];
}