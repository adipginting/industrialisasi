import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PG_CONNECTION } from '../constants';

describe('UsersService', () => {
  let service: UsersService;
  let mockConnection: any;

  const mockQueryResult = {
    rows: [],
    rowCount: 0,
  };

  beforeEach(async () => {
    mockConnection = {
      query: jest.fn().mockResolvedValue(mockQueryResult),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PG_CONNECTION,
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        email: 'test@example.com',
        hashed_password: 'hashedpass123',
      };

      mockConnection.query.mockResolvedValueOnce({
        rows: [mockUser],
        rowCount: 1,
      });

      const result = await service.findOne('testuser');

      expect(mockConnection.query).toHaveBeenCalledWith(
        `SELECT id, username, email, hashed_password FROM idst.users WHERE username = $1`,
        ['testuser'],
      );
      expect(result).toEqual({
        userId: '123',
        username: 'testuser',
        password: 'hashedpass123',
      });
    });

    it('should return null when user is not found', async () => {
      mockConnection.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const result = await service.findOne('nonexistent');

      expect(mockConnection.query).toHaveBeenCalledWith(
        `SELECT id, username, email, hashed_password FROM idst.users WHERE username = $1`,
        ['nonexistent'],
      );
      expect(result).toBeNull();
    });

    it('should return null and log error when database query fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      mockConnection.query.mockRejectedValueOnce(
        new Error('Database connection failed'),
      );

      const result = await service.findOne('testuser');

      expect(result).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'findOne error:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('validatePassword', () => {
    it('should return true when password matches', async () => {
      // This is a real argon2 hash of the password "password123"
      const hashedPassword =
        '$argon2id$v=19$m=65536,t=3,p=4$randomsalt$hashedpasswordhere';

      // Note: In a real test, you'd need to hash a password with argon2
      // For this test, we'll mock the argon2 verify function
      const argon2 = require('argon2');
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(true);

      const result = await service.validatePassword(
        'password123',
        hashedPassword,
      );

      expect(result).toBe(true);
      expect(argon2.verify).toHaveBeenCalledWith(hashedPassword, 'password123');
    });

    it('should return false when password does not match', async () => {
      const hashedPassword =
        '$argon2id$v=19$m=65536,t=3,p=4$randomsalt$hashedpasswordhere';

      const argon2 = require('argon2');
      jest.spyOn(argon2, 'verify').mockResolvedValueOnce(false);

      const result = await service.validatePassword(
        'wrongpassword',
        hashedPassword,
      );

      expect(result).toBe(false);
    });

    it('should return false and log error when validation fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      const argon2 = require('argon2');
      jest
        .spyOn(argon2, 'verify')
        .mockRejectedValueOnce(new Error('Argon2 error'));

      const result = await service.validatePassword(
        'password123',
        'invalidhash',
      );

      expect(result).toBe(false);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'validatePassword error:',
        expect.any(Error),
      );

      consoleErrorSpy.mockRestore();
    });
  });
});
