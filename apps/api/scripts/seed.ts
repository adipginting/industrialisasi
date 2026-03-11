import { Pool } from 'pg';
import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env['PGUSER'],
  host: process.env['PGHOST'],
  database: process.env['PGDATABASE'],
  password: process.env['PGPASSWORD'],
  port: parseInt(process.env['PGPORT'] || '5432'),
});

async function seedUsers() {
  try {
    const hash = await argon2.hash('password');
    const res = await pool.query(
      `INSERT INTO idst.users (username, email, hashed_password) VALUES ('user', 'email1@example.com', $1)`,
      [hash],
    );
    console.log('✅ Users seeded successfully');
    return res;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

async function seedPosts() {
  try {
    const userRes = await pool.query(`SELECT id FROM idst.users LIMIT 1`);

    if (userRes.rows.length === 0) {
      console.log('⚠️ No users found. Please run seed:users first.');
      return;
    }

    const userId = userRes.rows[0].id;

    const posts = [
      {
        title: 'Welcome to Industrialisasi',
        content:
          'This is the first post on our platform! Feel free to create your own posts and share your thoughts with the community.',
      },
      {
        title: 'Getting Started Guide',
        content:
          'To get started, simply login using your credentials and click on Create Post in the header.',
      },
      {
        title: 'Industrial News Update',
        content:
          'The industrial sector is seeing rapid growth in automation and AI integration. Stay tuned for more updates on the latest trends.',
      },
      {
        title: 'Tips for Productivity',
        content:
          '1. Set clear goals\n2. Take regular breaks\n3. Stay organized\n4. Communicate effectively\n5. Keep learning new skills',
      },
    ];

    for (const post of posts) {
      await pool.query(
        `INSERT INTO idst.posts (user_id, title, content) VALUES ($1, $2, $3)`,
        [userId, post.title, post.content],
      );
    }

    console.log(`✅ ${posts.length} posts seeded successfully`);
  } catch (error) {
    console.error('❌ Error seeding posts:', error);
    throw error;
  }
}

async function initSchema() {
  try {
    // Drop existing tables
    await pool.query(`DROP TABLE IF EXISTS idst.posts CASCADE`);
    await pool.query(`DROP TABLE IF EXISTS idst.users CASCADE`);

    // Create users table
    await pool.query(`
      CREATE TABLE idst.users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        can_post BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create posts table
    await pool.query(`
      CREATE TABLE idst.posts (
        id SERIAL PRIMARY KEY,
        user_id UUID REFERENCES idst.users(id) ON DELETE CASCADE,
        title VARCHAR(500) NOT NULL,
        content TEXT NOT NULL,
        posted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Schema initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing schema:', error);
    throw error;
  }
}

async function seedAll() {
  try {
    await seedUsers();
    await seedPosts();
    console.log('✅ All data seeded successfully');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Main execution
const command = process.argv[2];

async function main() {
  try {
    switch (command) {
      case 'users':
        await seedUsers();
        break;
      case 'posts':
        await seedPosts();
        break;
      case 'schema':
        await initSchema();
        break;
      case 'all':
      default:
        await seedAll();
        break;
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
