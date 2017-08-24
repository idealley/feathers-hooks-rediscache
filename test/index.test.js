import { expect } from 'chai';
import { cacheRoutes, redisAfterHook, redisBeforeHook } from '../src';

describe('feathers-hooks-rediscache', () => {
  it('loads routes', () => {
    expect(typeof cacheRoutes).to.equal('function', 'It worked');
  });
  it('loads the after Redis Cache hook', () => {
    expect(typeof redisAfterHook).to.equal('function', 'It worked');
  });
  it('loads the before Redis Cache hook', () => {
    expect(typeof redisBeforeHook).to.equal('function', 'It worked');
  });
  it('loads the cache hook', () => {
    expect(typeof redisBeforeHook).to.equal('function', 'It worked');
  });
});
