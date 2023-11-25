import { IsNotEmpty } from "class-validator";

export class UpdateChannel {
    @IsNotEmpty()
    serverId: string;
    @IsNotEmpty()
    groupId: string;
    @IsNotEmpty()
    channelId: string;
    name?: string;
    position?: number;
    newGroupId?: string;
}