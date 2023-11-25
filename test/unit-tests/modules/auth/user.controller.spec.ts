import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserController } from '../../../../src/modules/auth/user.controller';
import { AuthService, ITokenReturnBody } from '../../../../src/modules/auth/auth.service';
import { UserService } from '../../../../src/modules/auth/user.service';
import { UserRegisterPayload } from '../../../../src/modules/auth/payload/register.payload';
import { User } from '../../../../src/modules/auth/user.model';

describe('UserController', () => {
  let userController: UserController;
  let authService: AuthService;
  let userService: UserService;

  const mockUserModel: Model<User> = {
    create: jest.fn(),
  } as any; // Replace with your actual Model<User> type

  const mockAuthService = {
    getTokenForUser: jest.fn(),
  };

  const mockUserService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: getModelToken('User'),
          useValue: mockUserModel,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
  });

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      const UserregisterPayload: UserRegisterPayload = {
        username: 'newuser',
        password: 'NewStrongP@ss1.',
        retypedPassword: 'NewStrongP@ss1.',
        email: 'new@example.com',
      };

      const mockUser = {
        username: 'newuser',
        password: 'NewStrongP@ss1.',
        retypedPassword: 'NewStrongP@ss1.',
        email: 'new@example.com',
      };

      const mockToken: ITokenReturnBody = {
        expires: "172800",
        expiresPrettyPrint: "48 hours,  ",
        token: "eyJh"
      };

      mockUserService.create.mockResolvedValue(mockUser);
      mockAuthService.getTokenForUser.mockResolvedValue(mockToken);

      const result = await userController.register(UserregisterPayload);

      expect(mockUserService.create).toHaveBeenCalledWith(UserregisterPayload);
      expect(mockAuthService.getTokenForUser).toHaveBeenCalledWith(mockUser);
      expect(result).toBe(mockToken);
    });
  });
});