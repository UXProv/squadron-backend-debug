import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose'
import { Member, MemberSchema } from './member.model';
import { ServerUsersList } from './serverUsersList.model';

export type ServerDocument = Server & Document;

@Schema()
export class Server {
    @Prop({type: String, required: true})
    name: string;

    @Prop({type: String})
    description: string;

    @Prop({type: String})
    avatar: string;

    @Prop({type: String})
    coverImage: string;

    @Prop({ type: [MemberSchema], default: [] })
    owners: Member[];

    @Prop({type: Boolean, default: false})
    private: boolean;
}

export const ServerSchema = SchemaFactory.createForClass(Server);

export interface Server extends mongoose.Document {
    id: string;
    description: string;
    avatar: string;
    coverImage: string;
    owners: Member[];
    members: Member[];
    invites: Member[];
    private: boolean;
}

export class ServerPreview {
    constructor(
        public id: string,
        public name: string,
        public avatar: string
    ){}
}

export class CompleteServer {
    constructor(
        public server: Server,
        public serverUsersList: ServerUsersList    
    ){}
}