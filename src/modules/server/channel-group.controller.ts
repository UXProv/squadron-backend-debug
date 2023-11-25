import { 
    Controller,
    Logger,
    Post,
    Get,
    Patch,
    Param,
    Body,
    UseGuards, 
    Delete,
    UsePipes,
    ValidationPipe} from "@nestjs/common";
import { ChannelGroupService } from "./channel-group.service";

import { CurrentUser } from "../auth/current-user.decorator";
import { AuthGuardJwtPayload } from "../auth/auth-guard.jwtpayload";
import { CreateChannelGroup } from "./payload/create-channel-group.payload";
import { UpdateChannelGroup } from "./payload/update-channel-group.payload";
import { DeleteChannelGroup } from "./payload/delete-channel-group.payload";
import { ChannelsList } from "./models/channel-list.model";

@Controller('channel-group')
export class ChannelGroupController {
    private readonly logger = new Logger(ChannelGroupController.name);

    constructor(
        private readonly channelService: ChannelGroupService
    ) {}

    /**
     * Endpoint that creates a channel Group
     * @param { CreateChannelGroup } CreateChannelGroupDto name, serverId and eventually position of the Group
     * @returns { Promise<ChannelGroup[]>} returns the channelGroup and relative channels
     */
    @Post('/create')
    @UseGuards(AuthGuardJwtPayload)
    @UsePipes(new ValidationPipe())
    async createChannelGroup(
        @Body() channelGroup: CreateChannelGroup,
        @CurrentUser() userReq: any
    ): Promise<ChannelsList> {
        return await this.channelService.createChannelGroup(channelGroup, userReq);
    }

    /**
     * Endpoint that updates the channel Group
     * @param { UpdateChannelGroup } UpdateChannelGroup payload with channelId, name and position
     * @returns { Promise<ChannelGroup[]>} returns the channelGroup and relative channels
     */
    @Patch()
    @UseGuards(AuthGuardJwtPayload)
    @UsePipes(new ValidationPipe())
    async updateChannelGroup(
        @Body() updateGroup: UpdateChannelGroup,
        @CurrentUser() userReq: any
    ): Promise<ChannelsList> {
        return await this.channelService.updateChannelGroup(updateGroup, userReq);
    }

    /**
     * Endpoint that returns the channel Groups list and relative channels for a server
     * @param { ServerId } serverId id of desired server
     * @returns { Promise<ChannelsList>} returns the channel Groups list and relative channels
     */
    @Get('/:serverId')
    @UseGuards(AuthGuardJwtPayload)
    @UsePipes(new ValidationPipe())
    async getChannelsGroupsByServerId(
        @Param('serverId') serverId: string,
        @CurrentUser() userReq: any
    ): Promise<ChannelsList> {
        return await this.channelService.getChannelList(serverId, userReq);
    }

    /**
     * Endpoint that deletes a channel group.
     * @param {string} id - The ID of the channel group to be deleted.
     * @param {boolean} deleteChannelsToo - Whether to delete the channels in the group as well (default is false).
     * @returns {Promise<ChannelsList>} Returns nothing if successful.
     */
    @Delete()
    @UseGuards(AuthGuardJwtPayload)
    @UsePipes(new ValidationPipe())
    async deleteChannelGroup(
        @Body() deleteGroup: DeleteChannelGroup,
        @CurrentUser() userReq: any
    ): Promise<ChannelsList> {
        return await this.channelService.deleteChannelGroup(
            deleteGroup,
            deleteGroup.deleteChannels ? deleteGroup.deleteChannels : false,
            userReq
        );
    }
}