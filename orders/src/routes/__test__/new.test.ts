import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Order, OrderStatus } from '../../models/orders';
import { Item } from '../../models/item';

it('return error if item does not exist', async () => {
  const itemId = mongoose.Types.ObjectId();

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ itemId })
    .expect(404);
});

it('return error if item already reserved', async () => {
  // Save item to DB
  const item = Item.build({
    title: 'New title',
    price: 20,
  });
  await item.save();

  // Create order with the item created above
  const order = Order.build({
    item,
    userId: 'asdasd',
    status: OrderStatus.Created,
    expiresAt: new Date(),
  });
  await order.save();

  // const existingItem = await Item.findById(item.id);
  // console.log('Item', existingItem!.id);
  // const isReserved = await item.isReserved();
  // console.log('Is the item reserved?: ', isReserved);

  // try creating an order with the reserved item
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ itemId: item.id })
    .expect(400);
});

it('reserves item ', async () => {
  // Save item to DB
  const item = Item.build({
    title: 'New title',
    price: 20,
  });
  await item.save();

  // try creating an order with the reserved item
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signin())
    .send({ itemId: item.id })
    .expect(201);
});

it.todo('emits the event');
