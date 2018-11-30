import express from 'express';

import RedisCache from './helpers/redis';

const HTTP_OK = 200;
const HTTP_NO_CONTENT = 204;
const HTTP_SERVER_ERROR = 500;
const HTTP_NOT_FOUND = 404;

function routes(app) {
  const router = express.Router();
  const client = app.get('redisClient');
  const h = new RedisCache(client);

  router.get('/clear', (req, res) => {
    client.flushall('ASYNC', () => {
      res.status(HTTP_OK).json({
        message: 'Cache cleared',
        status: HTTP_OK
      });
    });
  }); // clear a unique route

  // clear a unique route
  router.get('/clear/single/*', (req, res) => {
    let target = decodeURIComponent(req.params[0]);
    // Formated options following ?
    const query = req.query;
    const hasQueryString = (query && (Object.keys(query).length !== 0));

    // Target should always be defined as Express router raises 404
    // as route is not handled
    if (target.length) {
      if (hasQueryString) {
      // Keep queries in a single string with the taget
        target = decodeURIComponent(req.url.split('/').slice(3).join('/'));
      }

      // Gets the value of a key in the redis client
      client.get(`${target}`, (err, reply) => {
        if (err) {
          res.status(HTTP_SERVER_ERROR).json({
            message: 'something went wrong' + err.message
          });
        } else {
          // If the key existed
          if (reply) {
            // Clear existing cached key
            h.clearSingle(target).then(r => {
              res.status(HTTP_OK).json({
                message: `cache cleared for key (${hasQueryString ?
                  'with' : 'without'} params): ${target}`,
                status: HTTP_OK
              });
            });
          } else {
            /**
             * Empty reply means the key does not exist.
             * Must use HTTP_OK with express as HTTP's RFC stats 204 should not
             * provide a body, message would then be lost.
             */
            res.status(HTTP_OK).json({
              message: `cache already cleared for key (${hasQueryString ?
                'with' : 'without'} params): ${target}`,
              status: HTTP_NO_CONTENT
            });
          }

        }
      });
    } else {
      res.status(HTTP_NOT_FOUND).end();
    }
  });

  // clear a group
  router.get('/clear/group/*', (req, res) => {
    let target = decodeURIComponent(req.params[0]);

    // Target should always be defined as Express router raises 404
    // as route is not handled
    if (target.length) {
      target = 'group-' + target;
      // Returns elements of the list associated to the target/key 0 being the
      // first and -1 specifying get all till the latest
      client.lrange(target, 0, -1, (err, reply) => {
        if (err) {
          res.status(HTTP_SERVER_ERROR).json({
            message: 'something went wrong' + err.message
          });
        } else {
          // If the list/group existed and contains something
          if (reply && Array.isArray(reply) && (reply.length > 0)) {
            // Clear existing cached group key
            h.clearGroup(target).then(r => {
              res.status(HTTP_OK).json({
                message:
                  `cache cleared for the group key: ${decodeURIComponent(req.params[0])}`,
                status: HTTP_OK
              });
            });
          } else {
            /**
             * Empty reply means the key does not exist.
             * Must use HTTP_OK with express as HTTP's RFC stats 204 should not
             * provide a body, message would then be lost.
             */
            res.status(HTTP_OK).json({
              message:
                `cache already cleared for the group key: ${decodeURIComponent(req.params[0])}`,
              status: HTTP_NO_CONTENT
            });
          }
        }
      });
    } else {
      res.status(HTTP_NOT_FOUND).end();
    }
  });

  // add route to display cache index
  // this has been removed for performance issues
  // router.get('/index', (req, res) => {
  //   let results = new Set();

  //   h.scanAsync('0', '*', results)
  //     .then(data => {
  //       res.status(200).json(data);
  //     })
  //     .catch(err => {
  //       res.status(404).json(err);
  //     });

  // });

  return router;
}

export default routes;
