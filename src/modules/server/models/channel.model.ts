import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


enum ChannelType {
    Chat = 1,
    Announcements,
    Voice,
    AdvancedVoice,
}

@Schema()
export class Channel {
    @Prop({ type: String, required: true })
    name: string;

    @Prop({ type: Number, enum: ChannelType, required: true })
    type: number;

    @Prop({ type: Number, required: true })
    position: number;
}

export interface Channel {
    _id: string
    name: string;
    type: number;
    position: number;
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);