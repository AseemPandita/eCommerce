import mongoose from 'mongoose';

interface ItemAttrs {
  title: string;
  price: number;
}

export interface ItemDoc extends mongoose.Document {
  title: string;
  price: number;
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

itemSchema.statics.build = (attrs: ItemAttrs) => {
  return new Item(attrs);
};

const Item = mongoose.model<ItemDoc, ItemModel>('Item', itemSchema);

export { Item };
