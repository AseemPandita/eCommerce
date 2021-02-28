import { ItemUpdatedListener } from '../item-updated-listener'; // ###
import { natsWrapper } from '../../../nats-wrapper'; // ###
import { Item } from '../../../models/item'; // ###
import mongoose from 'mongoose'; // ###
import { Message } from 'node-nats-streaming'; // ###
import { ItemUpdatedEvent } from '@pandita/common'; // ###

const setup = async () => {
  // create listener
  const listener = new ItemUpdatedListener(natsWrapper.client);

  // create and save an item
  const item = Item.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: 'concert ticket',
    price: 20,
  });
  await item.save();

  // create a fake data object
  const data: ItemUpdatedEvent['data'] = {
    id: item.id,
    version: item.version + 1,
    title: 'new title',
    price: 100,
    userId: 'newId',
  };

  // create a fake message
  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { msg, data, item, listener };
};

it('finds, updates, saves item', async () => {
  const { msg, data, item, listener } = await setup();

  await listener.onMessage(data, msg);

  const updatedItem = await Item.findById(item.id);

  expect(updatedItem!.title).toEqual(data.title);
  expect(updatedItem!.price).toEqual(data.price);
  expect(updatedItem!.version).toEqual(data.version);
});

it('acks message', async () => {
  const { msg, data, item, listener } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
