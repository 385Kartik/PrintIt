# API Features Documentation

This document describes the key features and enhancements implemented in the PrintIt API.

## Table of Contents
1. [Health Check & Backend Ping](#health-check--backend-ping)
2. [Rate Limiting](#rate-limiting)
3. [Token Count Caching](#token-count-caching)

---

## Health Check & Backend Ping

### Backend Health Endpoint

**Endpoint:** `GET /health`

**Description:** Simple health check endpoint to verify backend server status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2026-03-08T10:30:00.000Z"
}
```

**Status Codes:**
- `200 OK` - Server is running

### Frontend Ping Implementation

The frontend automatically sends a ping request to the backend when the application loads. This helps:
- Wake up the server if it's in sleep mode (common with free-tier hosting)
- Verify backend connectivity on app startup
- Reduce first API call latency for users

**Implementation Details:**
- Ping is sent once on initial page load
- Uses a 5-second timeout to prevent blocking
- Fails silently - does not affect user experience
- No UI indication is shown to users

**Location:** `Frontend/src/main.tsx`

---

## Rate Limiting

### Overview

PrintIt implements per-user rate limiting using the **Token Bucket Algorithm** to protect against API abuse while allowing legitimate usage patterns including burst traffic.

### Token Bucket Algorithm

The token bucket algorithm works as follows:
1. Each user has a "bucket" that can hold a maximum number of tokens (capacity)
2. Tokens are consumed with each API request (1 token per request)
3. Tokens are refilled at a constant rate (refillRate per minute)
4. Requests are allowed only if tokens are available
5. Burst traffic is allowed up to the bucket capacity

### Rate Limit Configuration

**File:** `Backend/src/config/rateLimit.config.ts`

```typescript
export const rateLimits = {
  print: { 
    capacity: 60,      // 60 requests burst capacity
    refillRate: 60     // 60 tokens per minute (1 per second)
  },
  user: { 
    capacity: 120,     // 120 requests burst capacity
    refillRate: 120    // 120 tokens per minute (2 per second)
  },
  admin: { 
    capacity: 30,      // 30 requests burst capacity
    refillRate: 30     // 30 tokens per minute
  },
  support: { 
    capacity: 20,      // 20 requests burst capacity
    refillRate: 20     // 20 tokens per minute
  },
  auth: { 
    capacity: 10,      // 10 requests burst capacity
    refillRate: 10     // 10 tokens per minute (prevents OTP spam)
  }
}
```

### Applied Routes

Rate limiting is applied to the following route groups:

| Route Group | Limit | Applied To |
|------------|-------|------------|
| `/api/print/*` | 60 req/min | All print operations |
| `/api/user/*` | 120 req/min | User profile, token balance |
| `/api/admin/*` | 30 req/min | All admin operations |
| `/api/support/*` | 20 req/min | Contact form submissions |
| `/api/auth/*` | 10 req/min | OTP requests, login, signup |

### Response Headers

When rate limiting is active, the following headers are included in responses:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 2026-03-08T10:31:00.000Z
```

### Rate Limit Exceeded Response

When a user exceeds their rate limit:

**Status Code:** `429 Too Many Requests`

**Response Body:**
```json
{
  "error": "Too many requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retryAfter": 30
}
```

- `retryAfter`: Seconds until the next token is available

### Edge Case Handling

1. **Missing User ID**
   - Falls back to IP-based rate limiting
   - Logs a warning for debugging
   - Does not block the request

2. **Burst Traffic**
   - Allowed up to bucket capacity
   - Example: A user can make 60 print requests instantly, then is limited to 1 per second

3. **Long Idle Periods**
   - Buckets are automatically cleaned up after 1 hour of inactivity
   - Prevents memory leaks

4. **Middleware Failure**
   - If rate limiter encounters an error, requests are allowed through
   - Error is logged for debugging
   - Ensures service availability

### Per-User Tracking

Rate limits are tracked per user ID, which is extracted from the JWT token by the authentication middleware. This ensures:
- Fair usage limits per user
- Users cannot circumvent limits by changing IP addresses
- Multiple requests from the same user across different sessions are tracked correctly

### Memory Management

**Storage:** In-memory Map structure
- `Map<userId, Map<routeKey, TokenBucket>>`
- Automatic cleanup every 30 minutes
- Removes buckets inactive for more than 1 hour

**Monitoring:**
```typescript
// Get current rate limit statistics
import { getRateLimitStats } from './middleware/rateLimit.middleware';

const stats = getRateLimitStats();
// Returns: { totalUsers, totalBuckets, routeBreakdown }
```

### Implementation Files

- Configuration: `Backend/src/config/rateLimit.config.ts`
- Middleware: `Backend/src/middleware/rateLimit.middleware.ts`
- Applied in: `Backend/src/routes/*.routes.ts`

---

## Token Count Caching

### Overview

Token count caching reduces unnecessary API calls by implementing a cache-first strategy with background refresh. This improves performance and reduces backend load.

### How It Works

1. **Cache-First Strategy:**
   - When token count is requested, cached value is returned immediately
   - A background API call fetches the latest value
   - UI updates asynchronously when fresh data arrives

2. **Cache Duration:**
   - Cache is valid for 5 minutes
   - Expired cache triggers immediate API call

3. **Storage:**
   - Cached in browser's `localStorage`
   - Survives page refreshes
   - Cleared on logout

### Implementation

**Service File:** `Frontend/src/services/tokenCache.service.ts`

### API Methods

#### `getCachedTokens()`
Returns cached token count or null if cache is invalid/expired.

```typescript
const cachedTokens = tokenCacheService.getCachedTokens();
// Returns: number | null
```

#### `setCachedTokens(count: number)`
Updates cache with new token count.

```typescript
tokenCacheService.setCachedTokens(150);
```

#### `getTokensWithCache(token, updateCallback)`
Cache-first strategy: returns cached value immediately, updates in background.

```typescript
const cachedTokens = await authService.getTokensWithCache((freshCount) => {
  console.log('Updated token count:', freshCount);
  // Update UI here
});
```

#### `refreshTokenCount(token)`
Force refresh - bypasses cache and fetches from backend.

```typescript
const freshCount = await authService.refreshTokenCount();
```

#### `clearCache()`
Clear the token cache (called on logout).

```typescript
tokenCacheService.clearCache();
```

### Integration with Auth Service

The token caching is integrated into the existing auth service:

**File:** `Frontend/src/services/auth.service.ts`

```typescript
// Get tokens with caching
await authService.getTokensWithCache((freshCount) => {
  setUser(prev => prev ? { ...prev, tokens: freshCount } : null);
});

// Force refresh
await authService.refreshTokenCount();
```

### Usage in App Component

**File:** `Frontend/src/App.tsx`

On page load, the app:
1. Loads user from localStorage (instant)
2. Displays cached token count (instant)
3. Fetches fresh token count in background
4. Updates UI when fresh data arrives (no loading state)

```typescript
const fetchUserData = useCallback(async () => {
  const cachedUser = authService.getUser();
  const token = authService.getToken();
  
  if (!cachedUser || !token) return;

  // Display cached user immediately
  setUser(cachedUser);
  
  // Refresh token count in background
  authService.getTokensWithCache((freshTokenCount) => {
    setUser(prev => prev ? { ...prev, tokens: freshTokenCount } : null);
  });
}, []);
```

### Cache Invalidation

Cache is automatically cleared:
- When user logs out
- When cache expires (5 minutes)
- When token count is manually updated (e.g., after payment)

### Benefits

1. **Reduced Latency:** Users see token count instantly without waiting for API
2. **Better UX:** No loading spinners for token count on page load
3. **Reduced Backend Load:** Fewer API calls to `/api/user/tokens` endpoint
4. **Offline Resilience:** Shows last known token count if API is temporarily unavailable

### Performance Impact

- **Without caching:** ~200-500ms delay to show token count on page load
- **With caching:** Instant display (0ms), background refresh completes asynchronously

---

## Best Practices

### Rate Limiting
- Configure generous limits that normal users won't hit
- Monitor rate limit stats periodically
- Adjust limits based on usage patterns
- Log rate limit violations for abuse detection

### Token Caching
- Always use cache-first strategy for reads
- Invalidate cache after updates (payments, manual refresh)
- Clear cache on logout for security
- Set appropriate cache duration based on data volatility

### Health Checks
- Use `/health` endpoint for monitoring and uptime checks
- Set up automated health checks in production
- Monitor response times for performance tracking

---

## Troubleshooting

### Rate Limiting Issues

**Problem:** Users getting rate limited frequently
**Solution:** Increase capacity or refillRate in `rateLimit.config.ts`

**Problem:** Rate limiter causing memory issues
**Solution:** Decrease cleanup interval or reduce cache duration

### Token Caching Issues

**Problem:** Stale token count displayed
**Solution:** Reduce cache duration or force refresh after transactions

**Problem:** Cache not persisting
**Solution:** Check browser localStorage permissions and quota

### Health Check Issues

**Problem:** Frontend can't reach `/health` endpoint
**Solution:** Verify CORS settings and API_URL configuration

---

## Configuration Summary

### Environment Variables

No new environment variables are required for these features. They work with existing configuration.

### Customization Points

1. **Rate Limits:** Edit `Backend/src/config/rateLimit.config.ts`
2. **Cache Duration:** Edit `CACHE_DURATION` in `Frontend/src/services/tokenCache.service.ts`
3. **Ping Timeout:** Edit timeout value in `Frontend/src/main.tsx`

---

## Future Enhancements

Potential improvements for these features:

1. **Rate Limiting:**
   - Redis-based distributed rate limiting for multi-server setups
   - Route-specific custom rate limits (e.g., slower for file uploads)
   - Dynamic rate limits based on user tier/subscription

2. **Token Caching:**
   - IndexedDB for larger cache storage
   - Service Worker integration for offline support
   - Real-time token updates via WebSockets

3. **Health Checks:**
   - Detailed health metrics (database, S3, external services)
   - Health check dashboard
   - Automated alerting on health check failures
