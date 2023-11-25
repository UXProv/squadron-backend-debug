import { Controller,
    Get,
    Post,
    Req,
    SerializeOptions,
    UseGuards,
    Logger,
    BadRequestException, 
    UseInterceptors,
    ClassSerializerInterceptor} from "@nestjs/common";
import { AuthGuardJwt } from './auth-guard.jwt';
import { AuthGuardLocal } from "./auth-guard.local";
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from "./auth.service";
import { CurrentUser } from "./current-user.decorator";
import { User } from "./user.model";
import { UserService } from "./user.service";

@Controller('auth')
@SerializeOptions({ strategy: 'excludeAll' })
export class AuthController {
    private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) { }

  /**
  * Logs in with username and password
  * @param { string } username
  * @param { string } password
  * @returns { Promise<User>} returns user and bearerToken 
  */
  @Post('login')
  @UseGuards(AuthGuardLocal)
  @UseInterceptors(ClassSerializerInterceptor)
  async login(@CurrentUser() user: User) {
    this.logger.debug(user);

    return {
      user: user,
      token: await this.authService.getTokenForUser(user)
    }
  }

  /**
  * Endpoint where google will redirect to (redirec URL) after authenticating a user
  * @param { User } user retrived response from google, with email and user infos
  * @returns { Promise<User>} returns the user object with JWT token
  */
  @Get('google-redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    const user = await this.userService.googleLogin(req);
    return await this.authService.getTokenForUser(user);
  }

  /**
  * Retrieves the user object
  * @param { string } token
  * @returns { Promise<User>} returns the user object 
  */
  @Get('user')
  @UseGuards(AuthGuardJwt)
  async getProfile(@CurrentUser() user: User) {
    const _user = await user;
    const { password, __v, ...userWithoutPassword } = _user.toObject();
    this.logger.debug(`getting the user`);
    this.logger.debug(_user);
    return {
      user: userWithoutPassword,
      token: await this.authService.getTokenForUser(user)
    };
  }
}