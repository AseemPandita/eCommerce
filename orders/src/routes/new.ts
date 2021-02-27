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

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 15 * 60;

router.post(
  'api/orders',
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

    // Find the ticket user is trying to purchase
    const item = await Item.findById(itemId);
    if (!item) {
      throw new NotFoundError();
    }

    // Ticket should not be already purchased
    const isReserved = await item.isReserved();
    if (isReserved) {
      throw new BadRequestError('Ticket is already reserved');
    }

    // Calculate expiration for ticket purchase
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

    res.status(201).send(order);
  }
);

export { router as newOrderRouter };
