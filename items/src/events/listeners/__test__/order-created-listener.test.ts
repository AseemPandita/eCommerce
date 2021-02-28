import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Item } from '../../../models/item';
import { OrderCreatedEvent, OrderStatus } from '@pandita/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client);

  const item = Item.build({
    title: 'New Item',
    price: 20,
    userId: 'test',
  });
  await item.save();

  const data: OrderCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: 'test1',
    expiresAt: 'test1',
    item: {
      id: item.id,
      price: item.price,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, item, data, msg };
};

it('sets order id of ticket', async () => {
  const { listener, item, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedItem = await Item.findById(item.id);

  expect(updatedItem!.orderId).toEqual(data.id);
});

it('ack', async () => {
  const { listener, item, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it('publishes item updated event', async () => {
  const { listener, item, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const itemUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(itemUpdatedData.orderId);
});
