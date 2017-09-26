/**
 * After hook - generates a cache object that is needed
 * for the redis hook and the express middelware.
 * @todo add default value in config file
 */
const defaults = {};

export function cache(options) { // eslint-disable-line no-unused-vars
  options = Object.assign({}, defaults, options);

  return function (hook) {
    if (!hook.result.hasOwnProperty('cache')) {
      if (Array.isArray(hook.result)) {
        const array = hook.result;

        hook.result = {};
        hook.result.wrapped = array;
      }
      hook.result.cache = {
        cached: false,
        duration: options.duration || 3600 * 24
      };
    }
    return Promise.resolve(hook);
  };
};

export function removeCacheInformation(options) { // eslint-disable-line no-unused-vars
  options = Object.assign({}, defaults, options);

  return function (hook) {
    if (hook.result.hasOwnProperty('cache')) {
      delete hook.result.cache;
    }
    return Promise.resolve(hook);
  };
};
