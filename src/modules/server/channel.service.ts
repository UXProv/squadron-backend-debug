import { 
    BadRequestException,
    Injectable,
    Logger, 
    NotFoundException} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ChannelsList } from "./models/channel-list.model";
import { Channel } from "./models/channel.model";
import { ChannelGroup } from "./models/channel-group.model";
import { Server } from "http";
import { ServerUsersList } from "./models/serverUsersList.model";
import { User } from "../auth/user.model";
import { CreateChannel } from "./payload/create-channel.payload";
import { UpdateChannel } from "./payload/update-channel.payload";
import { ServerService } from "./server.service";

@Injectable()
export class ChannelService {
    private readonly logger = new Logger(ChannelService.name);

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
     * Service method that creates a channel Groups
     * @param { CreateChannelGroupDto } CreateChannelGroupDto name, serverId and eventually position and Group
     * @returns { Promise<ChannelsList>} returns the channelGroup and relative channels
     */
    async createChannel(createChan: CreateChannel, userReq: User): Promise<ChannelsList> {
        try{
            const [server, channelList, user] = await this.serverService.getServerChannelListUser(createChan.serverId, userReq);
            
            let list;
            if(!channelList){
                throw new NotFoundException(`Channel List not found`)
            } else {
                list = channelList;
            }

            if(this.serverService.isOwner(user, server)){
                let groupIndex = 0
                if(createChan.channelGroupId){
                    groupIndex = list.groups.findIndex(group => group._id.toString() === createChan.channelGroupId);
                } else {
                    groupIndex = 0
                }

                const maxPosition = list.groups[groupIndex].channels.length
                let position = 0
                if(createChan.position){
                    position = createChan.position > maxPosition ? maxPosition : createChan.position;
                }

                if (position <= maxPosition) {
                    list.groups[groupIndex].channels
                    .filter(channel => channel.position >= position)
                    .forEach(channel => {
                        channel.position += 1;
                    });
                }

                const createdChannel = new this.channelModel({
                    serverId: createChan.serverId,
                    type: createChan.type,
                    name: createChan.name,
                    position: position
                });

                list.groups[groupIndex].channels.splice(position, 0, createdChannel);

                return list.save();
            } else {
                throw new BadRequestException(`Only owners can create channels`)
            }
        } catch (error) {
            console.error(error);
            throw error; 
        }
    }

    /**
     * Service method that update a channel
     * @param { updateChannelDto } UpdateChannelDto serverId, channelId and groupId, plus updated values
     * @returns { Promise<ChannelsList>} returns the channelGroup and relative channels
     */
    async updateChannel(updateChan: UpdateChannel, userReq: User): Promise<ChannelsList> {
        try{
            const [server, channelList, user] = await this.serverService.getServerChannelListUser(updateChan.serverId, userReq);
         
            let list;
            if(!channelList){
                throw new NotFoundException(`Channel List not found`)
            } else {
                list = channelList;
            }

            if(this.serverService.isOwner(user, server)){
                const groupIndex = list.groups.findIndex(group => group._id.toString() === updateChan.groupId);
                const channelIndex = list.groups[groupIndex].channels.findIndex(c => c._id.toString() === updateChan.channelId);

                if(channelIndex < 0){
                    throw new NotFoundException(`Channel not found`)
                }

                if(updateChan.name){
                    list.groups[groupIndex].channels[channelIndex].name = updateChan.name;
                }

                if(updateChan.position){
                    const maxPosition = list.groups[groupIndex].channels[channelIndex].length;
                    let newPosition = updateChan.position > maxPosition ? maxPosition : updateChan.position;
                        
                    const chanToMove = list.groups[groupIndex].channels.splice(channelIndex, 1)[0];

                    if(newPosition < chanToMove.position){
                        list.groups[groupIndex].channels
                            .filter(chan => chan.position >= newPosition && chan.position < chanToMove.position)
                            .forEach(chan => {
                                chan.position += 1;
                            }); //I move groups between the old position and the new up a position
                    } else {
                        list.groups[groupIndex].channels
                            .filter(chan => chan.position <= newPosition && chan.position > chanToMove.position)
                            .forEach(chan => {
                                chan.position -= 1;
                            }); //I move groups between the old position and the new up a position
                    }

                    chanToMove.position = newPosition;
                    list.groups[groupIndex].channels.splice(newPosition, 0, chanToMove);

                }
            } else {
                throw new BadRequestException(`Only owners can update channels`)
            }
                
            return list.save();
        } catch (error) {
            console.error(error);
            throw error; 
        }
    }

    /**
     * Service method that update a channel
     * @param { updateChannelDto } UpdateChannelDto serverId, channelId and groupId, plus updated values
     * @returns { Promise<ChannelsList>} returns the channelGroup and relative channels
     */
    async deleteChannel(deleteChan: UpdateChannel, userReq: User): Promise<ChannelsList> {
        try{
            const [server, channelList, user] = await this.serverService.getServerChannelListUser(deleteChan.serverId, userReq);

            let list;
            if(!channelList){
                throw new NotFoundException(`Channel List not found`)
            } else {
                list = channelList;
            }

            if(this.serverService.isOwner(user, server)){

                const groupIndex = list.groups.findIndex(group => group._id.toString() === deleteChan.groupId);
                const channelIndex = list.groups[groupIndex].channels.findIndex(c => c._id.toString() === deleteChan.channelId);

                if(channelIndex < 0){
                    throw new NotFoundException(`Channel not found`)
                }

                const chanToDelete = list.groups[groupIndex].channels.splice(channelIndex, 1)[0];

                list.groups[groupIndex].channels
                            .filter(chan => chan.position >= chanToDelete.position )
                            .forEach(chan => {
                                chan.position -= 1;
                            });

                return list.save();

            } else {
                throw new BadRequestException(`Only owners can delete channels`)
            }

        } catch (error) {
            console.error(error);
            throw error; 
        }
    }


}