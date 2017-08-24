import { expect } from 'chai';
import redis from 'redis';
import moment from 'moment';
import { redisBeforeHook as b } from '../src';

const client = redis.createClient();

describe('Redis Before Hook', () => {
  before(() => {
    client.set('before-test-route', JSON.stringify(
      {
        _sys: {
          status: 200
        },
        cache: {
          cached: true,
          duration: 8400,
          expiresOn: moment().add(moment.duration(8400, 'seconds'))
        }
      }
    ));

    client.set('before-test-route?full=true', JSON.stringify(
      {
        _sys: {
          status: 200
        },
        cache: {
          cached: true,
          duration: 8400,
          expiresOn: moment().add(moment.duration(8400, 'seconds'))
        }
      }
    ));

    client.set('before-parent-route', JSON.stringify(
      {
        _sys: {
          status: 200
        },
        cache: {
          cached: true,
          duration: 8400,
          expiresOn: moment().add(moment.duration(8400, 'seconds'))
        }
      }
    ));

    client.set('before-parent-route?full=true', JSON.stringify(
      {
        _sys: {
          status: 200
        },
        cache: {
          cached: true,
          duration: 8400,
          expiresOn: moment().add(moment.duration(8400, 'seconds'))
        }
      }
    ));
  });

  it('retrives a cached object', () => {
    const hook = b();
    const mock = {
      params: { query: ''},
      path: '',
      id: 'before-test-route'
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data.cache.cached).to.equal(true);
    });
  });

  it('retrives a cached object with params', () => {
    const hook = b();
    const mock = {
      params: { query: { full: true }},
      path: '',
      id: 'before-test-route'
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data.cache.cached).to.equal(true);
    });
  });

  it('retrives a cached parent object', () => {
    const hook = b();
    const mock = {
      params: { query: ''},
      path: 'before-parent-route',
      id: ''
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data.cache.cached).to.equal(true);
    });
  });

  it('retrives a cached parent object with params', () => {
    const hook = b();
    const mock = {
      params: { query: { full: true }},
      path: 'before-parent-route',
      id: ''
    };

    return hook(mock).then(result => {
      const data = result.result;

      expect(data.cache.cached).to.equal(true);
    });
  });

  it('does not do anything', () => {
    const hook = b();
    const mock = {
      params: { query: { full: true }},
      path: 'does-nothing',
      id: ''
    };

    return hook(mock).then(result => {
      const data = result;

      expect(data.path).to.equal('does-nothing');
      expect(data).to.not.have.a.property('result');
    });
  });

  after(() => {
    client.del('before-test-route');
    client.del('before-test-route?full=true');
    client.del('before-parent-route');
    client.del('before-parent-route?full=true');
  });
});
