import mongoose from 'mongoose';
import { Order, OrderStatus } from './orders';
import { updateIfCurrentPlugin } from 'mongoose-update-if-current';

interface ItemAttrs {
  id: string;
  title: string;
  price: number;
}

export interface ItemDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<boolean>;
}

interface ItemModel extends mongoose.Model<ItemDoc> {
  build(attrs: ItemAttrs): ItemDoc;
  findByEvent(event: { id: string; version: number }): Promise<ItemDoc | null>;
}

const itemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

itemSchema.set('versionKey', 'version');
itemSchema.plugin(updateIfCurrentPlugin);

itemSchema.statics.findByEvent = (event: { id: string; version: number }) => {
  return Item.findOne({
    _id: event.id,
    version: event.version - 1,
  });
};
itemSchema.statics.build = (attrs: ItemAttrs) => {
  return new Item({
    _id: attrs.id,
    title: attrs.title,
    price: attrs.price,
  });
};

itemSchema.methods.isReserved = async function () {
  const existingOrder = await Order.findOne({
    item: this,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.AwaitingPayment,
        OrderStatus.Complete,
      ],
    },
  });

  return !!existingOrder;
};

const Item = mongoose.model<ItemDoc, ItemModel>('Item', itemSchema);

export { Item };
