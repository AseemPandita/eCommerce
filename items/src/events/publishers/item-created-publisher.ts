import { Publisher, Subjects, ItemCreatedEvent } from '@pandita/common';

export class ItemCreatedPublisher extends Publisher<ItemCreatedEvent> {
  subject: Subjects.ItemCreated = Subjects.ItemCreated;
}
