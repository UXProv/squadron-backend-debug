import {
    IsNotEmpty,
    MinLength,
    IsAlphanumeric,
} from 'class-validator';

export class ServerRegisterPayload {
    /**
     * Servername field
     */
    //@IsAlphanumeric()
    @IsNotEmpty()
    @MinLength(4)
    name: string;
}