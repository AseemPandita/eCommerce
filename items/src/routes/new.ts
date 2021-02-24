import express, { Request, Response } from 'express';
import { requireAuth, validateRequest } from '@pandita/common';
import { body } from 'express-validator';
import { Item } from '../models/item';

const router = express.Router();

router.post(
  '/api/items',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const item = Item.build({
      title,
      price,
      userId: req.currentUser!.id,
    });
    await item.save();

    res.status(201).send(item);
  }
);

export { router as createItemRouter };
