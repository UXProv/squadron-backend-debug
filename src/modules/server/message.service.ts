import { 
    Injectable,
    Logger,
    BadRequestException,
    NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { ServerUsersList } from "./models/serverUsersList.model";
import { Model } from "mongoose";
import { User } from "../auth/user.model";
import { CreateMessage } from "./payload/create-message.payload";
import { Message } from "./models/message.model";
import { ServerService } from "./server.service";
import { MessageRequest } from "./payload/message-request.payload";

@Injectable()
export class MessageService {
    private readonly logger = new Logger(MessageService.name)

    
    constructor(
        @InjectModel("ServerUsersList")
        private readonly serverUserListModel: Model<ServerUsersList>,
        @InjectModel("User")
        private readonly userModel: Model<User>,
        @InjectModel("Message")
        private readonly messageModel: Model<Message>,
        private readonly serverService: ServerService
    ) {}

    /**
     * Service method that creates message
     * @param { CreateMessage } CreateMEssage message, serverId, groupId and channelId
     * @returns { Promise<ChannelsList>} returns the created message
     */
    async createMessage(createMessage: CreateMessage, userReq: User): Promise<Message> {
        try {
            const [server, channelList, user] = await this.serverService.getServerChannelListUser(createMessage.serverId, userReq);

            if(!server){
                throw new NotFoundException(`Server not found`);
            }

            const member = user.servers.some(serverId => serverId.toString() === createMessage.serverId)

            if(!member){
                throw new BadRequestException(`Only members can post`)
            } else {
                const group = channelList.groups.find( group => group._id.toString() === createMessage.groupId);

                if(!group){
                    throw new NotFoundException(`Group not found`);
                } else {
                    const channel = group.channels.find(chan => chan._id.toString() === createMessage.channelId)

                    if(!channel) {
                        throw new NotFoundException(`Channel not found`);
                    } else {
                        const message = new this.messageModel({
                            userId: user._id,
                            message: createMessage.message,
                            channelId: createMessage.channelId
                        })

                        return message.save();
                    }
                }
            }
        } catch (error) {
            console.error(error);
            throw error; 
        }
    }

    /**
     * Retrieves a list of messages for a specific channel.
     * @param {MessageRequest} messageRequest - The message request, containing channelId, lastMessageId, and firstGet.
     * @returns {Promise<Message[]>} - An array of messages.
     */ 
    async getMessages(messageRequest: MessageRequest): Promise<Message[]>{
        try {
            const query = this.messageModel.find({ channelId: messageRequest.channelId });

            if (messageRequest.lastMessageId) {
                query.lt('_id', messageRequest.lastMessageId).limit(10);
            } else if (messageRequest.firstGet) {
                query.sort({ _id: -1 }).limit(30);
            } else if (!messageRequest.lastMessageId && !messageRequest.firstGet){
                query.sort({ _id: -1 }).limit(30);
            }
        
            query.sort({ _id: -1 });
        
            const messages = await query.exec();
        
            return messages;
        } catch (error) {
            console.error(error);
            throw error; 
        }
    }

}
