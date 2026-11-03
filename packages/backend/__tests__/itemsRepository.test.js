const { createDb } = require('../src/db');
const { createItemsRepository } = require('../src/repositories/itemsRepository');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('itemsRepository', () => {
  let db;
  let repo;

  beforeEach(() => {
    db = createDb();
    repo = createItemsRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('creates an item with matching created_at and updated_at', () => {
    const item = repo.create('First');

    expect(item).toMatchObject({ id: expect.any(Number), name: 'First' });
    expect(item.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(item.updated_at).toBe(item.created_at);
  });

  it('lists items in the order they were added', () => {
    repo.create('A');
    repo.create('B');
    repo.create('C');

    expect(repo.findAll().map((i) => i.name)).toEqual(['A', 'B', 'C']);
  });

  it('keeps the relative order of remaining items after a delete', () => {
    repo.create('A');
    const b = repo.create('B');
    repo.create('C');

    expect(repo.remove(b.id)).toBe(true);
    expect(repo.findAll().map((i) => i.name)).toEqual(['A', 'C']);
  });

  it('updates the name and updated_at but not created_at', async () => {
    const item = repo.create('Old');
    await wait(5);

    const updated = repo.update(item.id, 'New');

    expect(updated.name).toBe('New');
    expect(updated.created_at).toBe(item.created_at);
    expect(updated.updated_at).not.toBe(item.updated_at);
  });

  it('returns null when updating a missing item', () => {
    expect(repo.update(999, 'x')).toBeNull();
  });

  it('returns false when removing a missing item', () => {
    expect(repo.remove(999)).toBe(false);
  });

  it('finds an item by id', () => {
    const item = repo.create('Find me');

    expect(repo.findById(item.id)).toEqual(item);
    expect(repo.findById(999)).toBeUndefined();
  });
});
