const request = require('supertest');
const { createApp } = require('../src/app');
const { createDb } = require('../src/db');
const { createItemsRepository } = require('../src/repositories/itemsRepository');

describe('createApp', () => {
  let db;
  let app;

  beforeEach(() => {
    db = createDb();
    app = createApp({ itemsRepository: createItemsRepository(db) });
  });

  afterEach(() => {
    db.close();
  });

  it('responds to the health check', async () => {
    const response = await request(app).get('/');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok', message: 'Backend server is running' });
  });
});
