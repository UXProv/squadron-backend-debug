import { IsNotEmpty } from "class-validator";

export class CreateChannel {
    @IsNotEmpty()
    serverId: string;
    @IsNotEmpty()
    type: number;
    @IsNotEmpty()
    name: string;
    position?: number;
    channelGroupId?: string;
}