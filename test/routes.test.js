import { expect } from 'chai';
import redis from 'redis';
import RedisCache from '../src/routes/helpers/redis';

const client = redis.createClient();
const h = new RedisCache(client);

describe('Cache routes', () => {

});

describe('Cache functions', () => {
  before(() => {
    client.set('cache-test-key', 'value');
    client.set('path-1', 'value-1');
    client.set('path-2', 'value-2');
    client.set('path-3', 'value-3');
    client.rpush('group-test-key', ['path-1','path-2','path-3']);
  });

  it('scans the index', () => {
    return h.scan().then(data => {
      expect(data).to.deep.equal(
        [ 'group-test-key',
          'path-2',
          'path-1',
          'path-3',
          'cache-test-key' ]
        );
    });
  });

  it('removes an item from the cache', () => {
    client.get('cache-test-key', (err, reply) => {
      expect(reply).to.equal('value');
    }); 
    return h.clearSingle('cache-test-key').then(data => {
      expect(data).to.equal(true);
    });
    done();
  });

  it('returns false when an item does not exist', () => {
    return h.clearSingle('cache-does-not-exist').then(data => {
      expect(data).to.equal(false);
    });
    done();
  });

  it('removed an item from the cache', () => {
    client.get('cache-test-key', (err, reply) => {
      expect(reply).to.equal('tedfst');
    });
  });

  it('removes all the item from a redis list array', () => {      
    return h.clearGroup('group-test-key').then(data => {
      expect(data).to.equal(true);
    });
    done(); 
  });

  it('removes all the item from a redis list array', () => {      
    return h.clearGroup('group-does-not-exist').then(data => {
      expect(data).to.equal(false);
    });
    done(); 
  });

  it('really removed keys in a group', () => {
    client.get('path-2', (err, reply) => {
      expect(reply).to.be.equal(null)
    });
  });

  it('really emptied the group', () => {
    client.lrange('group-test-key', 0, -1, (err, reply) => {
      expect(reply).to.be.an('array').that.is.empty;
    });
  });

  it('removes the group key from redis', () => {
    client.del('group-test-key', (err, reply) => {
      expect(reply).to.equal(false);
    });
  });
});
