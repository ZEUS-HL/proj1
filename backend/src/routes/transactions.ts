import { Router } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  toggleComplete,
  deleteTransaction,
  getSummary,
} from '../controllers/transactionController';

const router = Router();

router.get('/summary', getSummary);
router.get('/', getTransactions);
router.post('/', createTransaction);
router.put('/:id', updateTransaction);
router.patch('/:id/complete', toggleComplete);
router.delete('/:id', deleteTransaction);

export default router;
