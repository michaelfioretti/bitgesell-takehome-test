const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');
const RedisHelper = require('../utils/redis');

// GET /api/stats
router.get('/', async (_, res, next) => {
  // Check Redis cache first before calculating stats
  const cachedData = await RedisHelper.getValue('stats');
  if (cachedData) {
    console.log('Returning cached stats');
    return res.json(JSON.parse(cachedData));
  }

  fs.readFile(DATA_PATH, async (err, raw) => {
    if (err) return next(err);

    const items = JSON.parse(raw);
    const stats = {
      total: items.length,
      averagePrice: items.reduce((acc, cur) => acc + cur.price, 0) / items.length
    };

    await RedisHelper.setValue('stats', JSON.stringify(stats));

    res.json(stats);
  });
});

module.exports = router;
