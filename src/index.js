import cacheRoutes from './routes/cache.js';
import hookCache from './hooks/cache.js';
import { before as redisBeforeHook} from './hooks/redis.js';
import { after as redisAfterHook} from './hooks/redis.js';

export { 
  cacheRoutes, 
  hookCache,
  redisBeforeHook,
  redisAfterHook
};