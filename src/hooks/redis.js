import moment from 'moment';
import chalk from 'chalk';
import { parsePath } from './helpers/path';

const defaults = {};

export function before(options) { // eslint-disable-line no-unused-vars
  options = Object.assign({}, defaults, options);

  return function (hook) {
    return new Promise(resolve => {
      const client = hook.app.get('redisClient');
      const cacheOptions = hook.app.get('redisCache');
      const path = parsePath(hook, cacheOptions);

      client.get(path, (err, reply) => {
        if (err !== null) resolve(hook);
        if (reply) {
          let data = JSON.parse(reply);
          const duration = moment(data.cache.expiresOn).format('DD MMMM YYYY - HH:mm:ss');

          if (data.cache.hasOwnProperty('wrapped')) {
            const { wrapped } = data.cache;

            data = wrapped;
          }
          hook.result = data;
          resolve(hook);

          /* istanbul ignore next */
          if (process.env.NODE_ENV !== 'test') {
            console.log(`${chalk.cyan('[redis]')} returning cached value for ${chalk.green(path)}.`);
            console.log(`> Expires on ${duration}.`);
          }
        } else {
          resolve(hook);
        }
      });
    });
  };
};

export function after(options) { // eslint-disable-line no-unused-vars
  options = Object.assign({}, defaults, options);

  return function (hook) {
    return new Promise(resolve => {
      if (!hook.result.cache.cached) {
        const cacheOptions = hook.app.get('redisCache');
        const cachingDefault = cacheOptions.defaultDuration ? cacheOptions.defaultDuration : 3600 * 24;
        const duration = hook.result.cache.duration || cachingDefault;
        const client = hook.app.get('redisClient');
        const path = parsePath(hook, cacheOptions);

        // adding a cache object
        Object.assign(hook.result.cache, {
          cached: true,
          duration: duration,
          expiresOn: moment().add(moment.duration(duration, 'seconds')),
          parent: hook.path,
          group: hook.path ? `group-${hook.path}` : '',
          key: path
        });

        client.set(path, JSON.stringify(hook.result));
        client.expire(path, hook.result.cache.duration);
        if (hook.path) {
          client.rpush(hook.result.cache.group, path);
        }

        /* istanbul ignore next */
        if (process.env.NODE_ENV !== 'test') {
          console.log(`${chalk.cyan('[redis]')} added ${chalk.green(path)} to the cache.`);
          console.log(`> Expires in ${moment.duration(duration, 'seconds').humanize()}.`);
        }
      }
      resolve(hook);
    });
  };
};

