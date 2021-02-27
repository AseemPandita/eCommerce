import { Publisher, OrderCancelledEvent, Subjects } from '@pandita/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
