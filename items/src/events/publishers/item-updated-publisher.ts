import { Publisher, Subjects, ItemUpdatedEvent } from '@pandita/common';

export class ItemUpdatedPublisher extends Publisher<ItemUpdatedEvent> {
  subject: Subjects.ItemUpdated = Subjects.ItemUpdated;
}
