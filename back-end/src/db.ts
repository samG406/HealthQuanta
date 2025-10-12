/* eslint-disable n/no-process-env */
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'waterlily',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
};

export const testConnection = async (): Promise<void> => {
  try {
    const connection = await pool.getConnection();
    // eslint-disable-next-line no-console
    console.log('Database connection successful!');
    connection.release();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Database connection failed:', error);
    throw error;
  }
};



const pool = mysql.createPool(dbConfig);

export default pool;