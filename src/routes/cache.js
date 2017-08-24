const express = require('express');
const router = express.Router();
const redis = require('redis');
const client = redis.createClient();
import RedisCache from './helpers/redis';
const h = new RedisCache(client);

//adding some cache routes

router.get('/clear', function(req, res){
  client.flushall();
  res.status(200).json({
    message: 'Cache cleared'
  });
});

// clear a unique route
router.get('/clear/single/:target?', (req, res) => {
  const t = req.url.split('/')[4];
  if(t.includes('?')){
    h.clearSingle(t).then(r => {
      res.status(200).json({
        message: `cache ${r ? '' : 'already'} cleared for key (with params): ${t}`
      });
    });
  } else {
    h.clearSingle(req.params.target).then(r => {
      res.status(200).json({
        message: `cache ${r ? '' : 'already'} cleared for key (without params): ${req.params.target}`
      });
    });
  }
});  

// clear a group
router.get('/clear/group/:target', (req, res) => {
  client.get(`${req.params.target}`, (err, reply) => {
    const group = reply ? JSON.parse(reply).cache.group : '';
    h.clearGroup(group).then(r => {
      res.status(200).json({
        message: `cache ${r ? '' : 'already'} cleared for the group key: ${req.params.target}`
      });
    });
  }); 
});



// add route to display cache index
router.get('/index', (req, res) => {
  h.scan()
    .then(data => {
      res.status(200).json(data);
    })
    .catch(err => {
      res.status(404).json(err);
    });

});

export default router;

// /**
//  * scan the redis index
//  * @param {Object} redis - redis client
//  */
// function scan(){
//   // starts at 0 if cursor is again 0 it means the iteration is finished
//   let cursor = '0';
//   return new Promise((resolve, reject) => {
//     client.scan(cursor, 'MATCH', '*', 'COUNT', '100', (err, reply) => {
//       if(err){
//         reject(err);
//       }
//       cursor = reply[0];
//       if(cursor === '0'){
//         resolve(reply[1]);
//       } else {
//         // do your processing
//         // reply[1] is an array of matched keys.
//         // console.log(reply[1]);
//         return scan();
//       }
//     });

//   }); 
// }

// /**
//  * Clean single item from the cache
//  * @param {string} key - the key to find in redis
//  */
// function clearSingle(key) {
//   return new Promise(resolve => {
//     client.del(`${key}`, (err, reply) => {
//       if(reply === 1) {
//         resolve(true);
//       }
//       resolve(false);
//     });
//   });
// }

// /**
//  * Clear a group
//  * @param {string} key - key of the group to clean
//  */
// function clearGroup(key) {
//   return new Promise(resolve => {
//     client.lrange(key, 0, -1, (err, reply) => {
//       clearAll(reply).then(
//         client.del(key, (e, r) => {
//           resolve(r === 1 ? true : false)
//         })
//       );
//     });
//   });
// }

// /**
//  * Clear all keys of a redis list
//  * @param {Object[]} array 
//  */
// function clearAll(array) {
//   return new Promise(resolve => {
//     if(array.length === 0) resolve(false);
//     let i = 0;
//     for(i; i < array.length; i++){
//       clearSingle(array[i]).then(r => {
//         if (i === array.length - 1){
//           resolve(r ? true: false);
//         }
//       });
//     }
//   });
// }
