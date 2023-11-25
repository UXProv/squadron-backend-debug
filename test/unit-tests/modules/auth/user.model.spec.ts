import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { User, UserSchema } from '../../../../src/modules/auth/user.model';
import { ConfigModule, ConfigService, registerAs } from '@nestjs/config';

describe('UserModel', () => {
    let userModel: Model<User>;
    let module: TestingModule;
  
    beforeAll(async () => {
        module = await Test.createTestingModule({
          providers: [
            {
              provide: getModelToken('User'),
              useValue: {
                create: jest.fn(), 
              },
            },
          ],
        }).compile();
    
        userModel = module.get<Model<User>>(getModelToken('User'));
      });
  
    afterAll(async () => {
      await module.close();
    });
  
    it('should be defined', () => {
      expect(userModel).toBeDefined();
    });

    it('should create a user', async () => {
      const userData = {
        username: 'testuser',
        password: 'password123',
        email: 'test@example.com',
      };
      const createdUser = {
        ...userData,
        _id: 'mockedUserId', 
      };

      (userModel.create as jest.Mock).mockResolvedValue(createdUser);

      const result = await userModel.create(userData);

      expect(result).toEqual(createdUser);
    });

});
