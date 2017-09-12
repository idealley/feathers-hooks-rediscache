import cacheRoutes from './routes/cache';
import redisClient from './redisClient';
import { cache as hookCache } from './hooks/cache';
import { before as redisBeforeHook} from './hooks/redis';
import { after as redisAfterHook} from './hooks/redis';

export {
  redisClient,
  cacheRoutes,
  hookCache,
  redisBeforeHook,
  redisAfterHook
};
