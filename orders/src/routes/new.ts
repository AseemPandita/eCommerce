import express, { Request, Response } from 'express';
import {
  BadRequestError,
  NotFoundError,
  OrderStatus,
  requireAuth,
  validateRequest,
} from '@pandita/common';
import { body } from 'express-validator';
import mongoose, { mongo } from 'mongoose';
import { Item } from '../models/item';
import { Order } from '../models/orders';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  '/api/orders',
  requireAuth,
  [
    body('itemId')
      .not()
      .isEmpty()
      .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
      .withMessage('itemId must be provided'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { itemId } = req.body;

    // Find the item user is trying to purchase
    const item = await Item.findById(itemId);
    if (!item) {
      throw new NotFoundError();
    }

    // item should not be already purchased
    const isReserved = await item.isReserved();
    if (isReserved) {
      throw new BadRequestError('Item is already reserved');
    }

    // Calculate expiration for item purchase
    const expiration = new Date();
    expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS);

    // Build order and save
    const order = Order.build({
      userId: req.currentUser!.id,
      status: OrderStatus.Created,
      expiresAt: expiration,
      item,
    });
    await order.save();

    // Publish event
    new OrderCreatedPublisher(natsWrapper.client).publish({
      id: order.id,
      status: order.status,
      userId: order.userId,
      expiresAt: order.expiresAt.toISOString(),
      item: {
        id: item.id,
        price: item.price,
      },
    });

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
