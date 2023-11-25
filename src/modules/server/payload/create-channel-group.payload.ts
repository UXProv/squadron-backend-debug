import { IsNotEmpty } from "class-validator";

export class CreateChannelGroup {
    @IsNotEmpty()
    serverId: string;
    @IsNotEmpty()
    name: string;
    position?: number;
}