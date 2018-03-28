import { expect } from 'chai';
import { promisify } from 'util';
import request from 'request-promise';

// Mocking app modules
import feathers from 'feathers';
import rest from 'feathers-rest';
import hooks from 'feathers-hooks';
import bodyParser from 'body-parser';
import errorHandler from 'feathers-errors/handler';

import redis from 'redis';
import RedisCache from '../src/routes/helpers/redis';
import routes from '../src/routes/cache';
// To be used with the mocked app
import redisClient from '../src/redisClient';

const client = redis.createClient();
const h = new RedisCache(client);
const getAsync = promisify(client.get).bind(client);
const setAsync = promisify(client.set).bind(client);
const rpushAsync = promisify(client.rpush).bind(client);
const lrangeAsync = promisify(client.lrange).bind(client);
const delAsync = promisify(client.del).bind(client);

const PORT = 3030;
const serverUrl = `http://0.0.0.0:${PORT}`;

describe('Cache clearing http routes', () => {
  before(async () => {
    await setAsync('cache-test-key', 'value');
    await setAsync('path-1', 'value-1');
    await setAsync('path-2', 'value-2');
    await setAsync('path-3', 'value-3');
    await rpushAsync('group-test-key', ['path-1', 'path-2', 'path-3']);

    // Create an express server asynchronously before tests
    const serverPromise = new Promise(resolve => {
      const app = feathers();

      app.configure(rest());
      app.configure(hooks());
      // configure the redis client
      app.configure(redisClient);
      // Needed for parsing bodies (login)
      app.use(bodyParser.json());
      app.use(bodyParser.urlencoded({ extended: true }))
      // add the cache routes (endpoints) to the app
      app.use('/cache', routes(app));
      app.use(errorHandler());

      app.listen(PORT, () => {
        resolve();
      });
    });

    await serverPromise;
  });

  it('gets an item from the cache', async () => {
    const reply = await getAsync('cache-test-key');

    expect(reply).to.equal('value');
  });

  it('sends requests to the server', async () => {
    const uri = serverUrl;

    try {
      // Getting root gives 404 as it is not handled
      await request(uri);
    } catch (err) {
      expect(!!err).to.equal(true);
      expect(err.statusCode).to.equal(404);
    }
  });

  it('returns OK when it removes an item from the cache', async () => {
    const options = {
      uri: serverUrl + '/cache/clear/single/cache-test-key',
      json: true
    };

    try {
      const response = await request(options);

      expect(!!response).to.equal(true);
      expect(response.status).to.equal(200);
      expect(response.message).to.equal('cache cleared for key ' +
        '(without params): cache-test-key');
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  });

  it('returns No Content when the trying to delete the same item again',
    async () => {
      const options = {
        uri: serverUrl + '/cache/clear/single/cache-test-key',
        json: true
      };

      try {
        const response = await request(options);

        console.log('Response', response);

        expect(!!response).to.equal(true);
        expect(response.status).to.equal(204);
        expect(response.message).to.equal('cache already cleared for key ' +
          '(without params): cache-test-key');
      } catch (err) {
        throw new Error(err);
      }
    });

  it('returns No Content when an item does not exist', async () => {
    const options = {
      uri: serverUrl + '/cache/clear/single/cache-does-not-exist',
      json: true
    };

    try {
      const response = await request(options);

      expect(!!response).to.equal(true);
      // Should no raise errors but status No content
      expect(response.status).to.equal(204);
      expect(response.message).to.equal('cache already cleared for key ' +
        '(without params): cache-does-not-exist');
    } catch (err) {
      throw new Error(err);
    }
  });

  it('removes all the item from a redis list array', async () => {
    const options = {
      uri: serverUrl + '/cache/clear/group/test-key',
      json: true
    };

    try {
      const response = await request(options);

      expect(!!response).to.equal(true);
      // Should no raise errors but status No content
      expect(response.status).to.equal(200);
      expect(response.message).to.equal('cache cleared for group key: ' +
        'test-key');
    } catch (err) {
      throw new Error(err);
    }
  });

  it('returns 204 when the trying to delete the same group again', async () => {
    const options = {
      uri: serverUrl + '/cache/clear/group/test-key',
      json: true
    };

    try {
      const response = await request(options);

      expect(!!response).to.equal(true);
      expect(response.status).to.equal(204);
      expect(response.message).to.equal('cache already cleared for the group ' +
        'key: test-key');
    } catch (err) {
      throw new Error(err);
    }
  });

  it('really removed keys in a group', () => {
    client.get('path-2', reply => {
      expect(reply).to.be.equal(null);
    });
  });

  it('really emptied the group', async () => {
    const reply = await lrangeAsync('group-test-key', 0, -1);

    expect(reply).to.be.an('array').to.be.empty;
  });
});
