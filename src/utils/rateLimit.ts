import { NextApiResponse } from 'next';
import LRUCache from 'lru-cache';

type Options = {
  interval: number;
  uniqueTokenPerInterval: number;
};

export function rateLimit(options: Options) {
  const tokenCache = new LRUCache<string, number[]>({
    max: options.uniqueTokenPerInterval || 500,
    ttl: options.interval || 60000,
  });

  return {
    check: (res: NextApiResponse, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = tokenCache.get(token) || [0];
        
        if (tokenCount[0] === 0) {
          tokenCache.set(token, tokenCount);
        }
        
        tokenCount[0] += 1;
        
        const currentUsage = tokenCount[0];
        const isRateLimited = currentUsage > limit;
        
        res.setHeader('X-RateLimit-Limit', limit);
        res.setHeader('X-RateLimit-Remaining', isRateLimited ? 0 : limit - currentUsage);
        
        if (isRateLimited) {
          res.status(429).json({ error: 'Rate limit exceeded' });
          reject(new Error('Rate limit exceeded'));
        } else {
          resolve();
        }
      }),
  };
}
