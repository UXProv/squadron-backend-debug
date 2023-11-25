import { 
  Body,
  Controller,
  Get,
  Param,
  Post,
  UseGuards,
  ValidationPipe } from "@nestjs/common";
import { AuthService, ITokenReturnBody } from "./auth.service";
import { UserRegisterPayload } from "./payload/register.payload";
import { UserService } from "./user.service";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "./user.model";
import { AuthGuardJwt } from "./auth-guard.jwt";
import { CurrentUser } from "./current-user.decorator";


/**
 * Profile Controller
 */
@Controller('/user')
export class UserController {
  constructor(
    @InjectModel("User")
    private readonly userModel: Model<User>,
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) { }

  /**
   * Registration route to create and generate tokens for users
   * @param {UserRegisterPayload} payload the registration dto
   * @returns {Promise<ITokenReturnBody>} returns the bearer token
   */
  @Post('register')
  async register(
    @Body(new ValidationPipe()) payload: UserRegisterPayload
  ): Promise<{user: User, token: ITokenReturnBody}> {
    const user = await this.userService.create(payload);
    const token = await this.authService.getTokenForUser(user)
    return {user: user, token: token};
  }

  /**
   * Endpoint to leave a server
   * @param {serverId} serverId that user intend to join
   * @returns { Promise<Server>} returns the desired server
   */
  @Post('/refuse-invite/:id')
  @UseGuards(AuthGuardJwt)
  async leaveServer(
    @Param('id') serverId: string,
    @CurrentUser() user: User
  ): Promise<void>{
    const inviteRefused = await this.userService.refuseInvite(serverId, user);
    return inviteRefused
  }
}