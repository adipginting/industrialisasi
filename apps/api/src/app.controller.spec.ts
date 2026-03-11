import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { DbService } from './db/db.service';

describe('AppController', () => {
  let appController: AppController;
  let authService: AuthService;
  let dbService: DbService;

  const mockAuthService = {
    login: jest.fn(),
    validateUser: jest.fn(),
  };

  const mockDbService = {
    createPost: jest.fn(),
    getPosts: jest.fn(),
    getUsers: jest.fn(),
  };

  const mockAppService = {
    getHello: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
        {
          provide: DbService,
          useValue: mockDbService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    authService = app.get<AuthService>(AuthService);
    dbService = app.get<DbService>(DbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/login', () => {
    it('should return access token when login is successful', async () => {
      const mockUser = {
        userId: '123',
        username: 'testuser',
      };

      const mockRequest = {
        user: mockUser,
      };

      const mockToken = {
        access_token: 'jwt.token.here',
      };

      mockAuthService.login.mockResolvedValue(mockToken);

      const result = await appController.login(mockRequest);

      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockToken);
      expect(result).toHaveProperty('access_token');
    });

    it('should call authService.login with correct user object', async () => {
      const mockUser = {
        userId: '456',
        username: 'anotheruser',
      };

      const mockRequest = {
        user: mockUser,
      };

      mockAuthService.login.mockResolvedValue({
        access_token: 'another.token',
      });

      await appController.login(mockRequest);

      expect(authService.login).toHaveBeenCalledTimes(1);
      expect(authService.login).toHaveBeenCalledWith(mockUser);
    });

    it('should handle user object with additional properties', async () => {
      const mockUser = {
        userId: '789',
        username: 'userwithemail',
        email: 'user@example.com',
        createdAt: '2024-01-01',
      };

      const mockRequest = {
        user: mockUser,
      };

      mockAuthService.login.mockResolvedValue({
        access_token: 'token.with.extras',
      });

      const result = await appController.login(mockRequest);

      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result.access_token).toBe('token.with.extras');
    });

    it('should propagate errors from authService', async () => {
      const mockRequest = {
        user: {
          userId: '123',
          username: 'testuser',
        },
      };

      const error = new Error('JWT signing failed');
      mockAuthService.login.mockRejectedValue(error);

      await expect(appController.login(mockRequest)).rejects.toThrow(
        'JWT signing failed',
      );
    });

    it('should handle login with UUID userId', async () => {
      const mockUser = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        username: 'uuiduser',
      };

      const mockRequest = {
        user: mockUser,
      };

      mockAuthService.login.mockResolvedValue({
        access_token: 'uuid.token',
      });

      const result = await appController.login(mockRequest);

      expect(authService.login).toHaveBeenCalledWith(mockUser);
      expect(result.access_token).toBe('uuid.token');
    });

    it('should return token with proper JWT structure', async () => {
      const mockRequest = {
        user: { userId: '123', username: 'testuser' },
      };

      const jwtToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyIiwic3ViIjoiMTIzIn0.signature';

      mockAuthService.login.mockResolvedValue({
        access_token: jwtToken,
      });

      const result = await appController.login(mockRequest);

      expect(result.access_token).toContain('eyJ');
      expect(typeof result.access_token).toBe('string');
    });
  });

  describe('POST /auth/logout', () => {
    it('should call logout on request object', async () => {
      const mockLogout = jest.fn();
      const mockRequest = {
        logout: mockLogout,
        user: { userId: '123', username: 'testuser' },
      };

      await appController.logout(mockRequest);

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });

    it('should return the result of req.logout()', async () => {
      const mockLogoutResponse = { message: 'Logged out successfully' };
      const mockLogout = jest.fn().mockReturnValue(mockLogoutResponse);
      const mockRequest = {
        logout: mockLogout,
        user: { userId: '123', username: 'testuser' },
      };

      const result = await appController.logout(mockRequest);

      expect(result).toEqual(mockLogoutResponse);
    });

    it('should handle logout with different user', async () => {
      const mockLogout = jest.fn().mockReturnValue({ success: true });
      const mockRequest = {
        logout: mockLogout,
        user: { userId: '999', username: 'differentuser' },
      };

      await appController.logout(mockRequest);

      expect(mockLogout).toHaveBeenCalled();
    });

    it('should call logout without additional parameters', async () => {
      const mockLogout = jest.fn();
      const mockRequest = {
        logout: mockLogout,
        user: { userId: '123', username: 'testuser' },
      };

      await appController.logout(mockRequest);

      expect(mockLogout).toHaveBeenCalledWith();
    });
  });

  describe('GET /profile', () => {
    it('should return user from request', async () => {
      const mockUser = {
        userId: '123',
        username: 'testuser',
      };

      const mockRequest = {
        user: mockUser,
      };

      const result = await appController.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
    });

    it('should return user object with all properties', async () => {
      const mockUser = {
        userId: '456',
        username: 'profileuser',
        email: 'profile@example.com',
      };

      const mockRequest = {
        user: mockUser,
      };

      const result = await appController.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
      expect(result.userId).toBe('456');
      expect(result.username).toBe('profileuser');
      expect(result.email).toBe('profile@example.com');
    });

    it('should return minimal user object', async () => {
      const mockUser = {
        userId: '789',
        username: 'minimaluser',
      };

      const mockRequest = {
        user: mockUser,
      };

      const result = await appController.getProfile(mockRequest);

      expect(result).toEqual(mockUser);
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should return user with UUID', async () => {
      const mockUser = {
        userId: '550e8400-e29b-41d4-a716-446655440000',
        username: 'uuiduser',
      };

      const mockRequest = {
        user: mockUser,
      };

      const result = await appController.getProfile(mockRequest);

      expect(result.userId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    });

    it('should not modify the user object', async () => {
      const mockUser = {
        userId: '123',
        username: 'testuser',
        email: 'test@example.com',
      };

      const mockRequest = {
        user: mockUser,
      };

      const result = await appController.getProfile(mockRequest);

      expect(result).toStrictEqual(mockUser);
      expect(result).toBe(mockUser); // Same reference
    });
  });

  describe('POST /posts', () => {
    it('should create post with user id from request', async () => {
      const mockUser = {
        userId: '123',
        username: 'testuser',
      };

      const mockRequest = {
        user: mockUser,
      };

      const mockBody = {
        title: 'Test Post',
        content: 'This is test content',
      };

      const mockCreatedPost = {
        id: '1',
        user_id: '123',
        title: 'Test Post',
        content: 'This is test content',
        posted_at: '2024-01-01T00:00:00Z',
      };

      mockDbService.createPost.mockResolvedValue(mockCreatedPost);

      const result = await appController.createPost(mockRequest, mockBody);

      expect(dbService.createPost).toHaveBeenCalledWith(
        '123',
        'Test Post',
        'This is test content',
      );
      expect(result).toEqual(mockCreatedPost);
    });

    it('should handle database errors when creating post', async () => {
      const mockRequest = {
        user: { userId: '123', username: 'testuser' },
      };

      const mockBody = {
        title: 'Test Post',
        content: 'Test content',
      };

      const dbError = new Error('Database connection failed');
      mockDbService.createPost.mockRejectedValue(dbError);

      await expect(
        appController.createPost(mockRequest, mockBody),
      ).rejects.toThrow('Database connection failed');
    });

    it('should create post with correct parameters', async () => {
      const mockRequest = {
        user: { userId: '789', username: 'author' },
      };

      const mockBody = {
        title: 'Another Post',
        content: 'Different content here',
      };

      mockDbService.createPost.mockResolvedValue({
        id: '2',
        user_id: '789',
        title: 'Another Post',
        content: 'Different content here',
      });

      await appController.createPost(mockRequest, mockBody);

      expect(dbService.createPost).toHaveBeenCalledWith(
        '789',
        'Another Post',
        'Different content here',
      );
    });

    it('should create post with long content', async () => {
      const longContent = 'A'.repeat(5000);
      const mockRequest = {
        user: { userId: '123', username: 'testuser' },
      };

      const mockBody = {
        title: 'Long Post',
        content: longContent,
      };

      mockDbService.createPost.mockResolvedValue({
        id: '3',
        user_id: '123',
        title: 'Long Post',
        content: longContent,
      });

      await appController.createPost(mockRequest, mockBody);

      expect(dbService.createPost).toHaveBeenCalledWith(
        '123',
        'Long Post',
        longContent,
      );
    });

    it('should create post with special characters', async () => {
      const mockRequest = {
        user: { userId: '123', username: 'testuser' },
      };

      const mockBody = {
        title: 'Title with \'quotes\' and "double quotes"',
        content: 'Content with <html> & special chars: @#$%^&*()',
      };

      mockDbService.createPost.mockResolvedValue({
        id: '4',
        user_id: '123',
        title: mockBody.title,
        content: mockBody.content,
      });

      await appController.createPost(mockRequest, mockBody);

      expect(dbService.createPost).toHaveBeenCalledWith(
        '123',
        mockBody.title,
        mockBody.content,
      );
    });

    it('should create post with empty title', async () => {
      const mockRequest = {
        user: { userId: '123', username: 'testuser' },
      };

      const mockBody = {
        title: '',
        content: 'Content without title',
      };

      mockDbService.createPost.mockResolvedValue({
        id: '5',
        user_id: '123',
        title: '',
        content: 'Content without title',
      });

      await appController.createPost(mockRequest, mockBody);

      expect(dbService.createPost).toHaveBeenCalledWith(
        '123',
        '',
        'Content without title',
      );
    });

    it('should create post with empty content', async () => {
      const mockRequest = {
        user: { userId: '123', username: 'testuser' },
      };

      const mockBody = {
        title: 'Title without content',
        content: '',
      };

      mockDbService.createPost.mockResolvedValue({
        id: '6',
        user_id: '123',
        title: 'Title without content',
        content: '',
      });

      await appController.createPost(mockRequest, mockBody);

      expect(dbService.createPost).toHaveBeenCalledWith(
        '123',
        'Title without content',
        '',
      );
    });

    it('should rethrow error when createPost fails', async () => {
      const mockRequest = {
        user: { userId: '123', username: 'testuser' },
      };

      const mockBody = {
        title: 'Test',
        content: 'Test',
      };

      const error = new Error('Failed to create post');
      mockDbService.createPost.mockRejectedValue(error);

      await expect(
        appController.createPost(mockRequest, mockBody),
      ).rejects.toThrow('Failed to create post');
    });

    it('should handle foreign key constraint errors', async () => {
      const mockRequest = {
        user: { userId: '999', username: 'nonexistent' },
      };

      const mockBody = {
        title: 'Test',
        content: 'Test',
      };

      const fkError = new Error('Foreign key constraint violation');
      mockDbService.createPost.mockRejectedValue(fkError);

      await expect(
        appController.createPost(mockRequest, mockBody),
      ).rejects.toThrow('Foreign key constraint violation');
    });

    it('should return created post with all fields', async () => {
      const mockRequest = {
        user: { userId: '123', username: 'testuser' },
      };

      const mockBody = {
        title: 'Complete Post',
        content: 'Complete Content',
      };

      const mockCreatedPost = {
        id: '7',
        user_id: '123',
        title: 'Complete Post',
        content: 'Complete Content',
        posted_at: '2024-01-01T00:00:00Z',
        edited_at: null,
      };

      mockDbService.createPost.mockResolvedValue(mockCreatedPost);

      const result = await appController.createPost(mockRequest, mockBody);

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('user_id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('posted_at');
    });
  });

  describe('GET /posts', () => {
    it('should return all posts', async () => {
      const mockPosts = [
        {
          id: '1',
          user_id: '123',
          username: 'user1',
          title: 'Post 1',
          content: 'Content 1',
          posted_at: '2024-01-01',
        },
        {
          id: '2',
          user_id: '456',
          username: 'user2',
          title: 'Post 2',
          content: 'Content 2',
          posted_at: '2024-01-02',
        },
      ];

      mockDbService.getPosts.mockResolvedValue(mockPosts);

      const result = await appController.getPosts();

      expect(dbService.getPosts).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPosts);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no posts exist', async () => {
      mockDbService.getPosts.mockResolvedValue([]);

      const result = await appController.getPosts();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return posts with username field', async () => {
      const mockPosts = [
        {
          id: '1',
          user_id: '123',
          username: 'testuser',
          title: 'Test Post',
          content: 'Test Content',
          posted_at: '2024-01-01',
        },
      ];

      mockDbService.getPosts.mockResolvedValue(mockPosts);

      const result = await appController.getPosts();

      expect(result[0]).toHaveProperty('username');
      expect(result[0].username).toBe('testuser');
    });

    it('should return posts ordered by posted_at DESC', async () => {
      const mockPosts = [
        {
          id: '3',
          user_id: '123',
          username: 'user1',
          title: 'Newest',
          content: 'Newest content',
          posted_at: '2024-01-10',
        },
        {
          id: '2',
          user_id: '456',
          username: 'user2',
          title: 'Middle',
          content: 'Middle content',
          posted_at: '2024-01-05',
        },
        {
          id: '1',
          user_id: '789',
          username: 'user3',
          title: 'Oldest',
          content: 'Oldest content',
          posted_at: '2024-01-01',
        },
      ];

      mockDbService.getPosts.mockResolvedValue(mockPosts);

      const result = await appController.getPosts();

      expect(result[0].title).toBe('Newest');
      expect(result[2].title).toBe('Oldest');
    });

    it('should handle large number of posts', async () => {
      const mockPosts = Array.from({ length: 100 }, (_, i) => ({
        id: `${i + 1}`,
        user_id: `${(i % 10) + 1}`,
        username: `user${(i % 10) + 1}`,
        title: `Post ${i + 1}`,
        content: `Content ${i + 1}`,
        posted_at: `2024-01-01T${String(i % 24).padStart(2, '0')}:00:00Z`,
      }));

      mockDbService.getPosts.mockResolvedValue(mockPosts);

      const result = await appController.getPosts();

      expect(result).toHaveLength(100);
      expect(dbService.getPosts).toHaveBeenCalledTimes(1);
    });

    it('should call getPosts without parameters', async () => {
      mockDbService.getPosts.mockResolvedValue([]);

      await appController.getPosts();

      expect(dbService.getPosts).toHaveBeenCalledWith();
    });

    it('should return posts with all required fields', async () => {
      const mockPosts = [
        {
          id: '1',
          user_id: '123',
          username: 'testuser',
          title: 'Test',
          content: 'Content',
          posted_at: '2024-01-01T00:00:00Z',
          edited_at: null,
        },
      ];

      mockDbService.getPosts.mockResolvedValue(mockPosts);

      const result = await appController.getPosts();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('user_id');
      expect(result[0]).toHaveProperty('username');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('content');
      expect(result[0]).toHaveProperty('posted_at');
    });

    it('should handle posts from multiple users', async () => {
      const mockPosts = [
        {
          id: '1',
          user_id: '123',
          username: 'user1',
          title: 'Post from user1',
          content: 'Content 1',
          posted_at: '2024-01-01',
        },
        {
          id: '2',
          user_id: '456',
          username: 'user2',
          title: 'Post from user2',
          content: 'Content 2',
          posted_at: '2024-01-02',
        },
        {
          id: '3',
          user_id: '123',
          username: 'user1',
          title: 'Another post from user1',
          content: 'Content 3',
          posted_at: '2024-01-03',
        },
      ];

      mockDbService.getPosts.mockResolvedValue(mockPosts);

      const result = await appController.getPosts();

      expect(result).toHaveLength(3);
      expect(result.filter((p) => p.user_id === '123')).toHaveLength(2);
      expect(result.filter((p) => p.user_id === '456')).toHaveLength(1);
    });
  });

  describe('GET /users', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: '123',
          username: 'user1',
          email: 'user1@example.com',
        },
        {
          id: '456',
          username: 'user2',
          email: 'user2@example.com',
        },
      ];

      mockDbService.getUsers.mockResolvedValue(mockUsers);

      const result = await appController.getUsers();

      expect(dbService.getUsers).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
      mockDbService.getUsers.mockResolvedValue([]);

      const result = await appController.getUsers();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return users with all fields', async () => {
      const mockUsers = [
        {
          id: '789',
          username: 'testuser',
          email: 'test@example.com',
          hashed_password: 'hashedpass',
          can_post: true,
          created_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockDbService.getUsers.mockResolvedValue(mockUsers);

      const result = await appController.getUsers();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('username');
      expect(result[0]).toHaveProperty('email');
    });

    it('should call getUsers without parameters', async () => {
      mockDbService.getUsers.mockResolvedValue([]);

      await appController.getUsers();

      expect(dbService.getUsers).toHaveBeenCalledWith();
    });

    it('should handle large number of users', async () => {
      const mockUsers = Array.from({ length: 50 }, (_, i) => ({
        id: `${i + 1}`,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
      }));

      mockDbService.getUsers.mockResolvedValue(mockUsers);

      const result = await appController.getUsers();

      expect(result).toHaveLength(50);
      expect(dbService.getUsers).toHaveBeenCalledTimes(1);
    });

    it('should return users with different can_post values', async () => {
      const mockUsers = [
        {
          id: '1',
          username: 'canpost',
          email: 'can@example.com',
          can_post: true,
        },
        {
          id: '2',
          username: 'cannotpost',
          email: 'cannot@example.com',
          can_post: false,
        },
      ];

      mockDbService.getUsers.mockResolvedValue(mockUsers);

      const result = await appController.getUsers();

      expect(result[0].can_post).toBe(true);
      expect(result[1].can_post).toBe(false);
    });

    it('should return users with unique usernames', async () => {
      const mockUsers = [
        { id: '1', username: 'user1', email: 'user1@example.com' },
        { id: '2', username: 'user2', email: 'user2@example.com' },
        { id: '3', username: 'user3', email: 'user3@example.com' },
      ];

      mockDbService.getUsers.mockResolvedValue(mockUsers);

      const result = await appController.getUsers();

      const usernames = result.map((u) => u.username);
      const uniqueUsernames = new Set(usernames);
      expect(uniqueUsernames.size).toBe(usernames.length);
    });

    it('should return users with unique emails', async () => {
      const mockUsers = [
        { id: '1', username: 'user1', email: 'user1@example.com' },
        { id: '2', username: 'user2', email: 'user2@example.com' },
        { id: '3', username: 'user3', email: 'user3@example.com' },
      ];

      mockDbService.getUsers.mockResolvedValue(mockUsers);

      const result = await appController.getUsers();

      const emails = result.map((u) => u.email);
      const uniqueEmails = new Set(emails);
      expect(uniqueEmails.size).toBe(emails.length);
    });
  });

  describe('endpoint integration', () => {
    it('should handle multiple endpoint calls in sequence', async () => {
      mockDbService.getUsers.mockResolvedValue([]);
      mockDbService.getPosts.mockResolvedValue([]);

      await appController.getUsers();
      await appController.getPosts();

      expect(dbService.getUsers).toHaveBeenCalledTimes(1);
      expect(dbService.getPosts).toHaveBeenCalledTimes(1);
    });

    it('should maintain service state across multiple calls', async () => {
      const mockPost = {
        id: '1',
        user_id: '123',
        title: 'Test',
        content: 'Content',
      };

      mockDbService.createPost.mockResolvedValue(mockPost);
      mockDbService.getPosts.mockResolvedValue([mockPost]);

      const mockRequest = {
        user: { userId: '123', username: 'testuser' },
      };

      await appController.createPost(mockRequest, {
        title: 'Test',
        content: 'Content',
      });
      const posts = await appController.getPosts();

      expect(posts).toHaveLength(1);
    });
  });
});
