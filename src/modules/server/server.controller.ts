import { 
    Controller,
    Get,
    Post,
    Patch,
    Param,
    Body,
    Request,
    ValidationPipe,
    UseGuards,
    Logger, 
    Delete} from "@nestjs/common";

import { ServerRegisterPayload } from "./payload/register.payload";
import { ServerUpdatePayload } from "./payload/update.payload";
import { UserAndServerPayload } from "./payload/user-and-server.payload";

import { AuthGuardJwt } from "../auth/auth-guard.jwt";
import { CurrentUser } from "../auth/current-user.decorator";

import { ServerService } from "./server.service";

import { User } from "../auth/user.model";
import { CompleteServer, Server, ServerPreview } from "./models/server.model";
import { AuthGuardJwtPayload } from "../auth/auth-guard.jwtpayload";

@Controller('/server')
export class ServerController {
    private readonly logger = new Logger(ServerController.name);

    constructor(
        private readonly serverService: ServerService,
        //private readonly authService: AuthService,
        //private readonly userService: UserService,
    ) { }

    /**
     * Endpoint that returns the servers preview for the user
     * @returns { Promise<CompleteServer[]>} returns the users server array
     */
    @Get('/previews')
    @UseGuards(AuthGuardJwtPayload)
    async getServers(
        @CurrentUser() user: any
    ): Promise<ServerPreview[]> {
            
        return await this.serverService.getServersPreviews(user);
    }

    /**
     * Endpoint that returns a single server info
     * @param { ServerId } serverId id of desired server
     * @returns { Promise<Server>} returns the desired server
     */
    @Get(':id')
    @UseGuards(AuthGuardJwtPayload)
    async getServer(
        @Param('id') serverId: string,
        @CurrentUser() user: any): Promise<CompleteServer> {
        
        return await this.serverService.getServerById(serverId, user);
    }

    /**
     * Endpoint that creates a server
     * @param {RegisterPayload} payload returns the minimum data to create a server
     * @returns { Promise<Server>} returns the desired server
     */
    @Post()
    @UseGuards(AuthGuardJwt)
    async createServer(
        @Body(new ValidationPipe()) payload: ServerRegisterPayload,
        @CurrentUser() user: User
    ): Promise<Server>{
        this.logger.debug(`User creating a server:`, user);

        const server = await this.serverService.createServer(payload, user);
        return server
    }

    @Patch(':id')
    @UseGuards(AuthGuardJwt)
    async updateServer(
        @Param('id') serverId: string,
        @Body() payload: ServerUpdatePayload,
        @CurrentUser() user: User
    ) : Promise<Server> {
        try {
            const updatedServer = await this.serverService.updateServer(serverId, payload, user);
            return updatedServer;
        } catch (error) {
            // Gestisci gli errori qui e restituisci una risposta di errore appropriata
        }
    }

    
    @Delete(':id')
    @UseGuards(AuthGuardJwt)
    async deleteServer(
        @Param('id') serverId: string,
        @CurrentUser() user: User
    ) : Promise<any> {
        try {
            return await this.serverService.deleteServer(serverId, user);
        } catch (error) {
            // Gestisci gli errori qui e restituisci una risposta di errore appropriata
        }
    }

    /**
     * Endpoint to join a server
     * @param {serverId} serverId that user intend to join
     * @returns { Promise<Server>} returns the desired server
     */
    @Post('/join/:id')
    @UseGuards(AuthGuardJwt)
    async joinServer(
        @Param('id') serverId: string,
        @CurrentUser() user: User
    ): Promise<CompleteServer>{

        const joinedServer = await this.serverService.joinServer(serverId, user);
        return joinedServer
    }

    /**
     * Endpoint to leave a server
     * @param {serverId} serverId that user intend to join
     * @returns { Promise<Server>} returns the desired server
     */
    @Post('/leave/:id')
    @UseGuards(AuthGuardJwt)
    async leaveServer(
        @Param('id') serverId: string,
        @CurrentUser() user: User
    ): Promise<void>{

        const serverLeft = await this.serverService.leaveServer(serverId, user);
        return serverLeft
    }

    /**
     * Endpoint to leave a server
     * @param { UserAndServerPayload } payload the serverId and the user to invite
     * @returns { Promise<Server>} returns the desired server
     */
    @Post('/invite')
    @UseGuards(AuthGuardJwt)
    async inviteToServer(
        @Body() payload: UserAndServerPayload,
        @CurrentUser() user: User
    ): Promise<void>{
    
        const serverLeft = await this.serverService.inviteToServer(payload, user);
        return serverLeft
    }

    /**
     * Endpoint to add a owner
     * @param { UserAndServerPayload } payload the serverId and the user to add
     * @returns { Promise<Server>} returns the desired server
     */
    @Post('/add-owner')
    @UseGuards(AuthGuardJwt)
    async addOwner(
        @Body() payload: UserAndServerPayload,
        @CurrentUser() user: User
    ): Promise<Server>{
    
        const ownerAdded = await this.serverService.addOwner(payload, user);
        return ownerAdded
    }

    /**
     * Endpoint to add a owner
     * @param { UserAndServerPayload } payload the serverId and the user to add
     * @returns { Promise<Server>} returns the desired server
     */
    @Post('/remove-owner')
    @UseGuards(AuthGuardJwt)
    async removeOwner(
        @Body() payload: UserAndServerPayload,
        @CurrentUser() user: User
    ): Promise<Server>{
    
        const removedOwner = await this.serverService.removeOwner(payload, user);
        return removedOwner
    }

}