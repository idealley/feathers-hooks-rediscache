import redis from 'redis';

export default function redisClient() { // eslint-disable-line no-unused-vars
  this.set('redisClient', redis.createClient(this.get('redis')));
}
