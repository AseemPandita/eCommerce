import request from 'supertest';
import { app } from '../../app';
import { Item } from '../../models/item';
import mongoose from 'mongoose';

it('fetches the order', async () => {
  // create an item
  const item = Item.build({
    id: mongoose.Types.ObjectId().toHexString(),

    title: 'Concert Ticket',
    price: 20,
  });
  await item.save();

  // make req to build order with the item
  const user = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ itemId: item.id })
    .expect(201);

  // make request to fetch order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it('returns error when user is not authorized', async () => {
  // create an item
  const item = Item.build({
    id: mongoose.Types.ObjectId().toHexString(),

    title: 'Concert Ticket',
    price: 20,
  });
  await item.save();

  // make req to build order with the item
  const user = global.signin();
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ itemId: item.id })
    .expect(201);

  // make request to fetch order
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set('Cookie', global.signin())
    .send()
    .expect(401);
});
