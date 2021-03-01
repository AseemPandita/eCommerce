import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import {
  validateRequest,
  NotAuthorizedError,
  requireAuth,
  NotFoundError,
  BadRequestError,
} from '@pandita/common';
import { Item } from '../models/item';
import { ItemUpdatedPublisher } from '../events/publishers/item-updated-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.put(
  '/api/items/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price is required and be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const item = await Item.findById(req.params.id);

    if (!item) {
      throw new NotFoundError();
    }

    if (item.orderId) {
      throw new BadRequestError('Cannot edit reserved Item');
    }

    if (item.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    item.set({
      title: req.body.title,
      price: req.body.price,
    });

    await item.save();

    new ItemUpdatedPublisher(natsWrapper.client).publish({
      id: item.id,
      title: item.title,
      price: item.price,
      userId: item.userId,
      version: item.version,
    });

    res.send(item);
  }
);

export { router as updateItemRouter };
