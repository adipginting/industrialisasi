import { Inject } from '@nestjs/common';
import { PG_CONNECTION } from '../constants';

export class DbService {
  constructor(@Inject(PG_CONNECTION) private conn: any) {}

  async createPost(userId: number, title: string, content: string) {
    try {
      const res = await this.conn.query(
        `INSERT INTO idst.posts (user_id, title, content) VALUES ($1, $2, $3) RETURNING *`,
        [userId, title, content],
      );
      return res.rows[0];
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getPosts() {
    try {
      const res = await this.conn.query(`
        SELECT p.*, u.username 
        FROM idst.posts p 
        JOIN idst.users u ON p.user_id = u.id 
        ORDER BY p.posted_at DESC
      `);
      return res.rows;
    } catch (error) {
      console.error('getPosts error:', error);
      return [];
    }
  }

  async getUsers() {
    try {
      const res = await this.conn.query(`SELECT * FROM idst.users`);
      return res.rows;
    } catch (error) {
      console.error('getUsers error:', error);
      return [];
    }
  }
}
