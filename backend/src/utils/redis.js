const redis = require('redis');
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const client = redis.createClient({
  url: REDIS_URL,
});

client.connect().then(() => {
  console.log('Connected to Redis');
})

client.on('error', (err) => {
  console.error('Redis Client Error', err);
});

async function setValue(key, value, expireSeconds = 3600) {
  if (expireSeconds) {
    await client.set(key, value, { EX: expireSeconds });
  } else {
    await client.set(key, value);
  }
}

async function getValue(key) {
  return await client.get(key);
}

async function delValue(key) {
  return await client.del(key);
}

module.exports = {
  setValue,
  getValue,
  delValue,
  client,
};
