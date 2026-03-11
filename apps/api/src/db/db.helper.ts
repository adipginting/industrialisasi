import { Pool } from 'pg';
import { PG_CONNECTION } from 'src/constants';
import * as dotenv from 'dotenv';
dotenv.config();

export const pgConnection = {
  provide: PG_CONNECTION,
  useValue: new Pool({
    user: process.env['PGUSER'],
    host: process.env['PGHOST'],
    database: process.env['PGDATABASE'],
    password: process.env['PGPASSWORD'],
    port: process.env['PGPORT'],
  }),
};
