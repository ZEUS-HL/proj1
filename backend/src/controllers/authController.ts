import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { userDb } from '../db';
import { signToken } from '../middleware/auth';
import { LoginDTO, RegisterDTO } from '../types/user';

export const register = async (req: Request, res: Response) => {
  const { name, email, password }: RegisterDTO = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'name, email, and password are required' });
  }
  if (userDb.findByEmail(email)) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const password_hash = await bcrypt.hash(password, 10);
  const user = userDb.insert({ name, email, password_hash });
  const token = signToken({ id: user.id, name: user.name, email: user.email });
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
};

export const login = async (req: Request, res: Response) => {
  const { email, password }: LoginDTO = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const user = userDb.findByEmail(email);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid email or password' });
  const token = signToken({ id: user.id, name: user.name, email: user.email });
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
};

export const me = (req: Request & { userId?: number }, res: Response) => {
  const user = userDb.findById(req.userId!);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, email: user.email });
};
