import { IsNotEmpty } from "class-validator";

export class UpdateChannelGroup {
    @IsNotEmpty()
    serverId: string;
    @IsNotEmpty()
    channelGroupId: string;
    name?: string;
    position?: number;
}