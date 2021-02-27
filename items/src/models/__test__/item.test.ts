import { Item } from '../item';

it('implements optimistic concurrency control', async () => {
  const item = Item.build({
    title: 'A brand New Boooook',
    price: 200,
    userId: 'aha',
  });
  await item.save();

  const firstInstance = await Item.findById(item.id);
  const secondInstance = await Item.findById(item.id);

  firstInstance!.set({ price: 20 });
  secondInstance!.set({ price: 15 });

  await firstInstance!.save();
  await expect(secondInstance!.save()).rejects.toThrow();
});

it('increments version number', async () => {
  const item = Item.build({
    title: 'new',
    price: 10,
    userId: '123',
  });

  await item.save();
  expect(item.version).toEqual(0);
  await item.save();
  expect(item.version).toEqual(1);
  await item.save();
  expect(item.version).toEqual(2);
});
