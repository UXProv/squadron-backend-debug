import { 
    Injectable,
    BadRequestException, 
    NotFoundException,
    Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "../auth/user.model";
import { CreateChannel } from "./payload/create-channel.payload";
import { Server } from "./models/server.model";
import { CreateChannelGroup } from "./payload/create-channel-group.payload";
import { UpdateChannelGroup } from "./payload/update-channel-group.payload";
import { ChannelsList } from "./models/channel-list.model";
import { Channel } from "./models/channel.model";
import { ChannelGroup } from "./models/channel-group.model";
import { DeleteChannelGroup } from "./payload/delete-channel-group.payload";
import { ServerUsersList } from "./models/serverUsersList.model";
import { ServerService } from "./server.service";

//TO DO
//- createchannel
//- updateChannel (incluso position e channel group)
//- deleteChannel

@Injectable()
export class ChannelGroupService {
    private readonly logger = new Logger(ChannelGroupService.name);

    constructor(
        @InjectModel("ChannelsList")
        private readonly channelsListModel: Model<ChannelsList>,
        @InjectModel("Channel")
        private readonly channelModel: Model<Channel>,
        @InjectModel("ChannelGroup")
        private readonly channelGroupModel: Model<ChannelGroup>,
        @InjectModel("Server")
        private readonly serverModel: Model<Server>,
        @InjectModel("ServerUsersList")
        private readonly serverUserListModel: Model<ServerUsersList>,
        @InjectModel("User")
        private readonly userModel: Model<User>,
        private readonly serverService: ServerService
    ) {}

    /**
     * Service method that returns the channel list and relative channels for a server
     * @param { ServerId } serverId id of desired server
     * @returns { Promise<ChannelsList>} returns the channelList and relative channels
     */
    async getChannelListByServerId(serverId: string): Promise<ChannelsList> {
        return this.channelsListModel
            .findById( serverId )
            .exec();
    }

    /**
     * Service method that creates the channel Group
     * @param { CreateChannelGroup } CreateChannelGroup payload with name and serverId
     * @returns { Promise<ChannelsList>} returns the channelList with the new Group
     */
    async createChannelGroup(channelGroup: CreateChannelGroup, userReq: User): Promise<ChannelsList> {
        const [server, channelList, user] = await this.serverService.getServerChannelListUser(channelGroup.serverId, userReq);

        if(this.serverService.isOwner(user, server)){
            let list;

            if(!channelList){ //I create the first server channel list
                list =  new this.channelsListModel({
                    _id: channelGroup.serverId,
                    groups: []
                });
                list.groups[0] = new this.channelGroupModel({
                    name: 'default',
                    position: 0,
                    channels: []
                });
            } else {
                list = channelList;
            }

            if(channelGroup.position && channelGroup.position === 0){
                throw new BadRequestException(`Only default group can be in position 0`)
            }

            const maxPosition = list.groups.length;
            let newPosition = channelGroup.position > maxPosition ? maxPosition : channelGroup.position;

            if (newPosition <= maxPosition) { //I move successive groups up one position
                list.groups
                    .filter(group => group.position >= newPosition)
                    .forEach(group => {
                        group.position += 1;
                    });
            }
            
            list.groups.splice(newPosition, 0, new this.channelGroupModel({
                name: channelGroup.name,
                position: newPosition,
                channels: []
            }));

            return await list.save();
        } else {
            throw new BadRequestException(`Only owners can create channel groups`)
        }
        
    }

    /**
     * Service method that updates the channel Group
     * @param { UpdateChannelGroup } UpdateChannelGroup payload with channelId, name and position
     * @returns { Promise<ChannelsList>} returns the channelGroup
     */
    async updateChannelGroup(updateGroup: UpdateChannelGroup, userReq: User): Promise<ChannelsList> {
        const [server, channelList, user] = await this.serverService.getServerChannelListUser(updateGroup.serverId, userReq);

        if (this.serverService.isOwner(user, server)) {
            const channelGroup = channelList.groups.find(group => group._id.toString() === updateGroup.channelGroupId);

            if (!channelGroup) {
                throw new NotFoundException(`Channel Group not found`);
            }

            let list;

            if(!channelList){
                throw new NotFoundException(`Channel List not found`)
            } else {
                list = channelList;
            }

            if (updateGroup.name) {
                channelGroup.name = updateGroup.name;
            }

            if(updateGroup.position){
                const maxPosition = list.groups.length;
                let newPosition = updateGroup.position > maxPosition ? maxPosition : updateGroup.position;
                const groupIndex = list.groups.findIndex(group => group._id.toString() === updateGroup.channelGroupId);

                if (groupIndex >= 0) {
                    const groupToMove = list.groups.splice(groupIndex, 1)[0];

                    if(newPosition < groupToMove.position){
                        list.groups
                        .filter(group => group.position >= newPosition && group.position < groupToMove.position)
                        .forEach(group => {
                            group.position += 1;
                        }); //I move groups between the old position and the new up a position
                    } else {
                        list.groups
                        .filter(group => group.position <= newPosition && group.position > groupToMove.position)
                        .forEach(group => {
                            group.position -= 1;
                        }); //I move groups between the old position and the new up a position
                    }
                    
                    groupToMove.position = newPosition;
                    list.groups.splice(newPosition, 0, groupToMove);
                }

            }

            return await list.save();
        } else {
            throw new BadRequestException(`Only owners can update channel groups`);
        }
    }

    /**
     * Service method that returns the channel Groups and relative channels for a server
     * @param { ServerId } serverId id of desired server
     * @returns { Promise<ChannelsList>} returns the channelGroup and relative channels
     */
    async getChannelList(serverId: string, userReq: User): Promise<ChannelsList> {
        const [server, serverUsersList, channList, user] = await Promise.all([
            this.serverModel.findById(serverId).exec(),
            this.serverUserListModel.findById(serverId).exec(),
            this.channelsListModel.findById(serverId).exec(),
            this.userModel.findById(userReq.id).exec()
        ]);

        const isMember = serverUsersList.members.some(member => member._id === user._id);

        if ( server.private && !isMember) {
            throw new BadRequestException(`Only participants can view private channels`)
        } else {
            return await channList;
        }

    }
    

    /**
     * Service method that deletes a channel group.
     * @param {string} channelId - The ID of the channel group to be deleted.
     * @param {boolean} deleteChannelsToo - Whether to delete the channels in the group as well (default is false).
     * @returns {Promise<ChannelsList>} Returns the new Channel List if successful.
     */
    async deleteChannelGroup(deleteChannelGroup: DeleteChannelGroup, deleteChannelsToo: boolean = false, userReq: User): Promise<ChannelsList> {
        const [server, channelList, user] = await this.serverService.getServerChannelListUser(deleteChannelGroup.serverId, userReq);

        if (!this.serverService.isOwner(user, server)) {
            throw new BadRequestException(`Only owners can delete channel groups.`);
        } else {
            const channelGroup = channelList.groups.find(group => group._id.toString() === deleteChannelGroup.channelGroupId);

            if (!channelGroup) {
                throw new NotFoundException(`Channel Group not found`);
            }

            let list;

            if(!channelList){
                throw new NotFoundException(`Channel List not found`)
            } else {
                list = channelList;
            }

            const groupPosition = channelGroup.position

            list.groups
                .filter(group => group.position >= groupPosition)
                .forEach(group => {
                    group.position -= 1;
                });

            list.groups = list.groups.filter(group => group._id.toString() !== deleteChannelGroup.channelGroupId)
            
            if (deleteChannelsToo) {
                //delete message with those channels
                return await list.save()

            } else {
                //move channelGroup.channels to list[0].channels
                list.groups[0].channels = [...channelGroup.channels, ...list.groups[0].channels]
                return await list.save()
            }

        } 

    }

}