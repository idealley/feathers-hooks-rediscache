export default class RedisCache {
  constructor(client) {
    this.client = client;
  }

  /**
   * scan the redis index
   * @param {Object} redis - redis client
   */
  scan() {
    // starts at 0 if cursor is again 0 it means the iteration is finished
    let cursor = '0';
    return new Promise((resolve, reject) => {
      this.client.scan(cursor, 'MATCH', '*', 'COUNT', '100', (err, reply) => {
        if(err){
          reject(err);
        }
        cursor = reply[0];
        if(cursor === '0'){
          resolve(reply[1]);
        } else {
          // do your processing
          // reply[1] is an array of matched keys.
          // console.log(reply[1]);
          return scan();
        }
      });

    }); 
  }

  /**
   * Clean single item from the cache
   * @param {string} key - the key to find in redis
   */
  clearSingle(key) {
    return new Promise(resolve => {
      this.client.del(`${key}`, (err, reply) => {
        if(reply === 1) {
          resolve(true);
        }
        resolve(false);
      });
    });
  }

  /**
   * Clear a group
   * @param {string} key - key of the group to clean
   */
  clearGroup(key) {
    return new Promise(resolve => {
      this.client.lrange(key, 0, -1, (err, reply) => {
        this.clearAll(reply).then(
          this.client.del(key, (e, r) => {
            resolve(r === 1 ? true : false)
          })
        );
      });
    });
  }

  /**
   * Clear all keys of a redis list
   * @param {Object[]} array 
   */
  clearAll(array) {
    return new Promise(resolve => {
      if(array.length === 0) resolve(false);
      let i = 0;
      for(i; i < array.length; i++){
        this.clearSingle(array[i]).then(r => {
          if (i === array.length - 1){
            resolve(r ? true : false);
          }
        });
      }
    });  
  }
};