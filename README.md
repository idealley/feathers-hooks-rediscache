# Redis Cache

[![Greenkeeper badge](https://badges.greenkeeper.io/idealley/feathers-hooks-rediscache.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/idealley/feathers-hooks-rediscache.png?branch=master)](https://travis-ci.org/idealley/feathers-hooks-rediscache)
[![codecov](https://codecov.io/gh/idealley/feathers-hooks-rediscache/branch/master/graph/badge.svg)](https://codecov.io/gh/idealley/feathers-hooks-rediscache)

> Cache any route with redis

## Releases
* Versions 1.x.x are compatible with Feathersjs 3.x.x
* Versions 0.x.x are compatible with Feathersjs 2.x.x -> this branch will not be updated anymore

## Installation

### Feathers 3.x.x
```
npm install feathers-hooks-rediscache --save
```

### Feathers 2.x.x
If you do not use nested routes you can install version 1.x.x if not:
```
  npm install feathers-hooks-rediscache@0.3.6 --save-exact
```    

## Purpose
The purpose of these hooks is to provide redis caching for APIs endpoints. Using redis is a very good option for clusturing your API. As soon as a request is cached it is available to all the other nodes in the cluster, which is not true for usual in memory cache as each node has its own memory allocated. This means that each node has to cache all requests individually.

Each request to an endpoint can be cached. Route variables and params are cached on a per request base. If a param to call is set to true and then to false two responses will be cached.

The cache can be purged for an individual route, but also for a group of routes. This is very useful if you have an API endpoint that creates a list of articles, and an endpoint that returns an individual article. If the article is modified, the list of articles should, most likely, be purged as well. This can be done by calling one endpoint.

In the same fashion if you have many variants of the same endpoint that return similar content based on parameters you can bust the whole group as well:

```js
'/articles' // list
'/articles/article' //individual item
'/articles/article?markdown=true' // variant
```

These are all listed in a redis list under `group-articles` and can be busted by calling `/cache/clear/group/article` or `/cache/clear/group/articles` it does not matter. All urls will be purged.

It was meant to be used over http, not yet tested with sockets.

## Available hooks
More details and example use bellow

### Before
* `redisBeforeHook` - retrives the data from redis

### After
* `hookCache` - set defaults caching duration, an object can be passed with the duration in seconds
* `redisAfterHook` - saves to redis
* `hookRemoveCacheInformation` - removes the cache object


## Documentation
Add the different hooks. The order matters (see below). A `cache` object will be added to your response. This is useful as other systems can use this object to purge the cache if needed.

If the cache object is not needed/wanted it can be removed with the after hook `hookRemoveCacheInformation()`

### Configuration
#### Redis
To configure the redis connection the feathers configuration system can be used.
```js
//config/default.json
{
  "host": "localhost",
  "port": 3030,
  "redis": {
    "host": "my-redis-service.example.com",
    "port": 1234
  }
}
```
* if no config is provided, default config from the [redis module](https://github.com/NodeRedis/node_redis) is used

#### Hooks Configuration
A redisCache object can be added to the default feathers configuration

```js
//config/default.json

  "redisCache" : {
    "defaultDuration": 3600,
    "parseNestedRoutes": true,
    "removePathFromCacheKey": true,
    "env": "NODE_ENV"
  };
```
##### defaultDuration
The default duration can be configured by passing the duration in seconds to the property `defaultDuration`.
This can be overridden at the hook level (see the full example bellow)

##### parseNestedRoutes
If your API uses nested routes like `/author/:authorId/book` you should turn on the option `parseNestedRoutes`. Otherwise you could have conflicting cache keys.

##### removePathFromCacheKey
`removePathFromCacheKey` is an option that is useful when working with content and slugs. If when this option is turned on you can have the following issue. If your routes use IDs then you could have a conflict and the cache might return the wrong value:

```js
  'user/123'
  'article/123'
```

both items with id `123` would be saved under the same cache key... thus replacing each other and returning one for the other, thus by default the key includes the path to diferenciate them. when working with content you could have an external system busting the cache that is not aware of your API routes. That system would know the slug, but cannot bust the cache as it would have to call `/cache/clear/single/:path/target`, with this option that system can simply call `:target` which would be the slug/alias of the article.

##### env
The default environement is production, but it is anoying when running test as the hooks output information to the console. Therefore if you youse this option, you can set `test` as an environement and the hooks will not output anything to the console. if you use `NODE_ENV` it will pick up the `process.env.NODE_ENV` variable. This is useful for CI or CLI.


Available routes:
```js
// this route is disable as I noticed issues when redis has many keys, 
// I will put it back when I have a more robust solution
// '/cache/index' // returns an array with all the keys
'/cache/clear' // clears the whole cache
'/cache/clear/single/:target' // clears a single route if you want to purge a route with params just adds them target?param=1
'/cache/clear/group/:target' // clears a group
```

## Complete Example

Here's an example of a Feathers server that uses `feathers-hooks-rediscache`.

```js
const feathers = require('feathers');
const rest = require('feathers-rest');
const hooks = require('feathers-hooks');
const bodyParser = require('body-parser');
const errorHandler = require('feathers-errors/handler');
const routes = require('feathers-hooks-rediscache').cacheRoutes;
const redisClient = require('feathers-hooks-rediscache').redisClient;

// Initialize the application
const app = feathers()
  .configure(rest())
  .configure(hooks())
  // configure the redis client
  .configure(redisClient)

  // Needed for parsing bodies (login)
  .use(bodyParser.json())
  .use(bodyParser.urlencoded({ extended: true }))
  // add the cache routes (endpoints) to the app
  .use('/cache', routes(app))
  .use(errorHandler());

app.listen(3030);

console.log('Feathers app started on 127.0.0.1:3030');
```

Add hooks on the routes that need caching
```js
//services/<service>.hooks.js

const redisBefore = require('feathers-hooks-rediscache').redisBeforeHook;
const redisAfter = require('feathers-hooks-rediscache').redisAfterHook;
const cache = require('feathers-hooks-rediscache').hookCache;


module.exports = {
  before: {
    all: [],
    find: [redisBefore()],
    get: [redisBefore()],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [],
    find: [cache({duration: 3600 * 24 * 7}), redisAfter()],
    get: [cache({duration: 3600 * 24 * 7}), redisAfter()],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};
```
* the duration is in seconds and will automatically expire
* you may just use `cache()` without specifying a duration, any request will be cached for a day or with the global configured value (see configuration above).

## License

Copyright (c) 2018

Licensed under the [MIT license](LICENSE).

## Change log
### v.1.1
* Fixes #23. Feathers works slightly differently, now the change is reflected in the hooks. Tests were adapted.
* Fixes #24. When it can Webpack 4 tries to evaluate code and remove "dead" code, therefore a condition testing for the environement was being evaluated, the value was set to the build environement... To bypass that, the hooks consider that they run in production mode. If you want to set a different one add a property `env: "NODE_ENV"` to the rediscache object, it will pick up your node environement and pass it to the hooks.  
### v1.1.0
* The `/index` path as well as the scan methods have been removed for now. In fact, testing on a Redis instance with more than 30k keys, it might bring down your server. I need to find a better way to return keys, or to search for them. So to prevent any problem I have removed it. (the code is commented out).
### v1.0.3
* Webpack 4
* Dependencies update
* Loging of info: modification of the console display
### v1.0.0
* Compatibility with Feathers 3.x.x
* Nested routes fix #3
### v0.3.6
* Fixed config issue, Now using minified version. Thank you @oppodeldoc
### v0.3.5
* Now the ability to parse optional params in nested routes. Thank you @oppodeldoc
### v0.3.4
* new scan method that takes params and a Set to make sure keys are unique.
### v0.3.0
* introduces a breaking change: `.use('/cache', routes(app))`
