/**
 * Rate Limiting Configuration
 * Token Bucket Algorithm Parameters:
 * - capacity: Maximum number of tokens in the bucket
 * - refillRate: Number of tokens added per minute
 * 
 * These limits are intentionally generous to avoid impacting normal users
 * while still protecting against automated abuse and direct endpoint attacks.
 */

export const rateLimits = {
  // Print operations - main user workflow
  print: { 
    capacity: 60,      // 60 requests burst capacity
    refillRate: 60     // Refill 60 tokens per minute (1 per second)
  },
  
  // User operations - profile, tokens, etc.
  user: { 
    capacity: 120,     // 120 requests burst capacity
    refillRate: 120    // Refill 120 tokens per minute (2 per second)
  },
  
  // Admin operations - lower limit as fewer admins
  admin: { 
    capacity: 30,      // 30 requests burst capacity
    refillRate: 30     // Refill 30 tokens per minute (0.5 per second)
  },
  
  // Support/contact operations
  support: { 
    capacity: 20,      // 20 requests burst capacity
    refillRate: 20     // Refill 20 tokens per minute
  },
  
  // Auth operations - OTP requests etc.
  auth: { 
    capacity: 10,      // 10 requests burst capacity (prevent OTP spam)
    refillRate: 10     // Refill 10 tokens per minute
  }
};

export type RateLimitKey = keyof typeof rateLimits;
