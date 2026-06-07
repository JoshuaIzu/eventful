import { Redis } from 'ioredis';
import { Request, Response, NextFunction } from 'express';
import { IRateLimiterConfig } from '../types';
import { IAuthenticatedRequest } from './auth.middleware';

export class AtomicRedisRateLimiter {
  /**
   * Sliding Window Counter Lua Script.
   * KEYS[1]: Previous window key
   * KEYS[2]: Current window key
   * ARGV[1]: Elapsed time fraction (0.0 to 1.0)
   * ARGV[2]: Max request limit
   * ARGV[3]: Window duration in seconds
   *
   * Returns: {decision (0=blocked, 1=allowed), estimated_count}
   */
  private readonly luaScript = `
    local prev_key = KEYS[1]
    local curr_key = KEYS[2]
    local elapsed = tonumber(ARGV[1])
    local limit = tonumber(ARGV[2])
    local window_secs = tonumber(ARGV[3])

    local prev_res = redis.call('GET', prev_key)
    local curr_res = redis.call('GET', curr_key)

    local prev_count = prev_res and tonumber(prev_res) or 0
    local curr_count = curr_res and tonumber(curr_res) or 0

    local estimated_count = math.floor(prev_count * (1 - elapsed) + curr_count)

    if estimated_count >= limit then
        return {0, estimated_count}
    else
        local new_curr = redis.call('INCR', curr_key)
        if new_curr == 1 then
            redis.call('EXPIRE', curr_key, window_secs * 2)
        end
        return {1, estimated_count + 1}
    end
  `;

  constructor(private readonly redisClient: Redis) {}

  public createMiddleware(config: IRateLimiterConfig, prefix: string) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const authenticatedReq = req as IAuthenticatedRequest;
        const identifier = authenticatedReq.user
          ? authenticatedReq.user.sub
          : (req.ip || 'unknown').replace(/^::ffff:/, '');

        const now = Date.now();
        const windowMs = config.windowSeconds * 1000;

        const currentWindowIndex = Math.floor(now / windowMs);
        const prevWindowIndex = currentWindowIndex - 1;

        const prevKey = `rate:${prefix}:${identifier}:${prevWindowIndex}`;
        const currentKey = `rate:${prefix}:${identifier}:${currentWindowIndex}`;

        const elapsedPercentage = (now % windowMs) / windowMs;

        const result = await this.redisClient.eval(
          this.luaScript,
          2,
          prevKey,
          currentKey,
          elapsedPercentage.toString(),
          config.maxRequests.toString(),
          config.windowSeconds.toString()
        ) as [number, number];

        const [decision, estimatedCount] = result;

        const remaining = Math.max(0, config.maxRequests - estimatedCount);
        const resetSeconds = Math.ceil((1 - elapsedPercentage) * config.windowSeconds);

        res.setHeader('X-RateLimit-Limit', config.maxRequests);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', Math.ceil(Date.now() / 1000) + resetSeconds);

        if (decision === 0) {
          res.status(429).json({
            error: 'TOO_MANY_REQUESTS',
            message: 'Rate limit exceeded. Your request volume has been dynamically throttled.',
            retryAfterSeconds: resetSeconds,
          });
          return;
        }

        next();
      } catch (error) {
        console.error('[CRITICAL_RATELIMIT_FAILSAFE_OPEN] Lua Execution Interrupted:', error);
        next();
      }
    };
  }
}
