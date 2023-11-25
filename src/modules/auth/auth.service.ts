import { Injectable, Logger } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { User } from "./user.model";
import { ConfigService } from "../config/config.service";

@Injectable()
export class AuthService {
    private static readonly logger = new Logger(AuthService.name);

    /**
     * Time in seconds when the token is to expire
     * @type {string}
     */
    private readonly expiration: string = "3600"; //60 per 1m, 3600 per 60m, 172800 per 2gg

    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {
        this.expiration = this.configService.get("WEBTOKEN_EXPIRATION_TIME");
    }

    /**
     * Creates a signed jwt token based on User payload
     * @param { User } param dto to generate token from
     * @returns { ITokenReturnBody } returns the JWT token
     */
    public async getTokenForUser(user: User): Promise<ITokenReturnBody> {
        AuthService.logger.debug(`User ${user} for JWT generation`);
        AuthService.logger.debug(`Expiration time ${this.expiration}`);

        return {
            expires: this.expiration,
            expiresPrettyPrint: AuthService.prettyPrintSeconds(this.expiration),
            token: this.jwtService.sign({
                id: user.id,
                username: user.username,
                email: user.email
            })
        };
    }

    /**
     * Formats the time in seconds into human-readable format
     * @param {string} time
     * @returns {string} a human readable time string
     */
    private static prettyPrintSeconds(time: string): string {
        this.logger.debug(`Time ${time} for generating human readable string`);

        const ntime = Number(time);
        const hours = Math.floor(ntime / 3600);
        const minutes = Math.floor((ntime % 3600) / 60);
        const seconds = Math.floor((ntime % 3600) % 60);

        return `${hours > 0 ? hours + (hours === 1 ? " hour," : " hours,") : ""} ${
        minutes > 0 ? minutes + (minutes === 1 ? " minute" : " minutes") : ""
        } ${seconds > 0 ? seconds + (seconds === 1 ? " second" : " seconds") : ""}`;
    }

    /**
     * Decrypts the password 
     * @param {string} password
     * @returns {string} hashed password
     */
    public async hashPassword(password: string): Promise<string> {
        return await bcrypt.hash(password, 10);
    }

}

/**
* Token return body
*/
export interface ITokenReturnBody {
    /**
     * When the token is to expire in seconds
     */
    expires: string;
    /**
     * A human-readable format of expires
     */
    expiresPrettyPrint: string;
    /**
     * The Bearer token
     */
    token: string;
}