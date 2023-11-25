import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../../../src/modules/auth/auth.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../../../../src/modules/auth/user.model';
import { ConfigService } from '../../../../src/modules/config/config.service';

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
        ConfigService,
        {
          provide: ConfigService,
          useValue: new ConfigService('unit-test.env'),
        }
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
  });

  describe('getTokenForUser', () => {
    it('should return a token', async () => {
      const user: Partial<User> = {
        id: 'asfa',
        username: 'testuser',
        email: 'test@example.com',
      };

      const tokenResponse = {
        expires: 172800,
        expiresPrettyPrint: '48 hours,  ',
        token: 'testToken',
      };

      // Mock the sign method of JwtService
      jest.spyOn(jwtService, 'sign').mockReturnValue('testToken');

      const result = await authService.getTokenForUser(user as User);

      expect(result).toEqual(tokenResponse);
    });
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const password = 'password123';
      const hashedPassword = await authService.hashPassword(password);

      // Check if the password was hashed
      expect(hashedPassword).not.toEqual(password);

      // Check if the hashed password is a string
      expect(typeof hashedPassword).toBe('string');

      // Check if the hashed password is a valid bcrypt hash
      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });
  });
});
