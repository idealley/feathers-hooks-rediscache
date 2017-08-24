import cacheRoutes from './routes/cache';
import { cache as hookCache } from './hooks/cache';
import { before as redisBeforeHook} from './hooks/redis';
import { after as redisAfterHook} from './hooks/redis';

export {
  cacheRoutes,
  hookCache,
  redisBeforeHook,
  redisAfterHook
};
