import { Request, Response, NextFunction } from 'express';
import { rateLimits, RateLimitKey } from '../config/rateLimit.config';

/**
 * Token Bucket for Rate Limiting
 */
interface TokenBucket {
  tokens: number;
  lastRefill: number;
}

/**
 * In-memory storage for rate limit buckets
 * Structure: Map<userId, Map<routeKey, TokenBucket>>
 */
const rateLimitStore = new Map<string, Map<string, TokenBucket>>();

/**
 * Creates a rate limiting middleware using Token Bucket algorithm
 * 
 * @param routeKey - The key to identify the route (must match rateLimits config)
 * @returns Express middleware function
 * 
 * Features:
 * - Per-user rate limiting
 * - Token bucket algorithm for smooth rate limiting
 * - Handles burst traffic gracefully
 * - Falls back to IP-based limiting if userId is missing
 * - Automatic cleanup of old entries
 */
export function createRateLimiter(routeKey: RateLimitKey) {
  const config = rateLimits[routeKey];
  
  if (!config) {
    throw new Error(`Invalid rate limit key: ${routeKey}`);
  }

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get user identifier - prefer userId, fallback to IP
      const userId = (req as any).userId || req.ip || 'anonymous';
      
      // Handle missing userId for authenticated routes
      if (!userId || userId === 'anonymous') {
        // For authenticated routes, userId should exist
        // If it doesn't, it means auth middleware hasn't run
        // Allow the request but log a warning
        console.warn(`[Rate Limiter] Missing userId for route: ${routeKey}`);
      }

      // Get or create user's bucket map
      if (!rateLimitStore.has(userId)) {
        rateLimitStore.set(userId, new Map());
      }
      const userBuckets = rateLimitStore.get(userId)!;

      // Get or create bucket for this route
      const now = Date.now();
      let bucket = userBuckets.get(routeKey);
      
      if (!bucket) {
        // Initialize new bucket with full capacity
        bucket = {
          tokens: config.capacity,
          lastRefill: now
        };
        userBuckets.set(routeKey, bucket);
      }

      // Calculate tokens to add based on time elapsed
      const timeSinceLastRefill = (now - bucket.lastRefill) / 1000 / 60; // Convert to minutes
      const tokensToAdd = timeSinceLastRefill * config.refillRate;
      
      // Refill tokens (cap at capacity)
      bucket.tokens = Math.min(config.capacity, bucket.tokens + tokensToAdd);
      bucket.lastRefill = now;

      // Check if user has tokens available
      if (bucket.tokens < 1) {
        // Rate limit exceeded
        const retryAfter = Math.ceil((1 - bucket.tokens) / config.refillRate * 60); // seconds
        
        res.status(429).json({
          error: 'Too many requests',
          message: 'Rate limit exceeded. Please try again later.',
          retryAfter: retryAfter
        });
        return;
      }

      // Consume one token
      bucket.tokens -= 1;

      // Add rate limit info to response headers
      res.setHeader('X-RateLimit-Limit', config.capacity.toString());
      res.setHeader('X-RateLimit-Remaining', Math.floor(bucket.tokens).toString());
      res.setHeader('X-RateLimit-Reset', new Date(bucket.lastRefill + 60000).toISOString());

      next();
    } catch (error) {
      // Don't block requests if rate limiter fails
      console.error('[Rate Limiter] Error:', error);
      next();
    }
  };
}

/**
 * Cleanup old rate limit entries
 * Run this periodically to prevent memory leaks
 */
export function cleanupRateLimitStore() {
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour

  for (const [userId, userBuckets] of rateLimitStore.entries()) {
    for (const [routeKey, bucket] of userBuckets.entries()) {
      // Remove buckets that haven't been used in over an hour
      if (now - bucket.lastRefill > maxAge) {
        userBuckets.delete(routeKey);
      }
    }
    
    // Remove user entry if no buckets remain
    if (userBuckets.size === 0) {
      rateLimitStore.delete(userId);
    }
  }
}

// Run cleanup every 30 minutes
setInterval(cleanupRateLimitStore, 30 * 60 * 1000);

/**
 * Get current rate limit stats (useful for debugging/monitoring)
 */
export function getRateLimitStats() {
  const stats = {
    totalUsers: rateLimitStore.size,
    totalBuckets: 0,
    routeBreakdown: {} as Record<string, number>
  };

  for (const userBuckets of rateLimitStore.values()) {
    stats.totalBuckets += userBuckets.size;
    
    for (const [routeKey] of userBuckets.entries()) {
      stats.routeBreakdown[routeKey] = (stats.routeBreakdown[routeKey] || 0) + 1;
    }
  }

  return stats;
}
