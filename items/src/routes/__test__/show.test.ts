import request from 'supertest';
import { isFunctionExpression } from 'typescript';
import { app } from '../../app';
import mongoose from 'mongoose';

it('returns 404, if item not found', async () => {
  const id = new mongoose.Types.ObjectId().toHexString();
  const response = await request(app)
    .get(`/api/items/${id}`)
    .send()
    .expect(404);

  //console.log(response.body);
});

it('returns item, if item found', async () => {
  const title = 'New Item';
  const price = 20;

  const response = await request(app)
    .post('/api/items')
    .set('Cookie', global.signin())
    .send({
      title,
      price,
    })
    .expect(201);

  const itemResponse = await request(app)
    .get(`/api/items/${response.body.id}`)
    .send()
    .expect(200);
});
