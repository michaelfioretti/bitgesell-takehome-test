const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');
const itemsRouter = require('./items');

jest.mock('fs');

const DATA_PATH = path.join(__dirname, '../../../data/items.json');

const mockItems = [
  { id: 1, name: 'Apple', price: 1.5 },
  { id: 2, name: 'Banana', price: 2.0 },
  { id: 3, name: 'Orange', price: 2.5 },
];

function setupApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/items', itemsRouter);

  app.use((err, req, res, next) => {
    res.status(err.status || 500).json({ error: err.message });
  });
  return app;
}

beforeEach(() => {
  fs.promises = {
    readFile: jest.fn(),
    writeFile: jest.fn(),
  }

  fs.promises.readFile.mockResolvedValue(JSON.stringify(mockItems));
  fs.writeFileSync.mockClear();
});

describe('Items API', () => {
  const app = setupApp();
  const expectedResponse = {
    data: mockItems,
    totalCount: mockItems.length,
  }

  describe('GET /api/items', () => {
    it('returns all items', async () => {
      const res = await request(app).get('/api/items');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(expectedResponse);
    });

    it('filters items by query', async () => {
      const res = await request(app).get('/api/items?q=app');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({data: [mockItems[0]], totalCount: 3});
    });

    it('limits the number of items', async () => {
      const res = await request(app).get('/api/items?limit=2');
      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(2);
    });

    it('returns empty array if no items match query', async () => {
      const res = await request(app).get('/api/items?q=zzz');
      expect(res.status).toBe(200);
      expect(res.body.data).toEqual([]);
    });
  });

  describe('GET /api/items/:id', () => {
    it('returns the item with the given id', async () => {
      const res = await request(app).get('/api/items/2');
      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockItems[1]);
    });

    it('returns 404 if item not found', async () => {
      const res = await request(app).get('/api/items/999');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Item not found');
    });

    it('returns 500 for invalid id', async () => {
      // Simulate readData throwing
      fs.promises.readFile.mockRejectedValueOnce(new Error('fail'));
      const res = await request(app).get('/api/items/1');
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('fail');
    });
  });

  describe('POST /api/items', () => {
    it('creates a new item and returns it', async () => {
      const newItem = { name: 'Grape', category: 'Food', price: 3.0 };
      const res = await request(app).post('/api/items').send(newItem);
      expect(res.status).toBe(201);
      expect(res.body).toMatchObject(newItem);
      expect(res.body).toHaveProperty('id');
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        DATA_PATH,
        expect.stringContaining('"name": "Grape"')
      );
    });

    it('returns 400 for invalid item data', async () => {
      const res = await request(app).post('/api/items').send({ name: '', price: 1 });
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('category is a required field');
    });

    it('returns 500 if write fails', async () => {
      fs.writeFileSync.mockImplementationOnce(() => { throw new Error('write error'); });
      const res = await request(app).post('/api/items').send({ name: 'Kiwi', category: 'Food', price: 4.0 });
      expect(res.status).toBe(500);
      expect(res.body.error).toBe('write error');
    });
  });
});
