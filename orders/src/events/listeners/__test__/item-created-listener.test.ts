import { ItemCreatedListener } from '../item-created-listener'; // ###
import { ItemCreatedEvent } from '@pandita/common'; // ###
import { natsWrapper } from '../../../nats-wrapper'; // ###
import mongoose from 'mongoose'; // ###
import { Item } from '../../../models/item';
import { Message } from 'node-nats-streaming'; // ###

const setup = async () => {
  // create instance of Listener
  const listener = new ItemCreatedListener(natsWrapper.client);

  // create a fake data event
  const data: ItemCreatedEvent['data'] = {
    version: 0,
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 10,
    userId: mongoose.Types.ObjectId().toHexString(),
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('creates and saves an item', async () => {
  // call setup
  const { listener, data, msg } = await setup();

  // call onMessage function with data + message
  await listener.onMessage(data, msg);

  const item = await Item.findById(data.id);

  // assert
  expect(item).toBeDefined();
  expect(item!.title).toEqual(data.title);
  expect(item!.price).toEqual(data.price);
});

it('acks the message', async () => {
  const { listener, data, msg } = await setup();

  await listener.onMessage(data, msg);

  // assert ack is called
  expect(msg.ack).toHaveBeenCalled();
});
