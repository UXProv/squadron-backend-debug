import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

import { ConfigService } from "../config/config.service";

@Injectable()
export class JwtPayloadStrategy extends PassportStrategy(Strategy, 'jwtpayload') {

  constructor(
    private readonly configService: ConfigService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get("WEBTOKEN_SECRET_KEY"),
    });
  }

  async validate(payload: any) {
    try {
      return payload;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Token expired');
      }
      throw new BadRequestException('Bad token');
    }
  }
}