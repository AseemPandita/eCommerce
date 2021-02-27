import { Publisher, OrderCreatedEvent, Subjects } from '@pandita/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
