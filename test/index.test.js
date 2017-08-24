const { expect } = require('chai');
const plugin = require('../lib');

describe('feathers-hooks-rediscache', () => {
  it('loads routes', () => {
    expect(typeof plugin.cacheRoutes).to.equal('function', 'It worked');
  });
  it('loads the after Redis Cache hook', () => {
    expect(typeof plugin.redisAfterHook).to.equal('function', 'It worked');
  });
  it('loads the before Redis Cache hook', () => {
    expect(typeof plugin.redisBeforeHook).to.equal('function', 'It worked');
  });
  it('loads the cache hook', () => {
    expect(typeof plugin.redisBeforeHook).to.equal('function', 'It worked');
  });
});
