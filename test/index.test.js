import { expect } from 'chai';
import * as lib from '../src';

describe('feathers-hooks-rediscache', () => {
  it('loads Redis Client', () => {
    expect(lib).to.respondTo('redisClient');
  });

  it('loads routes', () => {
    expect(lib).to.respondTo('cacheRoutes');
  });

  it('loads the after Redis Cache hook', () => {
    expect(lib).to.respondTo('redisAfterHook');
  });

  it('loads the before Redis Cache hook', () => {
    expect(lib).to.respondTo('redisBeforeHook');
  });

  it('loads the remove Redis Cache Object hook', () => {
    expect(lib).to.respondTo('hookRemoveCacheInformation');
  });

  it('loads the cache hook', () => {
    expect(lib).to.respondTo('hookCache');
  });
});
