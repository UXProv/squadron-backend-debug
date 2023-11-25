import { IsNotEmpty } from "class-validator";

export class MessageRequest{
    @IsNotEmpty()
    channelId: string;
    lastMessageId?: string;
    firstGet?: boolean
}