import { 
    Controller,
    Logger,
    Post,
    Get,
    Body,
    UseGuards,
    UsePipes,
    ValidationPipe } from "@nestjs/common";
import { MessageService } from "./message.service";
import { AuthGuardJwtPayload } from "../auth/auth-guard.jwtpayload";
import { CurrentUser } from "../auth/current-user.decorator";
import { Message } from "./models/message.model";
import { CreateMessage } from "./payload/create-message.payload";
import { MessageRequest } from "./payload/message-request.payload";

@Controller('/message')
export class MessageController {
    private readonly logger = new Logger(MessageController.name);

    constructor(
        private readonly messageService: MessageService
    ) {}

    /**
     * Endpoint that creates a message
     * @param { CreateMessage } CreateMessae userId, message and channelId
     * @returns { Promise<Message>} returns the created message
     */
    @Post('')
    @UseGuards(AuthGuardJwtPayload)
    @UsePipes(new ValidationPipe())
    async createChannelGroup(
        @Body() message: CreateMessage,
        @CurrentUser() userReq: any
    ): Promise<Message> {
        return await this.messageService.createMessage(message, userReq);
    }

    /**
     * Retrieves a list of messages for a specific channel.
     * @param {MessageRequest} messageRequest - The message request, containing channelId, lastMessageId, and firstGet.
     * @returns {Promise<Message[]>} - An array of messages.
     */
    @Get('')
    @UseGuards(AuthGuardJwtPayload)
    @UsePipes(new ValidationPipe())
    async getMessages(
        @Body() messageRequest: MessageRequest,
        @CurrentUser() userReq: any
    ): Promise<Message[]> {
        const messages = await this.messageService.getMessages(messageRequest);

        return messages;
    }

}