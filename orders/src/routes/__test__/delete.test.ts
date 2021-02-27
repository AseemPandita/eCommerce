import request from 'supertest';
import { app } from '../../app';
import { Item } from '../../models/item';
import { Order, OrderStatus } from '../../models/orders';

it('marks order as cancelled', async () => {
  const item = Item.build({
    title: 'New Title',
    price: 20,
  });
  await item.save();

  const user = global.signin();

  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ itemId: item.id })
    .expect(201);

  const { body: deletedOrder } = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .send()
    .expect(204);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it.todo('emits an event');
