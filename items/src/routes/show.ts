import { NotFoundError } from '@pandita/common';
import express, { Request, Response } from 'express';
import { Item } from '../models/item';

const router = express.Router();

router.get('/api/items/:id', async (req: Request, res: Response) => {
  const item = await Item.findById(req.params.id);
  if (!item) {
    throw new NotFoundError();
  }

  res.send(item);
});

export { router as showItemRouter };
