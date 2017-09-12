import { expect } from 'chai';
import redis from 'redis';
import { redisAfterHook as a } from '../src';
// import moment from 'moment';

const client = redis.createClient();

describe('Redis After Hook', () => {
  it('caches a parent route', () => {
    const hook = a();
    const mock = {
      params: { query: ''},
      path: 'test-route',
      result: {
        _sys: {
          status: 200
        },
        cache: {
          cached: false,
          duration: 8400
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

      expect(data.cache.cached).to.equal(true);
      expect(data.cache.duration).to.equal(8400);
      expect(data.cache.parent).to.equal('test-route');
      expect(data.cache.group).to.equal('group-test-route');
      expect(data.cache.key).to.equal('test-route');
    });
  });

  it('caches a parent with params', () => {
    const hook = a();
    const mock = {
      params: { query: {full: true}},
      id: '',
      path: 'parent',
      result: {
        _sys: {
          status: 200
        },
        cache: {
          cached: false,
          duration: 8400
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

      expect(data.cache.cached).to.equal(true);
      expect(data.cache.duration).to.equal(8400);
      expect(data.cache.parent).to.equal('parent');
      expect(data.cache.group).to.equal('group-parent');
      expect(data.cache.key).to.equal('parent?full=true');
    });
  });

  it('caches a route with a parent', () => {
    const hook = a();
    const mock = {
      params: { query: ''},
      id: 'test-route',
      path: 'parent',
      result: {
        _sys: {
          status: 200
        },
        cache: {
          cached: false,
          duration: 8400
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

      expect(data.cache.cached).to.equal(true);
      expect(data.cache.duration).to.equal(8400);
      expect(data.cache.parent).to.equal('parent');
      expect(data.cache.group).to.equal('group-parent');
      expect(data.cache.key).to.equal('test-route');
    });
  });

  it('caches a route with a parent', () => {
    const hook = a();
    const mock = {
      params: { query: {full: true}},
      id: 'test-route',
      path: 'parent',
      result: {
        _sys: {
          status: 200
        },
        cache: {
          cached: false,
          duration: 8400
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

      expect(data.cache.cached).to.equal(true);
      expect(data.cache.duration).to.equal(8400);
      expect(data.cache.parent).to.equal('parent');
      expect(data.cache.group).to.equal('group-parent');
      expect(data.cache.key).to.equal('test-route?full=true');
    });
  });

  it('adds default cache duration', () => {
    const hook = a();
    const mock = {
      params: { query: {full: true}},
      id: 'test-route',
      path: 'parent',
      result: {
        _sys: {
          status: 200
        },
        cache: {
          cached: false
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

      expect(data.cache.cached).to.equal(true);
      expect(data.cache.duration).to.equal(3600 * 24);
    });
  });

  after(() => {
    client.del('parent');
    client.del('parent?full=true');
    client.del('test-route');
    client.del('test-route?full=true');
    client.del('group-test-route');
    client.del('group-parent');
  });

});
