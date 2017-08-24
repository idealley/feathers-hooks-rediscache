const { expect } = require('chai');
const c = require('../../lib').hookCache;

describe('Cache Hook', () => {
  it('adds a cache object', () => {
    const hook = c();
    const mock = {
      params : { query: ''},
      path: 'test-route',
      result: {
        _sys: {
          status: 200
        },
        cache: {
          cached: true,
          duration: 8400
        }
      }
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data.cache.cached).to.equal(true);
      expect(data.cache.duration).to.equal(8400);
    });
  });

  it('does not modify the existing cache object', () => {
    const hook = c();
    const mock = {
      params : { query: ''},
      path: 'test-route',
      result: {
        _sys: {
          status: 200
        }
      }
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data.cache.cached).to.equal(false);
      expect(data.cache.duration).to.equal(86400);
      expect(data.cache).to.not.have.property('parent');
      expect(data.cache).to.not.have.property('group');
      expect(data.cache).to.not.have.property('expires_on');
    });
  });
});