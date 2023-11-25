import { Injectable, NotFoundException, Logger, ConflictException, BadRequestException } from "@nestjs/common"

import mongoose from 'mongoose';
import { Model } from "mongoose";
import { InjectModel } from "@nestjs/mongoose";

import { User } from "./user.model";
import { UserRegisterPayload } from "../auth/payload/register.payload";

import { AuthService } from "../auth/auth.service";

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectModel("User")
    private readonly userModel: Model<User>,
    private readonly authService: AuthService,
  ) {}


  /**
  * Fetches a user from database by UUID
  * @param {string} id
  * @returns {Promise<User>} queried user data
  */
  async get(id: string): Promise<User> {
    this.logger.debug(`getting user by ID: ${id}`);
    const user = await this.userModel.findById(id).exec();
    this.logger.debug(user);
    return user;
  }


  /**
  * Fetches a profile from database by username
  * @param { string } username
  * @returns { Promise<User>} queried profile data
  */
  async getByUsername(username: string): Promise<User> {
    const user = await this.userModel.findOne({ username }).exec();
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  /**
  * Fetches a profile from database by username
  * @param { string } email user's email
  * @returns { Promise<User>} queried profile data
  */
  async getByEmail(email: string): Promise<User> {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }
    return user;
  }


  /**
  * Create a profile with UserRegisterPayload fields
  * @param { UserRegisterPayload } payload profile payload
  * @returns { Promise<User>} created user with hashed password
  */
  async create(payload: UserRegisterPayload): Promise<User> {
    this.logger.debug(`Register Payload`);
    this.logger.debug(payload);
    
    try {
      if(payload.password != payload.retypedPassword){
        throw new BadRequestException('The two passwords should be equal.'); 
      }

      // Creates and saves the new user into the DB
      const createdProfile = await this.userModel.create({
        ...payload,
        password: await this.authService.hashPassword(payload.password)
      });
  
      return createdProfile;
    } catch (error) {
      if (error.code === 11000 && error.keyPattern.email) {
        throw new ConflictException('An account with the provided email currently exists. Please choose another one.'); 
      }

      if (error.code === 11000 && error.keyPattern.username) {
        throw new ConflictException('An account with the provided username currently exists. Please choose another one.'); // Invia una risposta 409 Conflict
      }

      console.error(error);
      throw error;
    }
  }

  /**
   * Takes google response & finds the userByEmail 
   * @param {object} googleUser returns the user from google
   * @returns {User} returns an error message or the user from google
   */
  async googleLogin(req): Promise<User> {
    if (!req.user) {
      throw new NotFoundException('No user was returned from login. Try again or contact support')
    } else {
      const googleUserMail = req.user.email;
      return await this.getByEmail(googleUserMail);
    }
  }

  /**
   * Endpoint to refuse an invite 
   * @param { serverId } serverId id of the server
   * @param { user } user that wants to refuse the invite
   * @returns { Promise<any>} returns a success message
   */
  async refuseInvite(serverId: string, user: User): Promise<any>{
    const serverObjectId = new mongoose.Types.ObjectId(serverId);

    const isInvited = user.invites.includes(serverObjectId);
    if(!isInvited){
      new NotFoundException(`You don't have this server between your invites`)
    }
    if(isInvited){
      const index = user.invites.findIndex(id => id === serverObjectId);
      if (index !== -1) {
        user.invites.splice(index, 1);
      }

      return {status: 200, message: 'Invite refused'}
    }
  }
  
}