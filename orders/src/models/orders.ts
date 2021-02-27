import mongoose from 'mongoose';
import { OrderStatus } from '@pandita/common';
import { ItemDoc } from './item';

export { OrderStatus };

interface orderAttrs {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  item: ItemDoc;
}

interface OrderDoc extends mongoose.Document {
  userId: string;
  status: OrderStatus;
  expiresAt: Date;
  item: ItemDoc;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
  build(attrs: orderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: {
      type: mongoose.Schema.Types.Date,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
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

orderSchema.statics.build = (attrs: orderAttrs) => {
  return new Order(attrs);
};

const Order = mongoose.model<OrderDoc, OrderModel>('Order', orderSchema);

export { Order };
