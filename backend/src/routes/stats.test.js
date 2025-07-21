const express = require('express');
const request = require('supertest');
const fs = require('fs');
const path = require('path');
const RedisHelper = require('../utils/redis');
const statsRouter = require('./stats');

jest.mock('fs');
jest.mock('../utils/redis');

const DATA_PATH = path.join(__dirname, '../../../data/items.json');

describe('GET /api/stats', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use('/api/stats', statsRouter);
    jest.clearAllMocks();
  });

  it('returns cached stats if present in Redis', async () => {
    const cachedStats = { total: 2, averagePrice: 15 };
    RedisHelper.getValue.mockResolvedValue(JSON.stringify(cachedStats));
    fs.readFile.mockImplementation((_, cb) => cb(null, JSON.stringify([]))); // Should not be called

    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual(cachedStats);
    expect(RedisHelper.getValue).toHaveBeenCalledWith('stats');
    expect(fs.readFile).not.toHaveBeenCalled();
  });

  it('reads file, calculates stats, caches and returns them if cache is empty', async () => {
    RedisHelper.getValue.mockResolvedValue(null);
    const items = [{ price: 10 }, { price: 20 }];
    fs.readFile.mockImplementation((_, cb) => cb(null, JSON.stringify(items)));
    RedisHelper.setValue.mockResolvedValue();

    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ total: 2, averagePrice: 15 });
    expect(RedisHelper.getValue).toHaveBeenCalledWith('stats');
    expect(fs.readFile).toHaveBeenCalledWith(DATA_PATH, expect.any(Function));
    expect(RedisHelper.setValue).toHaveBeenCalledWith('stats', JSON.stringify({ total: 2, averagePrice: 15 }));
  });

  it('calls next with error if fs.readFile fails', async () => {
    RedisHelper.getValue.mockResolvedValue(null);
    const error = new Error('File error');
    fs.readFile.mockImplementation((_, cb) => cb(error));

    // Custom error handler to capture next(err)
    let caughtError;
    app = express();
    app.use('/api/stats', statsRouter);
    app.use((err, req, res, next) => {
      caughtError = err;
      res.status(500).json({ error: err.message });
    });

    const res = await request(app).get('/api/stats');
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'File error' });
    expect(caughtError).toBe(error);
  });
});
