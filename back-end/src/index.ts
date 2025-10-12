import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import surveyRoutes from './routes/survey.js';
import pool from './db.js';


const app = express();
try {
  await pool.getConnection();
  app.use(cors());
  app.use(express.json());
} catch (error) {
  await pool.end();
  console.error('Middleware setup error:', error);
  throw error;
}

app.use('/auth', authRoutes);
app.use('/survey', surveyRoutes);

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));