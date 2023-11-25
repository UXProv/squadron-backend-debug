import { AuthGuard } from "@nestjs/passport";

export class AuthGuardJwtPayload extends AuthGuard('jwtpayload') { }