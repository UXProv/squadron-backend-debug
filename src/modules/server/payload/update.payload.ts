import {
    IsNotEmpty,
    MinLength,
} from 'class-validator';

export class ServerUpdatePayload {

    @IsNotEmpty()
    _id: string;
    
    //@IsAlphanumeric()
    @MinLength(4)
    name?: string;

    description?: string;

    avatar?: string;

    coverImage?: string;

    private?: boolean;
}