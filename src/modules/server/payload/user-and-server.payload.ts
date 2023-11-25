import { IsNotEmpty } from "class-validator";

export class UserAndServerPayload {
    @IsNotEmpty()
    serverId: string;
    @IsNotEmpty()
    userId: string;
}