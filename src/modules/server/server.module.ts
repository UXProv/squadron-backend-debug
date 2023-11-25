import { Module } from "@nestjs/common";

import { ConfigService } from "../config/config.service";
import { ConfigModule } from "@nestjs/config";
import { ServerService } from "./server.service";
import { MongooseModule } from "@nestjs/mongoose";
import { ServerSchema } from "./models/server.model";
import { UserSchema } from "../auth/user.model";
import { ServerController } from "./server.controller";
import { ServerUsersListSchema } from "./models/serverUsersList.model";
import { MemberConverter } from "./models/member-converter";
import { ChannelController } from "./channel.controller";
import { ChannelGroupService } from "./channel-group.service";
import { ChannelGroupController } from "./channel-group.controller";
import { ChannelsListSchema } from "./models/channel-list.model";
import { ChannelGroupSchema } from "./models/channel-group.model";
import { ChannelSchema } from "./models/channel.model";
import { ChannelService } from "./channel.service";
import { MessageController } from "./message.controller";
import { MessageService } from "./message.service";
import { MessageSchema } from "./models/message.model";

const SERVICES = [
    ServerService,
    ChannelGroupService,
    ChannelService,
    MessageService
]

@Module({
    imports: [
        ConfigModule,
        MongooseModule.forFeature([
            { name: "Server", schema: ServerSchema },
            { name: "ServerUsersList", schema: ServerUsersListSchema },
            { name: "Channel", schema: ChannelSchema },
            { name: "ChannelGroup", schema: ChannelGroupSchema },
            { name: "ChannelsList", schema: ChannelsListSchema },
            { name: "Message", schema: MessageSchema },
            { name: "User", schema: UserSchema }
        ])
    ],
    providers: [
        ConfigService,
        MemberConverter,
        ...SERVICES
    ],
    controllers: [
        ServerController,
        ChannelGroupController,
        ChannelController,
        MessageController
    ],
    exports: [
    ],
})
export class ServerModule {}