import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Channel, ChannelSchema } from './channel.model';

@Schema()
export class ChannelGroup {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: Number, required: true })
    position: number;

    @Prop({ type: [ChannelSchema] })
    channels: Channel[];
}

export interface ChannelGroup {
    _id: string;
    name: string;
    position: number;
    channels: Channel[];
}

export const ChannelGroupSchema = SchemaFactory.createForClass(ChannelGroup);