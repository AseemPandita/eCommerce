import express, { request, Request, Response } from 'express';
import { Order } from '../models/orders';
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@pandita/common';

const router = express.Router();

router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('item');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    res.send(order);
  }
);

export { router as showOrderRouter };
