import { expect } from 'chai';
import redis from 'redis';
import { redisAfterHook as a } from '../src';
// import moment from 'moment';

const client = redis.createClient();

describe('Redis After Hook', () => {
  it('caches a route', () => {
    const hook = a();
    const mock = {
      params: { query: ''},
      id: 'test-route',
      path: '',
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
      expect(data.cache.parent).to.equal('');
      expect(data.cache.group).to.equal('');
      expect(data.cache.key).to.equal('test-route');
    });
  });
  it('caches a route', () => {
    const hook = a();
    const mock = {
      params: { query: ''},
      id: 'test-route',
      path: '',
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
      expect(data.cache.parent).to.equal('');
      expect(data.cache.group).to.equal('');
      expect(data.cache.key).to.equal('test-route');
    });
  });

  it('caches a parent route that returns an array', () => {
    const hook = a();
    const mock = {
      params: { query: ''},
      path: 'test-route',
      result: {
        wrapped: [
          {title: 'title 1'},
          {title: 'title 2'}
        ],
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
  it('caches a parent route with setting to remove path from key...', () => {
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
          if (what === 'redisClient') return client;
          if (what === 'redisCache') {
            const cache = {
              defaultDuration: 3600,
              removePathFromCacheKey: true
            };

            return cache;
          }
          return undefined;
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

  it('caches a parent route with setting to remove path from key...', () => {
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
          if (what === 'redisClient') return client;
          if (what === 'redisCache') {
            const cache = {
              defaultDuration: 3600,
              removePathFromCacheKey: true
            };

            return cache;
          }
          return undefined;
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

  it('caches a nested route with setting to parse it...', () => {
    const hook = a();
    const mock = {
      params: {
        route: {
          abcId: 123
        },
        query: ''
      },
      path: 'test-route/:abcId',
      id: 'nested-route',
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
          if (what === 'redisClient') return client;
          if (what === 'redisCache') {
            const cache = {
              defaultDuration: 3600,
              parseNestedRoutes: true
            };

            return cache;
          }
          return undefined;
        }
      }
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data.cache.cached).to.equal(true);
      expect(data.cache.duration).to.equal(8400);
      expect(data.cache.parent).to.equal('test-route/:abcId');
      expect(data.cache.group).to.equal('group-test-route/:abcId');
      expect(data.cache.key).to.equal('test-route/123/nested-route');
    });
  });

  it('caches a nested route with optional params set', () => {
    const hook = a();
    const mock = {
      params: {
        route: {
          abcId: 123
        },
        query: ''
      },
      path: 'test-route/:abcId?',
      id: 'nested-route',
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
          if (what === 'redisClient') return client;
          if (what === 'redisCache') {
            const cache = {
              defaultDuration: 3600,
              parseNestedRoutes: true
            };

            return cache;
          }
          return undefined;
        }
      }
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data.cache.cached).to.equal(true);
      expect(data.cache.duration).to.equal(8400);
      expect(data.cache.parent).to.equal('test-route/:abcId?');
      expect(data.cache.group).to.equal('group-test-route/:abcId?');
      expect(data.cache.key).to.equal('test-route/123/nested-route');
    });
  });

  it('caches a route with optional params set,', () => {
    const hook = a();
    const mock = {
      params: {
        route: {
          abcId: 123
        },
        query: ''
      },
      path: 'test-route/:abcId?',
      id: '',
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
          if (what === 'redisClient') return client;
          if (what === 'redisCache') {
            const cache = {
              defaultDuration: 3600,
              parseNestedRoutes: true
            };

            return cache;
          }
          return undefined;
        }
      }
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data.cache.cached).to.equal(true);
      expect(data.cache.duration).to.equal(8400);
      expect(data.cache.parent).to.equal('test-route/:abcId?');
      expect(data.cache.group).to.equal('group-test-route/:abcId?');
      expect(data.cache.key).to.equal('test-route/123');
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
      expect(data.cache.key).to.equal('parent/test-route');
    });
  });

  it('caches a route without a parent in the cache key', () => {
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
          if (what === 'redisClient') return client;
          if (what === 'redisCache') {
            const cache = {
              defaultDuration: 3600,
              removePathFromCacheKey: true
            };

            return cache;
          }
          return undefined;
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

  it('caches a route with a parent and params', () => {
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
      expect(data.cache.key).to.equal('parent/test-route?full=true');
    });
  });

  it('caches a route with a parent and a nested param', () => {
    const hook = a();
    const mock = {
      params: { query: { id: { '$nin': '1' }}},
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
      expect(data.cache.key).to.equal('parent/test-route?id[$nin]=1');
    });
  });

  it('caches a route with a parent and nested params', () => {
    const hook = a();
    const mock = {
      params: { query: { id: { '$nin': '1', test: '2' }}},
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
      expect(data.cache.key).to.equal('parent/test-route?id[$nin]=1&id[test]=2');
    });
  });

  it('caches a route without a parent in the cache key but with params', () => {
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
          if (what === 'redisClient') return client;
          if (what === 'redisCache') {
            const cache = {
              defaultDuration: 3600,
              removePathFromCacheKey: true
            };

            return cache;
          }
          return undefined;
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
    // client.del('parent');
    // client.del('parent?full=true');
    // client.del('test-route');
    // client.del('test-route?full=true');
    // client.del('group-test-route');
    // client.del('group-parent');
  });

});
