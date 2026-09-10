import { Router } from 'express';
import { db } from '../db/store.js';

export const paymentsRouter = Router();

// GET /api/payments
paymentsRouter.get('/', async (req, res) => {
  try {
    const { saleId } = req.query;
    if (saleId && typeof saleId === 'string') {
      const payments = await db.payments.getBySaleId(saleId);
      return res.json(payments);
    }
    const all = await db.payments.getAll();
    return res.json(all);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/payments (Add payment to an existing installment sale)
paymentsRouter.post('/', async (req, res) => {
  try {
    const { saleId, amount, recordedBy, paymentDate } = req.body;

    if (!saleId) {
      return res.status(400).json({ error: 'Sale ID is required' });
    }
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Payment amount must be greater than 0' });
    }

    const result = await db.payments.addPayment({
      saleId,
      amount: parseFloat(amount),
      recordedBy: recordedBy || 'user-staff-1',
      paymentDate,
    });

    return res.status(201).json(result);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});
