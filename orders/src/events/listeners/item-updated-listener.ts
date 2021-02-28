import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ItemUpdatedEvent } from '@pandita/common';
import { Item } from '../../models/item';
import { queueGroupName } from './queue-group-name';

export class ItemUpdatedListener extends Listener<ItemUpdatedEvent> {
  subject: Subjects.ItemUpdated = Subjects.ItemUpdated;
  queGroupName = queueGroupName;

  async onMessage(data: ItemUpdatedEvent['data'], msg: Message) {
    const item = await Item.findByEvent(data);

    if (!item) {
      throw new Error('Item not found');
    }

    const { title, price } = data;

    item.set({ title, price });
    await item.save();

    msg.ack();
  }
}
