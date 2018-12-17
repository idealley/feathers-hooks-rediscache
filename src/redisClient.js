import redis from 'redis';
import chalk from 'chalk';

export default function redisClient() { // eslint-disable-line no-unused-vars
  const app = this;
  const cacheOptions = app.get('redisCache') || {};
  const retryInterval = cacheOptions.retryInterval || 10000;
  const redisOptions = Object.assign({}, this.get('redis'), {
    retry_strategy: function (options) { // eslint-disable-line camelcase
      app.set('redisClient', undefined);
      if (cacheOptions.env !== 'test') {
        console.log(`${chalk.yellow('[redis]')} not connected`);
      }
      return retryInterval;
    }
  });
  const client = redis.createClient(redisOptions);

  app.set('redisClient', client);

  client.on('ready', () => {
    app.set('redisClient', client);
    if (cacheOptions.env !== 'test') {
      console.log(`${chalk.green('[redis]')} connected`);
    }
  });
  return this;
}
