import { expect } from 'chai';
import redis from 'redis';
import moment from 'moment';
import { redisBeforeHook as b, redisAfterHook as a } from '../../src';

const client = redis.createClient();

describe('Redis Before Hook', () => {
  before(() => {
    client.set('before-test-route', JSON.stringify(
      {
        _sys: {
          status: 200
        },
        cache: {
          cached: true,
          duration: 3600 * 24 * 7,
          expiresOn: moment().add(moment.duration(3600 * 24 * 7, 'seconds'))
        }
      }
    ));

    client.set('before-test-route?full=true', JSON.stringify(
      {
        _sys: {
          status: 200
        },
        cache: {
          cached: true,
          duration: 3600 * 24 * 7,
          expiresOn: moment().add(moment.duration(3600 * 24 * 7, 'seconds'))
        }
      }
    ));

    client.set('before-parent-route', JSON.stringify(
      {
        _sys: {
          status: 200
        },
        cache: {
          cached: true,
          duration: 3600 * 24 * 7,
          expiresOn: moment().add(moment.duration(3600 * 24 * 7, 'seconds'))
        }
      }
    ));

    client.set('before-parent-route?full=true', JSON.stringify(
      {
        _sys: {
          status: 200
        },
        cache: {
          cached: true,
          duration: 3600 * 24 * 7,
          expiresOn: moment().add(moment.duration(3600 * 24 * 7, 'seconds'))
        }
      }
    ));

    client.set('before-wrapped', JSON.stringify(
      {
        cache: {
          wrapped: [
            {title: 'title 1'},
            {title: 'title 2'}
          ],
          cached: true,
          duration: 3600 * 24 * 7,
          expiresOn: moment().add(moment.duration(3600 * 24 * 7, 'seconds'))
        }
      }
    ));
  });

  it('sets cacheKey in before hook if immediateCacheKey true', () => {
    const hook = b({ immediateCacheKey: true });
    const mock = {
      params: { query: { foo: 'bar' }},
      path: '',
      id: 'before-cache-key',
      app: {
        get: (what) => {
          return client;
        }
      }
    };

    return hook(mock).then(result => {
      expect(result.params.cacheKey).to.be.equal('before-cache-key?foo=bar');
    });
  });

  it('retrives a cached object', () => {
    const hook = b();
    const mock = {
      params: { query: ''},
      path: '',
      id: 'before-test-route',
      app: {
        get: (what) => {
          return client;
        }
      }
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data.cache.cached).to.equal(true);
    });
  });

  it('retrives a cached object with params', () => {
    const hook = b();
    const mock = {
      params: { query: { full: true }},
      path: '',
      id: 'before-test-route',
      app: {
        get: (what) => {
          return client;
        }
      }
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data.cache.cached).to.equal(true);
    });
  });

  it('retrives a wrapped array', () => {
    const hook = b();
    const after = a();
    const mock = {
      params: { query: ''},
      path: '',
      id: 'before-wrapped',
      app: {
        get: (what) => {
          return client;
        }
      }
    };

    return hook(mock).then(result => {
      after(result).then(result => {
        const data = result.result;

        expect(data).to.be.an('array').that.deep.equals([
          {title: 'title 1'},
          {title: 'title 2'}
        ]);
        expect(data.cache).to.equal(undefined);
      });
    });
  });

  it('retrives a cached parent object', () => {
    const hook = b();
    const mock = {
      params: { query: ''},
      path: 'before-parent-route',
      id: '',
      app: {
        get: (what) => {
          return client;
        }
      }
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data.cache.cached).to.equal(true);
    });
  });

  it('retrives a cached parent object with params', () => {
    const hook = b();
    const mock = {
      params: { query: { full: true }},
      path: 'before-parent-route',
      id: '',
      app: {
        get: (what) => {
          return client;
        }
      }
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data.cache.cached).to.equal(true);
    });
  });

  it('does not do anything', () => {
    const hook = b();
    const mock = {
      params: { query: { full: true }},
      path: 'does-nothing',
      id: '',
      app: {
        get: (what) => {
          return client;
        }
      }
    };

    return hook(mock).then(result => {
      const data = result;

      expect(data.path).to.equal('does-nothing');
      expect(data).to.not.have.a.property('result');
    });
  });

  it('changes the environement', () => {
    const hook = b();
    const mock = {
      params: { query: { full: true }},
      path: 'does-nothing',
      id: '',
      app: {
        get: (what) => {
          return what === 'redisCache'
            ? {env: 'test'}
            : client;
        }
      }
    };

    return hook(mock).then(result => {
      expect(result.app.get('redisCache').env).to.equal('test');
    });
  });

  it('does not return any result if redisClient offline', () => {
    const hook = b();
    const mock = {
      params: { query: ''},
      path: '',
      id: '',
      app: {
        get: (what) => {}
      }
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data).to.be.undefined;
    });
  });

  after(() => {
    client.del('before-test-route');
    client.del('before-test-route?full=true');
    client.del('before-parent-route');
    client.del('before-wrapped');
    client.del('before-parent-route?full=true');
    client.del('env-test');
  });
});
