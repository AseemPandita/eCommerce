import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Order } from '../../../models/orders';
import { Item } from '../../../models/item';
import mongoose from 'mongoose';
import { OrderStatus, ExpirationCompleteEvent } from '@pandita/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const item = Item.build({
    title: 'new item',
    price: 20,
    id: mongoose.Types.ObjectId().toHexString(),
  });
  await item.save();

  const order = Order.build({
    status: OrderStatus.Created,
    userId: 'random',
    expiresAt: new Date(),
    item,
  });
  await order.save();

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, order, item, data, msg };
};

it('updates order to cancelled', async () => {
  const { listener, order, item, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit order cancelled event', async () => {
  const { listener, order, item, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(eventData.id).toEqual(order.id);
});

it('ack the message', async () => {
  const { listener, order, item, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
