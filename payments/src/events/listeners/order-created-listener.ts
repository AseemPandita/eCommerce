import { Listener, OrderCreatedEvent, Subjects } from '@pandita/common';
import { queueGroupName } from './queue-group-name';
import { Message } from 'node-nats-streaming';
import { Order } from '../../models/order';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
  queGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    const order = Order.build({
      id: data.id,
      version: data.version,
      userId: data.userId,
      price: data.item.price,
      status: data.status,
    });
    await order.save();

    msg.ack();
  }
}
