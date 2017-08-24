/**
 * After hook - generates a cache object that is needed
 * for the redis hook and the express middelware.
 * @todo add default value in config file
 */

export default function (options = {}) { // eslint-disable-line no-unused-vars
  return function cache(hook) {
    if(!hook.result.hasOwnProperty('cache')){
      hook.result.cache = {
        cached: false,
        duration: options.duration || 3600 * 24 
      };
    }
    return Promise.resolve(hook);
  };
};