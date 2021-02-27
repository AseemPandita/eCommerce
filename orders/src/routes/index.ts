import express, { Request, Response } from 'express';
import { requireAuth } from '@pandita/common';
import { Order } from '../models/orders';

const router = express.Router();

router.get('/api/orders', requireAuth, async (req: Request, res: Response) => {
  const orders = await Order.find({
    userId: req.currentUser!.id,
  }).populate('item');

  res.send(orders);
});

export { router as indexOrderRouter };
