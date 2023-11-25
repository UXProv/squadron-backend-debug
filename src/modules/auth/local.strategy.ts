import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import * as bcrypt from "bcrypt";
import { Strategy } from "passport-local";

import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "./user.model";
import { UserService } from "./user.service";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(LocalStrategy.name);

  constructor(
    private readonly userService: UserService
  ) {
    super();
  }

  public async validate(
    username: string, password: string
  ): Promise<any> {
    this.logger.debug(`User ${username} with password ${password} is trying to log in`);

    const user = await this.userService.getByUsername(username);

    if (!user) {
      this.logger.debug(`User ${username} not found!`);
      throw new UnauthorizedException('Invalid username or password. Please try again.');
    }

    if (!(await bcrypt.compare(password, user.password))) {
      this.logger.debug(`Invalid credentials for user ${username}`);
      throw new UnauthorizedException('Invalid username or password. Please try again.');
    }

    return user;
  }
}