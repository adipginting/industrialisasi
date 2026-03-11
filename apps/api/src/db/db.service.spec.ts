import { Test, TestingModule } from '@nestjs/testing';
import { DbService } from './db.service';
import { PG_CONNECTION } from '../constants';

describe('DbService', () => {
  let service: DbService;
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
        DbService,
        {
          provide: PG_CONNECTION,
          useValue: mockConnection,
        },
      ],
    }).compile();

    service = module.get<DbService>(DbService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createPost', () => {
    it('should create a post with valid data', async () => {
      const mockPost = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '456',
        title: 'Test Post',
        content: 'This is test content',
        posted_at: '2024-01-01T00:00:00Z',
      };

      mockConnection.query.mockResolvedValueOnce({
        rows: [mockPost],
        rowCount: 1,
      });

      const result = await service.createPost(
        456,
        'Test Post',
        'This is test content',
      );

      expect(mockConnection.query).toHaveBeenCalledWith(
        `INSERT INTO idst.posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *`,
        [456, 'Test Post', 'This is test content'],
      );
      expect(result).toEqual(mockPost);
    });

    it('should create a post with different user', async () => {
      const mockPost = {
        id: '789',
        user_id: '999',
        title: 'Another Post',
        content: 'Different content',
        posted_at: '2024-01-02T00:00:00Z',
      };

      mockConnection.query.mockResolvedValueOnce({
        rows: [mockPost],
        rowCount: 1,
      });

      const result = await service.createPost(
        999,
        'Another Post',
        'Different content',
      );

      expect(mockConnection.query).toHaveBeenCalledWith(
        `INSERT INTO idst.posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *`,
        [999, 'Another Post', 'Different content'],
      );
      expect(result).toEqual(mockPost);
    });

    it('should create a post with long content', async () => {
      const longContent = 'A'.repeat(1000);
      const mockPost = {
        id: '1',
        user_id: '123',
        title: 'Long Post',
        content: longContent,
        posted_at: '2024-01-03T00:00:00Z',
      };

      mockConnection.query.mockResolvedValueOnce({
        rows: [mockPost],
        rowCount: 1,
      });

      const result = await service.createPost(123, 'Long Post', longContent);

      expect(result.content).toHaveLength(1000);
      expect(result).toEqual(mockPost);
    });

    it('should create a post with special characters in title and content', async () => {
      const specialTitle = 'Test\'s Post with "quotes" & symbols';
      const specialContent = 'Content with <html> tags & special chars: @#$%';
      const mockPost = {
        id: '2',
        user_id: '123',
        title: specialTitle,
        content: specialContent,
        posted_at: '2024-01-04T00:00:00Z',
      };

      mockConnection.query.mockResolvedValueOnce({
        rows: [mockPost],
        rowCount: 1,
      });

      const result = await service.createPost(
        123,
        specialTitle,
        specialContent,
      );

      expect(mockConnection.query).toHaveBeenCalledWith(
        `INSERT INTO idst.posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *`,
        [123, specialTitle, specialContent],
      );
      expect(result).toEqual(mockPost);
    });

    it('should handle database errors when creating post', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const dbError = new Error('Foreign key constraint violation');

      mockConnection.query.mockRejectedValueOnce(dbError);

      await expect(service.createPost(999, 'Test', 'Content')).rejects.toThrow(
        'Foreign key constraint violation',
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(dbError);
      consoleErrorSpy.mockRestore();
    });

    it('should handle network timeout errors', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const timeoutError = new Error('Connection timeout');

      mockConnection.query.mockRejectedValueOnce(timeoutError);

      await expect(service.createPost(123, 'Test', 'Content')).rejects.toThrow(
        'Connection timeout',
      );

      consoleErrorSpy.mockRestore();
    });

    it('should handle empty title and content', async () => {
      const mockPost = {
        id: '3',
        user_id: '123',
        title: '',
        content: '',
        posted_at: '2024-01-05T00:00:00Z',
      };

      mockConnection.query.mockResolvedValueOnce({
        rows: [mockPost],
        rowCount: 1,
      });

      const result = await service.createPost(123, '', '');

      expect(result.title).toBe('');
      expect(result.content).toBe('');
    });

    it('should return the created post with all fields', async () => {
      const mockPost = {
        id: '4',
        user_id: '456',
        title: 'Complete Post',
        content: 'Complete Content',
        posted_at: '2024-01-06T00:00:00Z',
        edited_at: null,
      };

      mockConnection.query.mockResolvedValueOnce({
        rows: [mockPost],
        rowCount: 1,
      });

      const result = await service.createPost(
        456,
        'Complete Post',
        'Complete Content',
      );

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('user_id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('posted_at');
    });
  });

  describe('getPosts', () => {
    it('should return all posts with usernames', async () => {
      const mockPosts = [
        {
          id: '1',
          user_id: '123',
          username: 'user1',
          title: 'First Post',
          content: 'First content',
          posted_at: '2024-01-02T00:00:00Z',
        },
        {
          id: '2',
          user_id: '456',
          username: 'user2',
          title: 'Second Post',
          content: 'Second content',
          posted_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockConnection.query.mockResolvedValueOnce({
        rows: mockPosts,
        rowCount: 2,
      });

      const result = await service.getPosts();

      expect(mockConnection.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT p.*, u.username'),
      );
      expect(result).toEqual(mockPosts);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('username');
    });

    it('should return empty array when no posts exist', async () => {
      mockConnection.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const result = await service.getPosts();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return posts ordered by posted_at DESC', async () => {
      const mockPosts = [
        {
          id: '3',
          user_id: '123',
          username: 'user1',
          title: 'Newest Post',
          content: 'Newest content',
          posted_at: '2024-01-10T00:00:00Z',
        },
        {
          id: '2',
          user_id: '456',
          username: 'user2',
          title: 'Middle Post',
          content: 'Middle content',
          posted_at: '2024-01-05T00:00:00Z',
        },
        {
          id: '1',
          user_id: '789',
          username: 'user3',
          title: 'Oldest Post',
          content: 'Oldest content',
          posted_at: '2024-01-01T00:00:00Z',
        },
      ];

      mockConnection.query.mockResolvedValueOnce({
        rows: mockPosts,
        rowCount: 3,
      });

      const result = await service.getPosts();

      expect(result).toHaveLength(3);
      expect(result[0].title).toBe('Newest Post');
      expect(result[2].title).toBe('Oldest Post');
    });

    it('should include all post fields in response', async () => {
      const mockPosts = [
        {
          id: '1',
          user_id: '123',
          username: 'testuser',
          title: 'Test Post',
          content: 'Test content',
          posted_at: '2024-01-01T00:00:00Z',
          edited_at: null,
        },
      ];

      mockConnection.query.mockResolvedValueOnce({
        rows: mockPosts,
        rowCount: 1,
      });

      const result = await service.getPosts();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('user_id');
      expect(result[0]).toHaveProperty('username');
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('content');
      expect(result[0]).toHaveProperty('posted_at');
    });

    it('should handle database errors and return empty array', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const dbError = new Error('Database connection failed');

      mockConnection.query.mockRejectedValueOnce(dbError);

      const result = await service.getPosts();

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('getPosts error:', dbError);
      consoleErrorSpy.mockRestore();
    });

    it('should handle query timeout errors and return empty array', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const timeoutError = new Error('Query timeout');

      mockConnection.query.mockRejectedValueOnce(timeoutError);

      const result = await service.getPosts();

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'getPosts error:',
        timeoutError,
      );
      consoleErrorSpy.mockRestore();
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

      mockConnection.query.mockResolvedValueOnce({
        rows: mockPosts,
        rowCount: 100,
      });

      const result = await service.getPosts();

      expect(result).toHaveLength(100);
      expect(result[0]).toHaveProperty('username');
    });

    it('should call query without parameters', async () => {
      mockConnection.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      await service.getPosts();

      expect(mockConnection.query).toHaveBeenCalledTimes(1);
      expect(mockConnection.query).toHaveBeenCalledWith(expect.any(String));
    });
  });

  describe('getUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [
        {
          id: '123',
          username: 'user1',
          email: 'user1@example.com',
          hashed_password: 'hash1',
          can_post: true,
        },
        {
          id: '456',
          username: 'user2',
          email: 'user2@example.com',
          hashed_password: 'hash2',
          can_post: false,
        },
      ];

      mockConnection.query.mockResolvedValueOnce({
        rows: mockUsers,
        rowCount: 2,
      });

      const result = await service.getUsers();

      expect(mockConnection.query).toHaveBeenCalledWith(
        `SELECT * FROM idst.users`,
      );
      expect(result).toEqual(mockUsers);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no users exist', async () => {
      mockConnection.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      const result = await service.getUsers();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should return all user fields', async () => {
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

      mockConnection.query.mockResolvedValueOnce({
        rows: mockUsers,
        rowCount: 1,
      });

      const result = await service.getUsers();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('username');
      expect(result[0]).toHaveProperty('email');
      expect(result[0]).toHaveProperty('hashed_password');
      expect(result[0]).toHaveProperty('can_post');
    });

    it('should handle database errors and return empty array', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const dbError = new Error('Database connection failed');

      mockConnection.query.mockRejectedValueOnce(dbError);

      const result = await service.getUsers();

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith('getUsers error:', dbError);
      consoleErrorSpy.mockRestore();
    });

    it('should handle permission errors and return empty array', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const permissionError = new Error('Permission denied');

      mockConnection.query.mockRejectedValueOnce(permissionError);

      const result = await service.getUsers();

      expect(result).toEqual([]);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'getUsers error:',
        permissionError,
      );
      consoleErrorSpy.mockRestore();
    });

    it('should handle large number of users', async () => {
      const mockUsers = Array.from({ length: 50 }, (_, i) => ({
        id: `${i + 1}`,
        username: `user${i + 1}`,
        email: `user${i + 1}@example.com`,
        hashed_password: `hash${i + 1}`,
        can_post: i % 2 === 0,
      }));

      mockConnection.query.mockResolvedValueOnce({
        rows: mockUsers,
        rowCount: 50,
      });

      const result = await service.getUsers();

      expect(result).toHaveLength(50);
      expect(result[0].username).toBe('user1');
      expect(result[49].username).toBe('user50');
    });

    it('should return users with different can_post values', async () => {
      const mockUsers = [
        {
          id: '1',
          username: 'canpost',
          email: 'can@example.com',
          hashed_password: 'hash1',
          can_post: true,
        },
        {
          id: '2',
          username: 'cannotpost',
          email: 'cannot@example.com',
          hashed_password: 'hash2',
          can_post: false,
        },
      ];

      mockConnection.query.mockResolvedValueOnce({
        rows: mockUsers,
        rowCount: 2,
      });

      const result = await service.getUsers();

      expect(result[0].can_post).toBe(true);
      expect(result[1].can_post).toBe(false);
    });

    it('should call query without parameters', async () => {
      mockConnection.query.mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      });

      await service.getUsers();

      expect(mockConnection.query).toHaveBeenCalledTimes(1);
      expect(mockConnection.query).toHaveBeenCalledWith(
        `SELECT * FROM idst.users`,
      );
    });
  });

  describe('integration scenarios', () => {
    it('should handle multiple sequential operations', async () => {
      // First call - create post
      const mockPost = {
        id: '1',
        user_id: '123',
        title: 'Test',
        content: 'Content',
      };
      mockConnection.query.mockResolvedValueOnce({
        rows: [mockPost],
        rowCount: 1,
      });

      // Second call - get posts
      mockConnection.query.mockResolvedValueOnce({
        rows: [mockPost],
        rowCount: 1,
      });

      const createResult = await service.createPost(123, 'Test', 'Content');
      const getResult = await service.getPosts();

      expect(createResult).toEqual(mockPost);
      expect(getResult).toEqual([mockPost]);
      expect(mockConnection.query).toHaveBeenCalledTimes(2);
    });

    it('should maintain connection across multiple calls', async () => {
      mockConnection.query.mockResolvedValue({ rows: [], rowCount: 0 });

      await service.getUsers();
      await service.getPosts();
      await service.getUsers();

      expect(mockConnection.query).toHaveBeenCalledTimes(3);
    });
  });
});
