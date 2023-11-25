import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ChannelGroup, ChannelGroupSchema } from './channel-group.model';

@Schema()
export class ChannelsList {
    author: { type: Types.ObjectId, required: true, ref: 'Server' }
    _id: Types.ObjectId;

    @Prop({ type: [ChannelGroupSchema] })
    groups: ChannelGroup[];
}

export const ChannelsListSchema = SchemaFactory.createForClass(ChannelsList);
ChannelsListSchema.index({ serverId: 1 });

export interface ChannelsList extends Document {
    _id: Types.ObjectId;
    groups: ChannelGroup[];
}