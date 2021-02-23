import request from 'supertest';
import { app } from '../../app';

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

  await request(app)
    .post('/api/items')
    .send({
      title: 'Title Goes Here',
      price: 100,
    })
    .expect(201);
});
