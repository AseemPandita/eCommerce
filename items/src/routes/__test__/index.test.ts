import request from 'supertest';
import { app } from '../../app';

const createItem = () => {
  return request(app).post('/api/items').set('Cookie', global.signin()).send({
    title: 'New item',
    price: 100,
  });
};

it('can fetch a list of items', async () => {
  await createItem();
  await createItem();
  await createItem();

  const response = await request(app).get('/api/items').send().expect(200);

  expect(response.body.length).toEqual(3);
});
