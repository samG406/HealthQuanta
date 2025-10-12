import jwt from 'jsonwebtoken';
import { type Response, type NextFunction, type Request } from 'express';

const JWT_SECRET = process.env.JWT_SECRET ?? 'secret';

export interface AuthRequest extends Request {
  userId?: number;
}

export const authenticationtoken = (req:AuthRequest, 
  res:Response,
  next:NextFunction,
  ):void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number };
    req.userId = decoded.id;
    next();
  } catch {
    res.status(403).json({ error: 'Invalid or expired token' });
  }
}
