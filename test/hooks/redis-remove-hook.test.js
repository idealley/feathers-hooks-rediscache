import { expect } from 'chai';
import redis from 'redis';
import moment from 'moment';
import { hookRemoveCacheInformation as r } from '../../src';

const client = redis.createClient();

describe('Redis Remove Cache Object Hook', () => {

  it('removes the cache object', () => {
    const hook = r();
    const mock = {
      params: { query: ''},
      path: '',
      id: 'remove-cache-test-route',
      result: {
        cache: {
          cached: true,
          duration: 3600 * 24 * 7,
          expiresOn: moment().add(moment.duration(3600 * 24 * 7, 'seconds'))
        }
      },
      app: {
        get: (what) => {
          return client;
        }
      }
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data).not.to.have.property('cache');
    });
  });

  it('does not remove anything else thant the cache object', () => {
    const hook = r();
    const mock = {
      params: { query: ''},
      path: '',
      id: 'remove-cache-test-route',
      result: {
        property: 'test'
      },
      app: {
        get: (what) => {
          return client;
        }
      }
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data).to.deep.equal({property: 'test'});
    });
  });
});
