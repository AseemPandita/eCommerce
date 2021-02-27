import request from 'supertest';
import { app } from '../../app';
import { Item } from '../../models/item';

const buildItem = async () => {
  const item = Item.build({
    title: 'Concert Ticket',
    price: 20,
  });
  await item.save();

  return item;
};

it('returns orders for a user', async () => {
  // Create three items
  const itemOne = await buildItem();
  const itemTwo = await buildItem();
  const itemThree = await buildItem();

  // Create one order as user #1
  const userOne = global.signin();
  await request(app)
    .post('/api/orders')
    .set('Cookie', userOne)
    .send({
      itemId: itemOne.id,
    })
    .expect(201);

  // Create one order as user #2
  const userTwo = global.signin();
  const { body: orderOne } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({
      itemId: itemTwo.id,
    })
    .expect(201);

  const { body: orderTwo } = await request(app)
    .post('/api/orders')
    .set('Cookie', userTwo)
    .send({
      itemId: itemThree.id,
    })
    .expect(201);

  // Make request to get orders for user #2
  const response = await request(app)
    .get('/api/orders')
    .set('Cookie', userTwo)
    .expect(200);

  // Make sure we only get orders for user 2
  expect(response.body.length).toEqual(2);

  expect(response.body[0].id).toEqual(orderOne.id);
  expect(response.body[1].id).toEqual(orderTwo.id);
  expect(response.body[0].item.id).toEqual(itemTwo.id);
  expect(response.body[1].item.id).toEqual(itemThree.id);
});
