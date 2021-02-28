import express, { request, Request, Response } from 'express';
import { Order, OrderStatus } from '../models/orders';
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@pandita/common';
import { OrderCancelledPublisher } from '../events/publishers/order-cancelled-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.delete(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate('item');

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    order.status = OrderStatus.Cancelled;
    await order.save();

    new OrderCancelledPublisher(natsWrapper.client).publish({
      id: order.id,
      // temp fix
      version: order.__v!,
      item: {
        id: order.item.id,
      },
    });

    res.status(204).send(order);
  }
);

export { router as deleteOrderRouter };
