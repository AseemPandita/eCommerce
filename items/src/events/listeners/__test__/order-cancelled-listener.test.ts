import { OrderCancelledListener } from '../order-cancelled-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Item } from '../../../models/item';
import { OrderCancelledEvent, OrderStatus } from '@pandita/common';
import mongoose from 'mongoose';

const setup = async () => {
  const listener = new OrderCancelledListener(natsWrapper.client);

  const orderId = mongoose.Types.ObjectId().toHexString();
  const item = Item.build({
    title: 'New Item',
    price: 20,
    userId: 'test',
  });
  item.set({ orderId });
  await item.save();

  const data: OrderCancelledEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    item: {
      id: item.id,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, item, data, msg, orderId };
};

it('updates item after order is cancelled, publishes event, ack message', async () => {
  const { listener, item, data, msg, orderId } = await setup();

  await listener.onMessage(data, msg);

  const updatedItem = await Item.findById(item.id);

  expect(updatedItem!.orderId).not.toBeDefined();
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
