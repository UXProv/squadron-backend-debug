import {
    Length,
    IsEmail,
    IsNotEmpty,
    MinLength,
    IsAlphanumeric,
    IsStrongPassword,
    IsLowercase,
} from 'class-validator';
import { Match } from '../../../shared/decorators/match.decorator';
  
/**
* Register Payload Class
*/
export class UserRegisterPayload {
    /**
     * Email field
     */
    @IsEmail()
    @IsNotEmpty()
    email: string;
  
    /**
     * Username field
     */
    @IsAlphanumeric()
    @IsNotEmpty()
    @MinLength(4)
    username: string;

    /**
     * Username field
     */
    @IsAlphanumeric()
    @IsNotEmpty()
    @MinLength(4)
    @IsLowercase()
    handle: string;
  
    /**
     * Password field
     */
    @IsNotEmpty()
    @IsStrongPassword({
        minLength: 8,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1,
        minUppercase: 1
    })
    password: string;
    
    @IsNotEmpty()
    @MinLength(8)
    @Match('password')
    retypedPassword: string;

    birthdate: Date;
}