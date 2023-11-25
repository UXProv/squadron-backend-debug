import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule } from '../config/config.module';

import { UserSchema } from './user.model';

import { AuthService } from './auth.service';
import { UserService } from './user.service';

import { UserController } from './user.controller';
import { AuthController } from './auth.controller';

import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '../config/config.service';
import { JwtPayloadStrategy } from './jwtpayload.strategy';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: "User", schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get("WEBTOKEN_SECRET_KEY"),
        signOptions: {
          expiresIn: Number(configService.get("WEBTOKEN_EXPIRATION_TIME")),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    UserController,
    AuthController
  ],
  providers: [
    AuthService,
    UserService,
    LocalStrategy,
    JwtStrategy,
    JwtPayloadStrategy,
  ]
})
export class AuthModule {}