import express, { Request, Response } from 'express';
import { Item } from '../models/item';

const router = express.Router();

router.get('/api/items', async (req: Request, res: Response) => {
  const items = await Item.find({});

  res.send(items);
});

export { router as indexItemRouter };
