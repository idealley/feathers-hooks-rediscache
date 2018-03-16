import express from 'express';
// import redis from 'redis';
import RedisCache from './helpers/redis';

function routes(app) {
  const router = express.Router();
  const client = app.get('redisClient');
  const h = new RedisCache(client);

  // adding some cache routes

  router.get('/clear', (req, res) => {
    client.flushall();
    res.status(200).json({
      message: 'Cache cleared'
    });
  });

  // clear a unique route
  router.get('/clear/single/:target?', (req, res) => {
    const t = req.url.split('/')[3];

    if (t.includes('?')) {
      h.clearSingle(t).then(r => {
        res.status(200).json({
          message: `cache ${r ? '' : 'already'} cleared for key (with params): ${t}`,
          status: r ? 200 : 204
        });
      });
    } else {
      h.clearSingle(req.params.target).then(r => {
        res.status(200).json({
          message: `cache ${r ? '' : 'already'} cleared for key (without params): ${req.params.target}`,
          status: r ? 200 : 204
        });
      });
    }
  });

  // clear a group
  router.get('/clear/group/:target', (req, res) => {
    client.get(`${req.params.target}`, (err, reply) => {
      if (err) {
        res.status(500).json({message: 'something went wrong' + err.message });
      } else {
        const group = reply ? JSON.parse(reply).cache.group : '';

        h.clearGroup(group).then(r => {
          res.status(200).json({
            message: `cache ${r ? '' : 'already'} cleared for the group key: ${req.params.target}`,
            status: r ? 200 : 204
          });
        });
      }
    });
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
