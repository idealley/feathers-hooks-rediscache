import { expect } from 'chai';
import { redisClient, cacheRoutes, redisAfterHook, redisBeforeHook, hookRemoveCacheInformation } from '../src';

describe('feathers-hooks-rediscache', () => {
  it('loads Redis Client', () => {
    expect(typeof redisClient).to.equal('function', 'It worked');
  });
  it('loads routes', () => {
    expect(typeof cacheRoutes).to.equal('function', 'It worked');
  });
  it('loads the after Redis Cache hook', () => {
    expect(typeof redisAfterHook).to.equal('function', 'It worked');
  });
  it('loads the before Redis Cache hook', () => {
    expect(typeof redisBeforeHook).to.equal('function', 'It worked');
  });
  it('loads the remove Redis Cache Object hook', () => {
    expect(typeof hookRemoveCacheInformation).to.equal('function', 'It worked');
  });
  it('loads the cache hook', () => {
    expect(typeof redisBeforeHook).to.equal('function', 'It worked');
  });
});
