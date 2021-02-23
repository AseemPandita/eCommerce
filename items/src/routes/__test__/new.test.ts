import request from 'supertest';
import { app } from '../../app';
import { Item } from '../../models/item';

it('Has a router handler listening to /api/items for post requests', async () => {
  const response = await request(app).post('/api/items').send({});
  expect(response.status).not.toEqual(404);
});

it('Can only be accessed if user is signed in', async () => {
  await request(app).post('/api/items').send({}).expect(401);
});

it('Returns a status other than 401 if user is signed in', async () => {
  const response = await request(app)
    .post('/api/items')
    .set('Cookie', global.signin())
    .send({});

  expect(response.status).not.toEqual(401);
});

it('Returns an error if an invalid title provided', async () => {
  await request(app)
    .post('/api/items')
    .set('Cookie', global.signin())
    .send({
      title: '',
      price: 10,
    })
    .expect(400);
});

it('Returns an error if an invalid price is provided', async () => {
  await request(app)
    .post('/api/items')
    .set('Cookie', global.signin())
    .send({
      title: 'Title Goes Here',
      price: -10,
    })
    .expect(400);

  await request(app)
    .post('/api/items')
    .set('Cookie', global.signin())
    .send({
      title: 'Title Goes Here',
    })
    .expect(400);
});

it('Creates a new item with valid request', async () => {
  // Add check to ensure item was saved.
  let items = await Item.find({});
  expect(items.length).toEqual(0);
  const title = 'Title Goes Here';
  const price = 100;

  await request(app)
    .post('/api/items')
    .set('Cookie', global.signin())
    .send({
      title: title,
      price: price,
    })

    .expect(201);

  items = await Item.find({});
  expect(items.length).toEqual(1);
  expect(items[0].title).toEqual(title);
  expect(items[0].price).toEqual(price);
});
