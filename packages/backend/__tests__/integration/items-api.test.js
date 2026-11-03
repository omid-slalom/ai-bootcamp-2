const request = require('supertest');
const { createApp } = require('../../src/app');
const { createDb } = require('../../src/db');
const { createItemsRepository } = require('../../src/repositories/itemsRepository');

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Items API', () => {
  let db;
  let app;

  beforeEach(() => {
    db = createDb();
    app = createApp({ itemsRepository: createItemsRepository(db) });
  });

  afterEach(() => {
    db.close();
  });

  const createItem = async (name) => {
    const response = await request(app).post('/api/items').send({ name });
    expect(response.status).toBe(201);
    return response.body;
  };

  describe('GET /api/items', () => {
    it('returns an empty list when there are no items', async () => {
      const response = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('returns items in the order they were added', async () => {
      await createItem('A');
      await createItem('B');
      await createItem('C');

      const response = await request(app).get('/api/items');

      expect(response.body.map((i) => i.name)).toEqual(['A', 'B', 'C']);
    });
  });

  describe('POST /api/items', () => {
    it('creates an item with timestamps', async () => {
      const response = await request(app).post('/api/items').send({ name: 'Test Item' });

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ id: expect.any(Number), name: 'Test Item' });
      expect(response.body.created_at).toBeDefined();
      expect(response.body.updated_at).toBe(response.body.created_at);
    });

    it('trims the name', async () => {
      const response = await request(app).post('/api/items').send({ name: '  padded  ' });

      expect(response.body.name).toBe('padded');
    });

    it.each([{}, { name: '' }, { name: '   ' }, { name: 5 }])('returns 400 for body %p', async (body) => {
      const response = await request(app).post('/api/items').send(body);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Item name is required' });
    });
  });

  describe('PUT /api/items/:id', () => {
    it('updates the name and updated_at but keeps created_at', async () => {
      const item = await createItem('Original');
      await wait(5);

      const response = await request(app).put(`/api/items/${item.id}`).send({ name: ' Changed ' });

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(item.id);
      expect(response.body.name).toBe('Changed');
      expect(response.body.created_at).toBe(item.created_at);
      expect(response.body.updated_at).not.toBe(item.updated_at);
    });

    it('does not change the position of the item in the list', async () => {
      await createItem('A');
      const b = await createItem('B');
      await createItem('C');

      await request(app).put(`/api/items/${b.id}`).send({ name: 'B2' });
      const response = await request(app).get('/api/items');

      expect(response.body.map((i) => i.name)).toEqual(['A', 'B2', 'C']);
    });

    it('returns 400 for an empty name', async () => {
      const item = await createItem('Original');

      const response = await request(app).put(`/api/items/${item.id}`).send({ name: '  ' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Item name is required' });
    });

    it('returns 400 for an invalid id', async () => {
      const response = await request(app).put('/api/items/abc').send({ name: 'x' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Valid item ID is required' });
    });

    it('returns 404 when the item does not exist', async () => {
      const response = await request(app).put('/api/items/999999').send({ name: 'x' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Item not found' });
    });
  });

  describe('DELETE /api/items/:id', () => {
    it('deletes an item without changing the order of the others', async () => {
      await createItem('A');
      const b = await createItem('B');
      await createItem('C');

      const response = await request(app).delete(`/api/items/${b.id}`);
      const list = await request(app).get('/api/items');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Item deleted successfully', id: b.id });
      expect(list.body.map((i) => i.name)).toEqual(['A', 'C']);
    });

    it('returns 404 when deleting the same item twice', async () => {
      const item = await createItem('Once');
      await request(app).delete(`/api/items/${item.id}`);

      const response = await request(app).delete(`/api/items/${item.id}`);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Item not found' });
    });

    it('returns 400 for an invalid id', async () => {
      const response = await request(app).delete('/api/items/abc');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Valid item ID is required' });
    });
  });

  describe('repository failures', () => {
    let errorSpy;
    beforeEach(() => {
      errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterEach(() => errorSpy.mockRestore());

    const failing = () => {
      const boom = () => {
        throw new Error('db down');
      };
      return createApp({
        itemsRepository: { findAll: boom, create: boom, update: boom, remove: boom },
      });
    };

    it.each([
      ['get', '/api/items', 'Failed to fetch items'],
      ['post', '/api/items', 'Failed to create item'],
      ['put', '/api/items/1', 'Failed to update item'],
      ['delete', '/api/items/1', 'Failed to delete item'],
    ])('returns 500 for %s %s', async (method, url, message) => {
      const response = await request(failing())[method](url).send({ name: 'x' });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: message });
    });
  });
});
