import { Message } from 'node-nats-streaming';
import { Subjects, Listener, ItemCreatedEvent } from '@pandita/common';
import { Item } from '../../models/item';
import { queueGroupName } from './queue-group-name';

export class ItemCreatedListener extends Listener<ItemCreatedEvent> {
  subject: Subjects.ItemCreated = Subjects.ItemCreated;
  queGroupName = queueGroupName;

  async onMessage(data: ItemCreatedEvent['data'], msg: Message) {
    const { title, price } = data;
    const item = Item.build({
      title,
      price,
    });
    await item.save();

    msg.ack();
  }
}
