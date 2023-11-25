import { Module } from '@nestjs/common';
import { MongooseModule, MongooseModuleAsyncOptions, MongooseModuleFactoryOptions } from '@nestjs/mongoose';

import { AuthModule } from './modules/auth/auth.module';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { ConfigModule } from './modules/config/config.module';
import { ConfigService } from './modules/config/config.service';
import { ServerModule } from './modules/server/server.module';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ ConfigModule ],
      inject: [ ConfigService ],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get("DB_URL"),
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as MongooseModuleFactoryOptions),
    }),
    ConfigModule,
    AuthModule,
    SharedModule,
    ServerModule,
  ],
  controllers: [
    AppController
  ],
  providers: [
    AppService
  ],
})
export class AppModule {}