import { expect } from 'chai';
import RedisClient from '../src/redisClient';

const app = {
  get: function(key) {
    return this[key];
  },
  set: function(key, val) {
    this[key] = val;
  },
  configure: function(fn) {
    fn.call(this);
  }
};

describe('redisClient', () => {
  it('should not exist if redis not connected', (done) => {
    app.set('redis', { port: 1234 }); // force connection error
    app.configure(RedisClient);
    setTimeout(function () {
      expect(app.get('redisClient')).to.not.exist;
      done();
    }, 500);
  });
  it('should be available if redis connected', (done) => {
    app.set('redis', { port: 6379 }); // restore default
    app.configure(RedisClient);
    setTimeout(function () {
      expect(app.get('redisClient')).to.exist;
      done();
    }, 500);
  });
});