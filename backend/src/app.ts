import express from 'express';
import cors from 'cors';
import transactionRoutes from './routes/transactions';
import authRoutes from './routes/auth';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

app.get('/api/health', async (_req, res) => {
  try {
    const { neon } = await import('@neondatabase/serverless');
    const url = process.env.DATABASE_URL;
    if (!url) return res.status(500).json({ status: 'error', reason: 'DATABASE_URL not set' });
    const db = neon(url);
    await db`SELECT 1`;
    res.json({ status: 'ok', db: 'connected' });
  } catch (e: any) {
    res.status(500).json({ status: 'error', reason: e.message });
  }
});

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
