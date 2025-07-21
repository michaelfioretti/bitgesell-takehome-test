const { setValue, getValue, delValue, client } = require('./redis');

describe('Redis Utils', () => {
  const testKey = 'test:key';
  const testValue = 'testValue';

  beforeAll(async () => {
    if (!client.isOpen) {
      await client.connect();
    }
  });

  afterAll(async () => {
    await client.quit();
  });

  afterEach(async () => {
    await delValue(testKey);
  });

  test('setValue and getValue should store and retrieve a value', async () => {
    await setValue(testKey, testValue, 60);
    const value = await getValue(testKey);
    expect(value).toBe(testValue);
  });

  test('getValue should return null for non-existent key', async () => {
    const value = await getValue('nonexistent:key');
    expect(value).toBeNull();
  });

  test('delValue should delete a key', async () => {
    await setValue(testKey, testValue, 60);
    const delCount = await delValue(testKey);
    expect(delCount).toBe(1);
    const value = await getValue(testKey);
    expect(value).toBeNull();
  });

  test('setValue should set value without expiration if expireSeconds is 0', async () => {
    await setValue(testKey, testValue, 0);
    const value = await getValue(testKey);
    expect(value).toBe(testValue);
  });

  test('setValue should set value with default expiration', async () => {
    await setValue(testKey, testValue);
    const value = await getValue(testKey);
    expect(value).toBe(testValue);
  });
});
