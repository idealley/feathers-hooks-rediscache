import { expect } from 'chai';
import { redisClient } from '../../src';

describe('Redis Before Hook', () => {

  it('It loads and responds', () => {
    expect(typeof redisClient).to.equal('function');
  });

  it('Loads the client with custom settings', () => {
    const c = redisClient.bind({
      set: function (key, value) {
        this[key] = value;
      },
      get: function (key) {
        return {
          host: 'my-redis-service.example.com',
          port: 1234
        };
      }
    });
    const result = c();

    expect(result.redisClient.address).to.equal('my-redis-service.example.com:1234');
  });

  it('Loads the client with defaults', () => {
    const c = redisClient.bind({
      set: function (key, value) {
        this[key] = value;
      },
      get: function (key) {
        return null;
      }
    });
    const result = c();

    expect(result.redisClient.address).to.equal('127.0.0.1:6379');
  });
});
