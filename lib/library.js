(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("library", [], factory);
	else if(typeof exports === 'object')
		exports["library"] = factory();
	else
		root["library"] = factory();
})(global, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/hooks/cache.js":
/*!****************************!*\
  !*** ./src/hooks/cache.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.cache = cache;
exports.removeCacheInformation = removeCacheInformation;

/**
 * After hook - generates a cache object that is needed
 * for the redis hook and the express middelware.
 * @todo add default value in config file
 */
const defaults = {};

function cache(options) {
  // eslint-disable-line no-unused-vars
  options = Object.assign({}, defaults, options);
  return function (hook) {
    if (!hook.result.hasOwnProperty('cache')) {
      let cache = {};

      if (Array.isArray(hook.result)) {
        const array = hook.result;
        cache.wrapped = array;
        hook.result = {};
      }

      cache = Object.assign({}, cache, {
        cached: false,
        duration: options.duration || 3600 * 24
      });
      hook.result.cache = cache;
    }

    return Promise.resolve(hook);
  };
}

;

function removeCacheInformation(options) {
  // eslint-disable-line no-unused-vars
  options = Object.assign({}, defaults, options);
  return function (hook) {
    if (hook.result.hasOwnProperty('cache')) {
      delete hook.result.cache;
    }

    return Promise.resolve(hook);
  };
}

;

/***/ }),

/***/ "./src/hooks/helpers/path.js":
/*!***********************************!*\
  !*** ./src/hooks/helpers/path.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parsePath = parsePath;

var _qs = _interopRequireDefault(__webpack_require__(/*! qs */ "qs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseNestedPath(path, params) {
  const re = new RegExp(':([^\\/\\?]+)\\??', 'g');
  let match = null;

  while ((match = re.exec(path)) !== null) {
    if (Object.keys(params.route).includes(match[1])) {
      path = path.replace(match[0], params.route[match[1]]);
    }
  }

  return path;
}

function parsePath(hook, config = {
  removePathFromCacheKey: false,
  parseNestedRoutes: false
}) {
  const q = hook.params.query || {};
  const remove = config.removePathFromCacheKey;
  const parseNestedRoutes = config.parseNestedRoutes;
  let path = remove && hook.id ? '' : `${hook.path}`;

  if (!remove && parseNestedRoutes) {
    path = parseNestedPath(path, hook.params);
  }

  if (hook.id) {
    if (path.length !== 0 && !remove) {
      path += '/';
    }

    if (Object.keys(q).length > 0) {
      path += `${hook.id}?${_qs.default.stringify(q, {
        encode: false
      })}`;
    } else {
      path += `${hook.id}`;
    }
  } else {
    if (Object.keys(q).length > 0) {
      path += `?${_qs.default.stringify(q, {
        encode: false
      })}`;
    }
  }

  return path;
}

/***/ }),

/***/ "./src/hooks/redis.js":
/*!****************************!*\
  !*** ./src/hooks/redis.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.before = before;
exports.after = after;

var _moment = _interopRequireDefault(__webpack_require__(/*! moment */ "moment"));

var _chalk = _interopRequireDefault(__webpack_require__(/*! chalk */ "chalk"));

var _path = __webpack_require__(/*! ./helpers/path */ "./src/hooks/helpers/path.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const defaults = {};

function before(options) {
  // eslint-disable-line no-unused-vars
  options = Object.assign({}, defaults, options);
  return function (hook) {
    return new Promise(resolve => {
      const client = hook.app.get('redisClient');
      const cacheOptions = hook.app.get('redisCache');
      const env = cacheOptions.env || 'production';
      const path = (0, _path.parsePath)(hook, cacheOptions);
      client.get(path, (err, reply) => {
        if (err !== null) resolve(hook);

        if (reply) {
          let data = JSON.parse(reply);
          const duration = (0, _moment.default)(data.cache.expiresOn).format('DD MMMM YYYY - HH:mm:ss');
          hook.result = data;
          resolve(hook);
          /* istanbul ignore next */

          if (env !== 'test') {
            console.log(`${_chalk.default.cyan('[redis]')} returning cached value for ${_chalk.default.green(path)}.`);
            console.log(`> Expires on ${duration}.`);
          }
        } else {
          resolve(hook);
        }
      });
    });
  };
}

;

function after(options) {
  // eslint-disable-line no-unused-vars
  options = Object.assign({}, defaults, options);
  return function (hook) {
    return new Promise(resolve => {
      if (!hook.result.cache.cached) {
        const cacheOptions = hook.app.get('redisCache');
        const env = cacheOptions.env || 'production';
        const cachingDefault = cacheOptions.defaultDuration ? cacheOptions.defaultDuration : 3600 * 24;
        const duration = hook.result.cache.duration || cachingDefault;
        const client = hook.app.get('redisClient');
        const path = (0, _path.parsePath)(hook, cacheOptions); // adding a cache object

        Object.assign(hook.result.cache, {
          cached: true,
          duration: duration,
          expiresOn: (0, _moment.default)().add(_moment.default.duration(duration, 'seconds')),
          parent: hook.path,
          group: hook.path ? `group-${hook.path}` : '',
          key: path
        });
        client.set(path, JSON.stringify(hook.result));
        client.expire(path, hook.result.cache.duration);

        if (hook.path) {
          client.rpush(hook.result.cache.group, path);
        }
        /* istanbul ignore next */


        if (env !== 'test') {
          console.log(`${_chalk.default.cyan('[redis]')} added ${_chalk.default.green(path)} to the cache.`);
          console.log(`> Expires in ${_moment.default.duration(duration, 'seconds').humanize()}.`);
        }
      }

      if (hook.result.cache.hasOwnProperty('wrapped')) {
        const {
          wrapped
        } = hook.result.cache;
        hook.result = wrapped;
      }

      resolve(hook);
    });
  };
}

;

/***/ }),

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _cache = _interopRequireDefault(__webpack_require__(/*! ./routes/cache */ "./src/routes/cache.js"));

var _redisClient = _interopRequireDefault(__webpack_require__(/*! ./redisClient */ "./src/redisClient.js"));

var _cache2 = __webpack_require__(/*! ./hooks/cache */ "./src/hooks/cache.js");

var _redis = __webpack_require__(/*! ./hooks/redis */ "./src/hooks/redis.js");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  redisClient: _redisClient.default,
  cacheRoutes: _cache.default,
  hookCache: _cache2.cache,
  hookRemoveCacheInformation: _cache2.removeCacheInformation,
  redisBeforeHook: _redis.before,
  redisAfterHook: _redis.after
};
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./src/redisClient.js":
/*!****************************!*\
  !*** ./src/redisClient.js ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = redisClient;

var _redis = _interopRequireDefault(__webpack_require__(/*! redis */ "redis"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function redisClient() {
  // eslint-disable-line no-unused-vars
  this.set('redisClient', _redis.default.createClient(this.get('redis')));
  return this;
}

module.exports = exports.default;

/***/ }),

/***/ "./src/routes/cache.js":
/*!*****************************!*\
  !*** ./src/routes/cache.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _express = _interopRequireDefault(__webpack_require__(/*! express */ "express"));

var _redis = _interopRequireDefault(__webpack_require__(/*! ./helpers/redis */ "./src/routes/helpers/redis.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const HTTP_OK = 200;
const HTTP_NO_CONTENT = 204;
const HTTP_SERVER_ERROR = 500;

function routes(app) {
  const router = _express.default.Router();

  const client = app.get('redisClient');
  const h = new _redis.default(client);
  router.get('/clear', (req, res) => {
    client.flushall();
    res.status(HTTP_OK).json({
      message: 'Cache cleared',
      status: HTTP_OK
    });
  }); // clear a unique route

  router.get('/clear/single/:target', (req, res) => {
    let target = decodeURIComponent(req.params.target); // Formated options following ?

    const query = req.query;
    const hasQueryString = query && Object.keys(query).length !== 0; // Target should always be defined as Express router raises 404
    // as route is not handled

    if (target) {
      if (hasQueryString) {
        // Keep queries in a single string with the taget
        target = decodeURIComponent(req.url.split('/')[3]);
      } // Gets the value of a key in the redis client


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
                message: `cache cleared for key (${hasQueryString ? 'with' : 'without'} params): ${target}`,
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
              message: `cache already cleared for key (${hasQueryString ? 'with' : 'without'} params): ${target}`,
              status: HTTP_NO_CONTENT
            });
          }
        }
      });
    }
  }); // clear a group

  router.get('/clear/group/:target', (req, res) => {
    let target = decodeURIComponent(req.params.target); // Target should always be defined as Express router raises 404
    // as route is not handled

    if (target) {
      target = 'group-' + target; // Returns elements of the list associated to the target/key 0 being the
      // first and -1 specifying get all till the latest

      client.lrange(target, 0, -1, (err, reply) => {
        if (err) {
          res.status(HTTP_SERVER_ERROR).json({
            message: 'something went wrong' + err.message
          });
        } else {
          // If the list/group existed and contains something
          if (reply && Array.isArray(reply) && reply.length > 0) {
            // Clear existing cached group key
            h.clearGroup(target).then(r => {
              res.status(HTTP_OK).json({
                message: `cache cleared for the group key: ${decodeURIComponent(req.params.target)}`,
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
              message: `cache already cleared for the group key: ${decodeURIComponent(req.params.target)}`,
              status: HTTP_NO_CONTENT
            });
          }
        }
      });
    }
  }); // add route to display cache index
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

var _default = routes;
exports.default = _default;
module.exports = exports.default;

/***/ }),

/***/ "./src/routes/helpers/redis.js":
/*!*************************************!*\
  !*** ./src/routes/helpers/redis.js ***!
  \*************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

class RedisCache {
  constructor(client) {
    this.client = client;
  }
  /**
   * scan the redis index
   */
  // scan() {
  //   // starts at 0 if cursor is again 0 it means the iteration is finished
  //   let cursor = '0';
  //   return new Promise((resolve, reject) => {
  //     this.client.scan(cursor, 'MATCH', '*', 'COUNT', '100', (err, reply) => {
  //       if (err) {
  //         reject(err);
  //       }
  //       cursor = reply[0];
  //       if (cursor === '0') {
  //         resolve(reply[1]);
  //       } else {
  //         // do your processing
  //         // reply[1] is an array of matched keys.
  //         // console.log(reply[1]);
  //         return this.scan();
  //       }
  //       return false;
  //     });
  //   });
  // }

  /**
   * Async scan of the redis index
   * Do not for get to passin a Set
   * myResults = new Set();
   *
   * scanAsync('0', "NOC-*[^listen]*", myResults).map(
   *   myResults => { console.log( myResults); }
   * );
   *
   * @param {String} cursor - string '0'
   * @param {String} patern - string '0'
   * @param {Set} returnSet - pass a set to have unique keys
   */
  // scanAsync(cursor, pattern, returnSet) {
  //   // starts at 0 if cursor is again 0 it means the iteration is finished
  //   return new Promise((resolve, reject) => {
  //     this.client.scan(cursor, 'MATCH', pattern, 'COUNT', '100', (err, reply) => {
  //       if (err) {
  //         reject(err);
  //       }
  //       cursor = reply[0];
  //       const keys = reply[1];
  //       keys.forEach((key, i) => {
  //         returnSet.add(key);
  //       });
  //       if (cursor === '0') {
  //         resolve(Array.from(returnSet));
  //       }
  //       return this.scanAsync(cursor, pattern, returnSet);
  //     });
  //   });
  // }

  /**
   * Clean single item from the cache
   * @param {string} key - the key to find in redis
   */


  clearSingle(key) {
    return new Promise((resolve, reject) => {
      this.client.del(`${key}`, (err, reply) => {
        if (err) reject(false);

        if (reply === 1) {
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
    return new Promise((resolve, reject) => {
      this.client.lrange(key, 0, -1, (err, reply) => {
        if (err) {
          reject(err);
        }

        this.clearAll(reply).then(this.client.del(key, (e, r) => {
          resolve(r === 1);
        }));
      });
    });
  }
  /**
   * Clear all keys of a redis list
   * @param {Object[]} array
   */


  clearAll(array) {
    return new Promise(resolve => {
      if (!array.length) resolve(false);
      let i = 0;

      for (i; i < array.length; i++) {
        this.clearSingle(array[i]).then(r => {
          if (i === array.length - 1) {
            resolve(r);
          }
        });
      }
    });
  }

}

exports.default = RedisCache;
;
module.exports = exports.default;

/***/ }),

/***/ "chalk":
/*!************************!*\
  !*** external "chalk" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("chalk");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),

/***/ "moment":
/*!*************************!*\
  !*** external "moment" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("moment");

/***/ }),

/***/ "qs":
/*!*********************!*\
  !*** external "qs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("qs");

/***/ }),

/***/ "redis":
/*!************************!*\
  !*** external "redis" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("redis");

/***/ })

/******/ });
});
//# sourceMappingURL=library.js.map