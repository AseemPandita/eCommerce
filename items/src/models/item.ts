import mongoose, { mongo } from 'mongoose';

interface ItemAttrs {
  title: string;
  price: number;
  userId: string;
}

interface ItemDoc extends mongoose.Document {
  title: string;
  price: string;
  userId: string;
}

interface ItemModel extends mongoose.Model<ItemDoc> {
  build(attrs: ItemAttrs): ItemDoc;
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
    },
    userId: {
      type: String,
      required: true,
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

itemSchema.statics.build = (attrs: ItemAttrs) => {
  return new Item(attrs);
};

const Item = mongoose.model<ItemDoc, ItemModel>('Item', itemSchema);

export { Item };
