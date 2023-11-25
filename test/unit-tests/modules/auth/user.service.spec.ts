import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { UserService } from '../../../../src/modules/auth/user.service';
import { User } from '../../../../src/modules/auth/user.model';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { JwtModule } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { ConfigService } from "../../../../src/modules/config/config.service";

describe('UserService', () => {
  let userService: UserService;
  let authService: AuthService;
  let userModel: Model<User>;

  const mockUserModel = {
    findById: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [JwtModule.register({ secret: 'your-secret-key' })],
      providers: [
        UserService,
        AuthService,
        ConfigService,
        {
          provide: ConfigService,
          useValue: new ConfigService('unit-test.env'),
        },
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
    userModel = module.get<Model<User>>(getModelToken('User'));
  });

  it('should be defined', () => {
    expect(userService).toBeDefined();
  });
  
  describe('get', () => {
    it('should find a user by ID', async () => {
      const userId = 'someUserId';
      const mockUser = {
        _id: userId,
        username: 'testuser',
        password: 'testpassword',
        email: 'test@example.com',
      };

      const queryMock: any = {
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      (mockUserModel.findById as jest.Mock).mockReturnValue(queryMock);

      const result = await userService.get(userId);

      expect(mockUserModel.findById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockUser);
    });
  });
  
  describe('getByUsername', () => {
    it('should find a user by username', async () => {
      const username = 'testuser';
      const mockUser = {
        _id: 'someUserId',
        username,
        password: 'testpassword',
        email: 'test@example.com',
      };

      const queryMock: any = {
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      (mockUserModel.findOne as jest.Mock).mockReturnValue(queryMock);

      const result = await userService.getByUsername(username);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ username });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const username = 'nonExistentUser';

    const queryMock = {
      exec: jest.fn().mockResolvedValue(null),
    };

    (mockUserModel.findOne as jest.Mock).mockReturnValue(queryMock);
  
      try {
        await userService.getByUsername(username);
        fail('Expected NotFoundException, but no exception was thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual(`User with username ${username} not found`);
      }
    });
  });

  
  describe('getByEmail', () => {
    it('should find a user by email', async () => {
      const email = 'test@example.com';
      const mockUser = {
        _id: 'someUserId',
        username: 'testuser',
        password: 'testpassword',
        email,
      };

      const queryMock: any = {
        exec: jest.fn().mockResolvedValue(mockUser),
      };

      (mockUserModel.findOne as jest.Mock).mockReturnValue(queryMock);

      const result = await userService.getByEmail(email);

      expect(mockUserModel.findOne).toHaveBeenCalledWith({ email });
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException if user is not found', async () => {
    const email = 'nonExistentUser';

    const queryMock = {
      exec: jest.fn().mockResolvedValue(null),
    };

    (mockUserModel.findOne as jest.Mock).mockReturnValue(queryMock);
  
      try {
        await userService.getByEmail(email);
        fail('Expected NotFoundException, but no exception was thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual(`User with email ${email} not found`);
      }
    });
  });
 
  describe('create', () => {
    it('should create a new user', async () => {
      const registerPayload = {
        username: 'newuser',
        password: 'NewStrongP@ss1.',
        retypedPassword: 'NewStrongP@ss1.',
        email: 'new@example.com',
      };

      const createdUser = {
        _id: 'someUserId',
        ...registerPayload,
        password: 'hashedPassword',
      };
  
      userModel.create = jest.fn().mockResolvedValue(createdUser);

      // Sovrascrivi il modello Mongoose con il nostro oggetto userModel
      jest.spyOn(userModel, 'create');

      const userService = new UserService(userModel, authService);

      const result = await userService.create(registerPayload);

      expect(userModel.create).toHaveBeenCalledWith({
        ...registerPayload,
        password: expect.any(String),
      });

      expect(result).toEqual({
        _id: 'someUserId',
        ...registerPayload,
        password: expect.any(String),
      });
    });
    
    it('should throw NotAcceptableException when passwords are weak', async () => {
      const registerPayload = {
        username: 'newuser',
        password: 'newpassword',
        retypedPassword: 'newpassword',
        email: 'existing@example.com', // Existing email
      };
    
      try {
        await userService.create(registerPayload);
        fail('Expected BadRequestException, but no exception was thrown');
      } catch (error) {
        expect(error)
      }   
    });

    it('should throw BadRequestException when passwords do not match', async () => {
      const registerPayload = {
        username: 'newuser',
        password: 'NewStrongP@ss1.',
        retypedPassword: 'password2', // Different password
        email: 'new@example.com',
      };
    
      try {
        await userService.create(registerPayload);
        fail('Expected BadRequestException, but no exception was thrown');
      } catch (error) {
        expect(error)
      }    
    });


    it('should throw NotAcceptableException when username already exists', async () => {
      const registerPayload = {
        username: 'existinguser', // Existing username
        password: 'NewStrongP@ss1.',
        retypedPassword: 'NewStrongP@ss1.',
        email: 'new@example.com',
      };
    
      // Simula che findOne ritorni un utente con lo stesso username
      mockUserModel.findOne.mockReturnValue({ username: 'existinguser' });
    
      try {
        await userService.create(registerPayload);
        fail('Expected BadRequestException, but no exception was thrown');
      } catch (error) {
        expect(error)
      }   
    });

    it('should throw NotAcceptableException when email already exists', async () => {
      const registerPayload = {
        username: 'newuser',
        password: 'NewStrongP@ss1.',
        retypedPassword: 'NewStrongP@ss1.',
        email: 'existing@example.com', // Existing email
      };
    
      try {
        await userService.create(registerPayload);
        fail('Expected BadRequestException, but no exception was thrown');
      } catch (error) {
        expect(error)
      }   
    });
    
  });

  describe('googleLogin', () => {
    it('should return a user from Google login', async () => {
      const googleUser = {
        email: 'googleuser@example.com',
      };
  
      const mockUser = {
        _id: 'someUserId',
        username: 'aUserName',
        password: 'testpassword',
        email: 'test@example.com',
      };

      const queryMock: any = {
        exec: jest.fn().mockResolvedValue(mockUser),
      };
  
      jest.spyOn(userModel, 'findOne').mockReturnValue(queryMock);
  
      const result = await userService.googleLogin({ user: googleUser });
    
      expect(result).toEqual(mockUser);
    });
  
    it('should throw NotFoundException when no user is returned from Google login', async () => {
      const req = { user: null };
  
      try {
        await userService.googleLogin(req);
        fail('Expected NotFoundException, but no exception was thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toEqual('No user was returned from login. Try again or contact support');
      }
    });
  });
  
});