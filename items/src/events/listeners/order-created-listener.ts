import { Listener, OrderCreatedEvent, Subjects } from '@pandita/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Item } from '../../models/item';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // Find the Item reserved by order
    const item = await Item.findById(data.item.id);

    // Item not found? Throw error
    if (!item) {
      throw new Error('Item not found');
    }

    // Mark Item as reserved
    item.set({ orderId: data.id });

    // Save
    await item.save();

    // Ack
    msg.ack();
  }
}
