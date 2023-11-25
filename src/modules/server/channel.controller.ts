import { 
    Controller,
    Logger,
    Post,
    Delete,
    Body,
    UseGuards,
    UsePipes,
    ValidationPipe } from "@nestjs/common";
import { CreateChannel } from "./payload/create-channel.payload";

import { CurrentUser } from "../auth/current-user.decorator";
import { AuthGuardJwtPayload } from "../auth/auth-guard.jwtpayload";
import { Channel } from "./models/channel.model";
import { ChannelService } from "./channel.service";
import { ChannelsList } from "./models/channel-list.model";
import { UpdateChannel } from "./payload/update-channel.payload";

@Controller('channel')
export class ChannelController {
    private readonly logger = new Logger(ChannelController.name);

    constructor(
        private readonly channelService: ChannelService
    ) {}

    //Channel groups

    /**
     * Endpoint that returns the channel Groups and relative channels for a server
     * @param { ServerId } serverId id of desired server
     * @returns { Promise<ChannelsList>} returns the users server array
     */
    @Post('/create')
    @UseGuards(AuthGuardJwtPayload)
    @UsePipes(new ValidationPipe())
    async createChannel(
        @Body() channelDto: CreateChannel,
        @CurrentUser() userReq: any
    ): Promise<ChannelsList> {
        return this.channelService.createChannel(channelDto, userReq);
    }

    /**
     * Endpoint that update a channel
     * @param { updateChannelDto } UpdateChannelDto serverId, channelId and groupId, plus updated values
     * @returns { Promise<ChannelsList>} returns the channelGroup and relative channels
     */
    @Post('/update')
    @UseGuards(AuthGuardJwtPayload)
    @UsePipes(new ValidationPipe())
    async updateChannel(
        @Body() channelDto: UpdateChannel,
        @CurrentUser() userReq: any
    ): Promise<ChannelsList> {
        return this.channelService.updateChannel(channelDto, userReq);
    }

    /**
     * Endpoint that delete a channel
     * @param { updateChannelDto } UpdateChannelDto serverId, channelId and groupId, plus updated values
     * @returns { Promise<ChannelsList>} returns the channelGroup and relative channels
     */
    @Delete()
    @UseGuards(AuthGuardJwtPayload)
    @UsePipes(new ValidationPipe())
    async deleteChannel(
        @Body() channelDto: UpdateChannel,
        @CurrentUser() userReq: any
    ): Promise<ChannelsList> {
        return this.channelService.deleteChannel(channelDto, userReq);
    }

}