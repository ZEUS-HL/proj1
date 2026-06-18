import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'expenses-dev-secret-change-in-prod';

export interface AuthRequest extends Request {
  userId?: number;
  userName?: string;
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, SECRET) as { id: number; name: string };
    req.userId = payload.id;
    req.userName = payload.name;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function signToken(payload: { id: number; name: string; email: string }): string {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}
