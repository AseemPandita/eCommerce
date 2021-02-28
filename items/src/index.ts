import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './nats-wrapper';
import { OrderCreatedListener } from './events/listeners/order-created-listener';
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener';

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error('Cannot load JWT_KEY');
  }
  if (!process.env.MONGO_URI) {
    throw new Error('Cannot load MONGO_URI');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('Cannot load NATS_CLIENT_ID');
  }
  if (!process.env.NATS_URL) {
    throw new Error('Cannot load NATS_URL');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('Cannot load NATS_CLUSTER_ID');
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed.');
      process.exit();
    });
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log('Connected to Mongo DB [/items]');
  } catch (err) {
    console.error(err);
  }
  app.listen(3000, () => {
    console.log('Items microservice listening on port 3000 using skaffold...');
  });
};

start();
