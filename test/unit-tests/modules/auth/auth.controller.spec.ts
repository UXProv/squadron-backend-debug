import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../../src/modules/auth/auth.controller';
import { AuthService, ITokenReturnBody } from '../../../../src/modules/auth/auth.service';
import { User } from '../../../../src/modules/auth/user.model';
import { getModelToken } from '@nestjs/mongoose';
import { Logger } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '../../../../src/modules/config/config.service';
import { UserService } from '../../../../src/modules/auth/user.service';
import { GoogleStrategy } from '../../../../src/modules/auth/google.strategy';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;
  let userService: UserService;
  let googleStrategy: GoogleStrategy;

  const mockUser: Partial<User> = {
    id: '1',
    username: 'testuser',
    email: 'test@example.com',
    password: 'hashedPassword',
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        ConfigService,
        AuthService,
        UserService,
        Logger,
        GoogleStrategy,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getModelToken('User'),
          useValue: {
            findOne: jest.fn().mockResolvedValue(mockUser),
          },
        },
        {
          provide: ConfigService,
          useValue: new ConfigService('unit-test.env'),
        },
      ],
      imports: [
        JwtModule.register({ secret: 'your-secret-key', signOptions: { expiresIn: '48h' } })
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    userService = module.get<UserService>(UserService);
    googleStrategy = module.get<GoogleStrategy>(GoogleStrategy);
  });

  describe('login', () => {
    it('should return user and token on successful login', async () => {
      const mockToken: ITokenReturnBody = {
        expires: '172800',
        expiresPrettyPrint: '48 hours,  ',
        token: 'testToken',
      };
      const getTokenForUserSpy = jest.spyOn(authService, 'getTokenForUser').mockResolvedValue(mockToken);
      
      const result = await authController.login(mockUser as User);

      expect(result).toEqual({ user: mockUser, token: mockToken });

      expect(getTokenForUserSpy).toHaveBeenCalledWith(mockUser as User);
    });
  });

  describe('validate', () => {
    it('should validate Google user and return user information', async () => {
      const accessToken = 'google-access-token';
      const refreshToken = 'google-refresh-token';
      const profile = {
        name: { givenName: 'John', familyName: 'Doe' },
        emails: [{ value: 'johndoe@example.com' }],
        photos: [{ value: 'profile-photo-url' }],
      };

      // Mock the `done` function
      const done = jest.fn();

      // Mock the ConfigService
      mockConfigService.get.mockReturnValueOnce('google-client-id');
      mockConfigService.get.mockReturnValueOnce('google-client-secret');

      // Call the validate method of GoogleStrategy
      await googleStrategy.validate(accessToken, refreshToken, profile, done);

      // Verify that the `done` function was called with the expected user object
      expect(done).toHaveBeenCalledWith(null, {
        email: 'johndoe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        picture: 'profile-photo-url',
        accessToken: 'google-access-token',
      });
    });
  });

});