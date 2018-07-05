/**
 * After hook - generates a cache object that is needed
 * for the redis hook and the express middelware.
 */
const defaults = {
  defaultDuration: 3600 * 24
};

export function cache(options) { // eslint-disable-line no-unused-vars
  return function (hook) {
    const cacheOptions = hook.app.get('redisCache');

    options = Object.assign({}, defaults, cacheOptions, options);

    if (!hook.result.hasOwnProperty('cache')) {
      let cache = {};

      if (Array.isArray(hook.result)) {
        const array = hook.result;

        cache.wrapped = array;
        hook.result = {};
      }

      cache = Object.assign({}, cache, {
        cached: false,
        duration: options.duration || options.defaultDuration
      });

      hook.result.cache = cache;
    }
    return Promise.resolve(hook);
  };
};

export function removeCacheInformation(options) { // eslint-disable-line no-unused-vars
  return function (hook) {
    if (hook.result.hasOwnProperty('cache')) {
      delete hook.result.cache;
    }
    return Promise.resolve(hook);
  };
};
