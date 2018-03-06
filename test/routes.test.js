import { expect } from 'chai';
import { promisify } from 'util';
import redis from 'redis';
import RedisCache from '../src/routes/helpers/redis';

const client = redis.createClient();
const h = new RedisCache(client);
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const rpushAsync = promisify(client.rpush).bind(client);
const lrangeAsync = promisify(client.lrange).bind(client);
const delAsync = promisify(client.del).bind(client);

describe('Cache routes', () => {

});

describe('Cache functions', () => {
  before(async () => {
    await setAsync('cache-test-key', 'value');
    await setAsync('path-1', 'value-1');
    await setAsync('path-2', 'value-2');
    await setAsync('path-3', 'value-3');
    await rpushAsync('group-test-key', ['path-1', 'path-2', 'path-3']);
  });

  // it('scans the index', () => {
  //   return h.scan().then(data => {
  //     expect(data).to.include(
  //         'cache-test-key',
  //         'group-test-key',
  //         'path-1',
  //         'path-2',
  //         'path-3'
  //       );
  //   });
  // });

  // it('Async scan the index', () => {
  //   let myResult = new Set();

  //   return h.scanAsync('0', '*', myResult).then(data => {
  //     expect(data).to.include(
  //         'cache-test-key',
  //         'group-test-key',
  //         'path-1',
  //         'path-2',
  //         'path-3'
  //       );
  //   });
  // });

  it('removes an item from the cache', async () => {
    const reply = await getAsync('cache-test-key');

    expect(reply).to.equal('value');
    return h.clearSingle('cache-test-key').then(data => {
      expect(data).to.equal(true);
    });
  });

  it('returns false when an item does not exist', () => {
    return h.clearSingle('cache-does-not-exist').then(data => {
      expect(data).to.equal(false);
    });
  });

  it('removed an item from the cache', async () => {
    const reply = await getAsync('cache-test-key');

    expect(reply).to.equal(null);
  });

  it('removes all the item from a redis list array', () => {
    return h.clearGroup('group-test-key').then(data => {
      expect(data).to.equal(true);
    });
  });

  it('removes all the item from a redis list array', () => {
    return h.clearGroup('group-does-not-exist').then(data => {
      expect(data).to.equal(false);
    });
  });

  it('really removed keys in a group', () => {
    client.get('path-2', reply => {
      expect(reply).to.be.equal(null);
    });
  });

  it('really emptied the group', async () => {
    const reply = await lrangeAsync('group-test-key', 0, -1);

    expect(reply).to.be.an('array').to.be.empty;
  });

  it('removes the group key from redis', async () => {
    const reply = await delAsync('group-test-key');

    expect(reply).to.equal(0);
  });
});

