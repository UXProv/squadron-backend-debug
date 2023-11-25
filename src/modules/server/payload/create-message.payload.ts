import { IsNotEmpty } from "class-validator";

export class CreateMessage {
    @IsNotEmpty()
    message: string;
    @IsNotEmpty()
    serverId: string;
    @IsNotEmpty()
    groupId: string;
    @IsNotEmpty()
    channelId: string;
}