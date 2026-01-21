import * as mysql from 'mysql2/promise';
import { envSchema } from '../config/env';

export async function pingMySql() {
  const env = envSchema.parse(process.env);

  const conn = await mysql.createConnection({
    host: env.DB_HOST,
    port: env.DB_PORT,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
  });

  try {
    const [rows] = await conn.query('SELECT 1 AS ok');
    console.log('[DB] MySQL conectado ✅', rows);
  } finally {
    await conn.end();
  }
}
