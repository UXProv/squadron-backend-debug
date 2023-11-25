import { IsNotEmpty } from "class-validator";

export class DeleteChannelGroup {
    @IsNotEmpty()
    serverId: string;
    @IsNotEmpty()
    channelGroupId: string;
    deleteChannels?: boolean;
}