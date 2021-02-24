import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';

it('Returns 404 if item id does not exist', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/items/${id}`)
    .set('Cookie', global.signin())
    .send({
      title: 'Title Goes Here',
      price: 20,
    })
    .expect(404);
});

it('Returns 401 if user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  await request(app)
    .put(`/api/items/${id}`)
    .send({
      title: 'Title Goes Here',
      price: 20,
    })
    .expect(401);
});

it('Returns 401 if user does not own the item', async () => {
  const response = await request(app)
    .post(`/api/items/`)
    .set('Cookie', global.signin())
    .send({
      title: 'Title Goes Here',
      price: 20,
    });

  await request(app)
    .put(`/api/items/${response.body.id}`)
    .send({
      title: 'Updated Title',
      price: 1000,
    })
    .expect(401);
});

it('Returns 400 if user provides invalid item title or price', async () => {
  const cookie = global.signin();
  const response = await request(app)
    .post(`/api/items/`)
    .set('Cookie', cookie)
    .send({
      title: 'Title Goes Here',
      price: 20,
    });

  await request(app)
    .put(`/api/items/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: '',
      price: 20,
    })
    .expect(400);

  await request(app)
    .put(`/api/items/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Valid Title',
      price: -20,
    })
    .expect(400);
});

it('Updates item if input is valid', async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post(`/api/items/`)
    .set('Cookie', cookie)
    .send({
      title: 'Title Goes Here',
      price: 20,
    });

  await request(app)
    .put(`/api/items/${response.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'Updated Title',
      price: 10000,
    })
    .expect(200);

  const itemResponse = await request(app)
    .get(`/api/items/${response.body.id}`)
    .send();

  expect(itemResponse.body.title).toEqual('Updated Title');
  expect(itemResponse.body.price).toEqual(10000);
});
