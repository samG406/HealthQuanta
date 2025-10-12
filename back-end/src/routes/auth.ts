/* eslint-disable n/no-process-env */
import { Router, type Request, type Response } from 'express';
import { type RowDataPacket, type ResultSetHeader } from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

type UserRow = RowDataPacket & {
  id: number,
  email: string,
  password: string,
};

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET ?? 'secret';

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string, password?: string };
  if (!email || !password) 
    return res.status(400).json({ error: 'Email and password required' });

  const [rows] = await pool.query<UserRow[]>(
    'SELECT id, email, password FROM users WHERE email = ?',
    [email],
  );
  if (rows.length === 0) 
    return res.status(400).json({ error: 'Invalid credentials' });

  const user = rows[0]!;
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

router.post('/signup', async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string, password?: string };
  if (!email || !password) 
    return res.status(400).json({ error: 'Email and password required' });

  const [existing] = await pool.query<UserRow[]>(
    'SELECT id FROM users WHERE email = ?',
    [email],
  );
  if (existing.length > 0)
    return res.status(400).json({ error: 'User already exists' });

  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query<ResultSetHeader>(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, hash],
  );

  const token = jwt.sign(
    { id: result.insertId, email }, JWT_SECRET, { expiresIn: '24h' });
  res.json({ token });
});

export default router;