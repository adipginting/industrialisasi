import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findOne: jest.fn(),
    validatePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      const mockUser = {
        userId: '123',
        username: 'testuser',
        password: 'hashedPassword123',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(true);

      const result = await authService.validateUser('testuser', 'password123');

      expect(usersService.findOne).toHaveBeenCalledWith('testuser');
      expect(usersService.validatePassword).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123',
      );
      expect(result).toEqual({
        userId: '123',
        username: 'testuser',
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should return null when user is not found', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await authService.validateUser(
        'nonexistent',
        'password123',
      );

      expect(usersService.findOne).toHaveBeenCalledWith('nonexistent');
      expect(usersService.validatePassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when password is invalid', async () => {
      const mockUser = {
        userId: '123',
        username: 'testuser',
        password: 'hashedPassword123',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      const result = await authService.validateUser(
        'testuser',
        'wrongpassword',
      );

      expect(usersService.findOne).toHaveBeenCalledWith('testuser');
      expect(usersService.validatePassword).toHaveBeenCalledWith(
        'wrongpassword',
        'hashedPassword123',
      );
      expect(result).toBeNull();
    });

    it('should return null when user exists but has no password', async () => {
      const mockUser = {
        userId: '123',
        username: 'testuser',
        password: undefined,
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await authService.validateUser('testuser', 'password123');

      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return an access token for valid user', async () => {
      const mockUser = {
        userId: '123',
        username: 'testuser',
      };

      const mockToken = 'jwt.token.here';
      mockJwtService.sign.mockReturnValue(mockToken);

      const result = await authService.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'testuser',
        sub: '123',
      });
      expect(result).toEqual({
        access_token: mockToken,
      });
    });

    it('should create JWT payload with correct structure', async () => {
      const mockUser = {
        userId: '456',
        username: 'anotheruser',
      };

      mockJwtService.sign.mockReturnValue('another.jwt.token');

      await authService.login(mockUser);

      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'anotheruser',
        sub: '456',
      });
    });

    it('should handle user with additional properties', async () => {
      const mockUser = {
        userId: '789',
        username: 'userwithemail',
        email: 'user@example.com',
        createdAt: '2024-01-01',
      };

      mockJwtService.sign.mockReturnValue('token.with.extras');

      const result = await authService.login(mockUser);

      // Should only use userId and username for JWT payload
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'userwithemail',
        sub: '789',
      });
      expect(result).toEqual({
        access_token: 'token.with.extras',
      });
    });
  });

  describe('edge cases', () => {
    it('should handle validateUser with empty username', async () => {
      mockUsersService.findOne.mockResolvedValue(null);

      const result = await authService.validateUser('', 'password');

      expect(usersService.findOne).toHaveBeenCalledWith('');
      expect(result).toBeNull();
    });

    it('should handle validateUser with empty password', async () => {
      const mockUser = {
        userId: '123',
        username: 'testuser',
        password: 'hashedPassword123',
      };

      mockUsersService.findOne.mockResolvedValue(mockUser);
      mockUsersService.validatePassword.mockResolvedValue(false);

      const result = await authService.validateUser('testuser', '');

      expect(result).toBeNull();
    });
  });
});
