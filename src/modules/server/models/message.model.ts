import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';


@Schema()
export class Message {
    @Prop({ type: String, required: true })
    userId: string;

    @Prop({ type: String, required: true })
    message: string;

    @Prop({ type: Date, default: Date.now })
    updatedAt: Date;

    @Prop({ type: String, required: true })
    channelId: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
MessageSchema.index({ channelId: 1, createdAt: 1, _id: 1 });