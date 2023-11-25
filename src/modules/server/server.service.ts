import { 
    Injectable,
    NotFoundException,
    BadRequestException,
    ForbiddenException,
    Logger,
    HttpStatus
} from '@nestjs/common';
import { CompleteServer, Server, ServerPreview } from './models/server.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { ServerRegisterPayload } from './payload/register.payload';
import { User } from '../auth/user.model';
import { Member } from './models/member.model';
import { MemberConverter } from './models/member-converter';
import { ServerUsersList } from './models/serverUsersList.model';
import { ServerUpdatePayload } from './payload/update.payload';
import { validate } from 'class-validator';
import { UserAndServerPayload } from './payload/user-and-server.payload';
import { ChannelsList } from './models/channel-list.model';

// TO DO
// - create unique call for [server, serverUserList, user]

@Injectable()
export class ServerService {
    private readonly logger = new Logger(ServerService.name);

    constructor(
        @InjectModel("Server")
        private readonly serverModel: Model<Server>,
        @InjectModel("ServerUsersList")
        private readonly serverUsersListModel: Model<ServerUsersList>,
        @InjectModel("ChannelsList")
        private readonly channelsListModel: Model<ChannelsList>,
        @InjectModel("User")
        private readonly userModel: Model<User>,
        private readonly memberConverter: MemberConverter,
    ){}

    
    /**
     * Service method that returns the server and a user
     * @param { ServerId } serverId id of desired server
     * @param { user } user desired user
     * @returns { Promise<[Server, User]>} returns user and server
     */
    async getServerAndUser(serverId: string, userReq: User): Promise<[Server, User]>{
        const [server, user] = await Promise.all([
            this.serverModel.findById(serverId).exec(),
            this.userModel.findById(userReq.id).exec()
        ]);

        return [server, user]
    }

    /**
     * Service method that returns the server, ChannelGroup and a user
     * @param { ServerId } serverId id of desired server
     * @param { user } user desired user
     * @returns { Promise<[Server, ChannelsList, User]>} returns server, user and channelList
     */
    async getServerChannelListUser(serverId: string, userReq: User): Promise<[Server, ChannelsList, User]>{
        const [server, channList, user] = await Promise.all([
            this.serverModel.findById(serverId).exec(),
            this.channelsListModel.findById(serverId).exec(),
            this.userModel.findById(userReq.id).exec()
        ]);
    
        return [server, channList, user]
    }

    /**
     * Service method that returns if a user is owner of that server
     * @param { user } user
     * @param { Server } server 
     * @returns { boolean } true or false
     */
    isOwner(user: User, server: Server): boolean {
        return server.owners.some(member => member._id === user.id);
    }

    /**
     * Endpoint that returns a single server info
     * @param { id } id id of desired server
     * @param { user } user the user requesting the server
     * @returns { Promise<Server>} returns the desired server object
     */
    async getServerById(id: string, userReq: User): Promise<CompleteServer> {
        const [server, serverUserList, user] = await Promise.all([
            this.serverModel.findById(id).exec(),
            this.serverUsersListModel.findById(id).exec(),
            this.userModel.findById(userReq.id).exec()
        ]);
        if (!server) {
            throw new NotFoundException('Server not found');
        }
        const isMember = serverUserList.members.some(member => member._id === user._id);
        const isInvited = serverUserList.invites.some(member => member._id === user._id);
        if(server.private && (!isMember || !isInvited)){
            throw new BadRequestException(`You must be invited or a member to view a private server`)
        }
        return new CompleteServer(server, serverUserList);
    }

    /**
     * Endpoint that returns a single server info
     * @param { user } user the user requesting the server
     * @returns { Promise<CompleteServer[]>} returns the desired serverPreview[] object
     */
    async getServersPreviews( user: User ): Promise<ServerPreview[]> {
        try {
            this.logger.debug('user', user)
            const populatedUser = await this.userModel.findById(user.id)
                .populate({
                    path: 'servers',
                    select: 'name avatar _id',
                })
                .exec();
        
            const serverPreviews: ServerPreview[] = populatedUser.servers.map((server: any) => new ServerPreview(server._id, server.name, server.avatar));
            return serverPreviews;
        } catch (error) {
            throw new Error('There was a problem retrieving the servers previews.');
        }
    }

    /**
     * Endpoint that creates a server
     * @param { ServerRegisterPayload } ServerRegisterPayload creates a server
     * @param { string } owner the id of the user creating the server
     * @returns { Promise<Server>} returns the desired server object
     */
    async createServer(payload: ServerRegisterPayload, owner: User){
        try {
            const member = this.memberConverter.userToMember(owner);

            const createdServer = await this.serverModel.create({
                ...payload,
                owners: [member],
            });

            const createdServerUserList = await this.serverUsersListModel.create({
                _id: createdServer.id,
                members: [member],
                invites: []
            });

            owner.servers.push(createdServer.id);
            owner.ownedServers.push(createdServer.id);
            await owner.save();
            
            return createdServer
        } catch (error) {
      
            console.error(error);
            throw error;
        }
    }

    /**
     * Endpoint that updates a server 
     * @param { ServerUpdatePayload } ServerUpdatePayload name, description, avatar or image
     * @returns { Promise<Server>} returns the desired server object
     */
    async updateServer(serverId: string, payload: ServerUpdatePayload, user: User){
        try {

            //Validating fields
            const errors = await validate(payload);

            if (errors.length > 0) {
                throw new BadRequestException('Validation failed', JSON.stringify(errors));
            }

            //Recovering server for update
            const existingServer = await this.serverModel.findById(serverId);
            this.logger.debug(user)
            this.logger.debug(existingServer)

            if (!existingServer) {
                throw new NotFoundException('Server not found');
            }

            const isOwner = existingServer.owners.some(owner => owner._id === user.id);


            if (!isOwner) {
                throw new ForbiddenException('You are not the owner of this server');
            }

            // Applying edits
            if (payload.name) {
                existingServer.name = payload.name;
            }
            if (payload.description) {
                existingServer.description = payload.description;
            }
            if (payload.avatar) {
                existingServer.avatar = payload.avatar;
            }
            if (payload.coverImage) {
                existingServer.coverImage = payload.coverImage;
            }
            if (payload.private) {
                existingServer.private = payload.private;
            }

            const updatedServer = await existingServer.save();

            return updatedServer;

        } catch (error) {

            console.error(error);
            throw error; 
        }
    }

    /**
     * Endpoint that deletes a server 
     * @param { serverId } serverId id of the server
     * @param { user } user that owns the server to delete
     * @returns { Promise<Server>} returns the desired server object
     */
    async deleteServer(serverId: string, user: User){
        try {
            const existingServer = await this.serverModel.findById(serverId);
            const isOwner = existingServer.owners.some(owner => owner._id === user.id);
            
            if (!existingServer) {
                throw new NotFoundException('Server not found');
            }

            if (!isOwner) {
                throw new ForbiddenException('Only the owners of this server can delete it');
            }
            
            const deletedServer = await this.serverModel.deleteOne({_id: serverId})
            const deletedServerUserList = await this.serverUsersListModel.deleteOne({_id: serverId})
 
            return {deletedServer, deletedServerUserList}
        } catch (error) {
            console.error(error);
            throw error; 
        }
    }
    
    /**
     * Endpoint to join a server 
     * @param { serverId } serverId id of the server
     * @param { user } user that wants to join
     * @returns { Promise<CompleteServer>} returns the desired server object
     */
    async joinServer(serverId: string, user: User): Promise<CompleteServer>{
        try {
            this.logger.debug('user', user)
            const [existingServer, existingServerUserList] = await Promise.all([
                this.serverModel.findById(serverId).exec(),
                this.serverUsersListModel.findById(serverId).exec(),
            ]);

            if (!existingServer || !existingServerUserList) {
                throw new NotFoundException('Server not found');
            };

            const isUserInvited = existingServerUserList.invites.some(member => member._id === user.id);
            if(!isUserInvited && existingServer.private){
                throw new BadRequestException('This is a private server and you lack an invite');
            }
            
            if(isUserInvited){
                const index = existingServerUserList.invites.findIndex(member => member._id === user.id);
                if (index !== -1) {
                  existingServerUserList.invites.splice(index, 1);
                }
            };

            const isUserAlreadyMember = existingServerUserList.members.some(member => member._id === user.id);
            if (!isUserAlreadyMember) {
                existingServerUserList.members.push(this.memberConverter.userToMember(user));
            } else {
                throw new BadRequestException('You already are part of this server');
            }

            if(!user.servers.includes(existingServer._id)){
                user.servers.push(existingServer._id)
            };

            if(user.invites.includes(existingServer._id)){
                const index = user.invites.indexOf(user._id);
                if (index !== -1) {
                    user.invites.splice(index, 1);
                };
            };

            existingServerUserList.save();
            user.save();

            return new CompleteServer(existingServer, existingServerUserList);

        } catch (error) {
            console.error(error);
            throw error; 
        }
    }

    /**
     * Endpoint to leave a server 
     * @param { serverId } serverId id of the server
     * @param { user } user that wants to leave
     * @returns { Promise<any>} returns a message for success
     */
    async leaveServer(serverId: string, user: User): Promise<any>{
    try{
        const [existingServer, existingServerUserList] = await Promise.all([
            this.serverModel.findById(serverId).exec(),
            this.serverUsersListModel.findById(serverId).exec(),
        ]);

        if (existingServerUserList) {

            const isOwner = existingServer.owners.some(member => member._id === user.id);
            const isUserInvited = existingServerUserList.invites.some(member => member._id === user.id);
            const isMember = existingServerUserList.members.some(member => member._id === user.id);
            const invited = user.invites.includes(existingServer._id);
            const member = user.servers.includes(existingServer._id);

            if(!isOwner && !isUserInvited && !isMember && !invited && !member){
                return {status: 200, message: 'You were already removed from the server'}
            }
            if(isOwner){
                const index = existingServer.owners.findIndex(member => member._id === user.id);
                this.logger.debug('index', index)

                if (index !== -1) {
                    existingServer.owners.splice(index, 1);
                }
            }
            
            if(isUserInvited){
                const index = existingServerUserList.invites.findIndex(member => member._id === user.id);
                if (index !== -1) {
                  existingServerUserList.invites.splice(index, 1);
                }
            };

            if(isMember){
                const index = existingServerUserList.members.findIndex(member => member._id === user.id);
                if (index !== -1) {
                  existingServerUserList.members.splice(index, 1);
                }
            };

            if(invited){
                const index = user.invites.findIndex(id => id.toString() === serverId);
                if (index !== -1) {
                    user.invites.splice(index, 1);
                }
            };

            if(member){
                const index = user.servers.findIndex(id => id.toString() === serverId);
                if (index !== -1) {
                    user.servers.splice(index, 1);
                }
            };

        };

        return await Promise.all([
            existingServer.save(),
            existingServerUserList.save(),
            user.save(),
        ]);

    } catch (error) {
            console.error(error);
            throw error; 
        }
    }

    /**
     * Endpoint to leave a server 
     * @param { UserAndServerPayload } payload the serverId and the user to invite
     * @returns { Promise<any>} returns a message for success
     */
    async inviteToServer(payload: UserAndServerPayload, user: User): Promise<any>{
        try{
            const [existingServer, existingServerUserList, invitedUser] = await Promise.all([
                this.serverModel.findById(payload.serverId).exec(),
                this.serverUsersListModel.findById(payload.serverId).exec(),
                this.userModel.findById(payload.userId).exec()
            ]);

            if(!existingServer || !existingServerUserList){
                throw new NotFoundException(`Server not found`)
            }

            if(!invitedUser){
                throw new NotFoundException(`User not found`)
            }

            const isOwner = existingServer.owners.some(member => member._id === user.id);
            if(!isOwner && existingServer.private){
                throw new BadRequestException(`Only owners can invite to private servers`)
            };

            const hostIsMember = existingServerUserList.members.some(member => member._id === user.id);
            if(!hostIsMember){
                throw new BadRequestException(`You can only invite to servers you already joined`)
            };

            const alreadyMember = existingServerUserList.members.some(member => member._id === invitedUser.id);
            const alreadyInvited = existingServerUserList.invites.some(member => member._id === invitedUser.id);
            if(alreadyMember){
                throw new BadRequestException(`The user you tried to invite is already a member`)
            };
            if(alreadyInvited){
                throw new BadRequestException(`The user you tried to invite is already invited`)
            };

            existingServerUserList.invites.push(this.memberConverter.userToMember(invitedUser))

            return existingServerUserList.save();
        } catch (error) {
            console.error(error);
            throw error; 
        }
    }

    
    /**
     * Endpoint to add a owner
     * @param { UserAndServerPayload } payload the serverId and the user to add
     * @returns { Promise<Server>} returns the desired server
     */
    async addOwner(payload: UserAndServerPayload, user: User): Promise<Server>{
        try{
            const [existingServer, invitedUser] = await Promise.all([
                this.serverModel.findById(payload.serverId).exec(),
                this.userModel.findById(payload.userId).exec()
            ]);

            
            if(!existingServer){
                throw new NotFoundException(`Server not found`);
            }

            if(!invitedUser){
                throw new NotFoundException(`User not found`);
            }

            const isOwner = existingServer.owners.some(member => member._id === user.id);
            if(!isOwner && existingServer.private){
                throw new BadRequestException(`Only owners can add new owners`);
            };

            const invitedIsOwner = existingServer.owners.some(member => member._id === invitedUser.id);
            if(invitedIsOwner){
                throw new BadRequestException(`The invited member is already a owner`);
            } else {
                existingServer.owners.push(this.memberConverter.userToMember(invitedUser));
                return existingServer.save()
            };

        } catch (error) {
            console.error(error);
            throw error; 
        }
    }

       
    /**
     * Endpoint to remove an owner
     * @param { UserAndServerPayload } payload the serverId and the user to remove
     * @returns { Promise<Server>} returns the desired server
     */
    async removeOwner(payload: UserAndServerPayload, user: User): Promise<Server>{
        try{
            const [existingServer, userToRemove] = await Promise.all([
                this.serverModel.findById(payload.serverId).exec(),
                this.userModel.findById(payload.userId).exec()
            ]);
   
            if(!existingServer){
                throw new NotFoundException(`Server not found`);
            }

            if(!userToRemove){
                throw new NotFoundException(`User not found`);
            }

            const isOwner = existingServer.owners.some(member => member._id === user.id);
            if(!isOwner && existingServer.private){
                throw new BadRequestException(`Only owners can remove other owners`);
            };

            const userToRemoveIsOwner = existingServer.owners.some(member => member._id === userToRemove.id);
            if(userToRemoveIsOwner){
                existingServer.owners = existingServer.owners.filter(owner => owner._id !== userToRemove.id);
                return existingServer.save();
            } else {
                throw new BadRequestException(`The user to remove is not an owner`);
            };

        } catch (error) {
            console.error(error);
            throw error; 
        }
    }
}