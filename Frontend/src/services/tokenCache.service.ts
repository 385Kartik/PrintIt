/**
 * Token Count Caching Service
 * 
 * Manages caching of user's token count to reduce API calls.
 * Implements a cache-first strategy with background refresh.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface TokenCache {
  count: number;
  timestamp: number;
}

const CACHE_KEY = 'token_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Token Caching Service
 */
export const tokenCacheService = {
  /**
   * Get cached token count
   * @returns Cached token count or null if cache is invalid/expired
   */
  getCachedTokens(): number | null {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;

      const data: TokenCache = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - data.timestamp > CACHE_DURATION) {
        // Cache expired
        this.clearCache();
        return null;
      }

      return data.count;
    } catch (error) {
      console.error('[Token Cache] Failed to read cache:', error);
      return null;
    }
  },

  /**
   * Update cache with new token count
   */
  setCachedTokens(count: number): void {
    try {
      const cache: TokenCache = {
        count,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.error('[Token Cache] Failed to write cache:', error);
    }
  },

  /**
   * Clear the token cache
   */
  clearCache(): void {
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('[Token Cache] Failed to clear cache:', error);
    }
  },

  /**
   * Fetch fresh token count from backend
   * @param token - Authentication token
   */
  async fetchTokenCount(token: string): Promise<number> {
    const response = await fetch(`${API_URL}/user/tokens`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch token count');
    }

    const data = await response.json();
    return data.tokens;
  },

  /**
   * Get token count with cache-first strategy
   * Returns cached value immediately, then updates in background
   * 
   * @param token - Authentication token
   * @param updateCallback - Callback to update UI with fresh token count
   * @returns Cached token count or null if no cache exists
   */
  async getTokensWithCache(
    token: string | null,
    updateCallback?: (count: number) => void
  ): Promise<number | null> {
    if (!token) {
      this.clearCache();
      return null;
    }

    // Get cached value
    const cachedTokens = this.getCachedTokens();

    // Fetch fresh value in background
    this.fetchTokenCount(token)
      .then(freshCount => {
        // Update cache
        this.setCachedTokens(freshCount);
        
        // Update UI if callback provided
        if (updateCallback) {
          updateCallback(freshCount);
        }
      })
      .catch(error => {
        console.error('[Token Cache] Background refresh failed:', error);
      });

    // Return cached value immediately
    return cachedTokens;
  },

  /**
   * Force refresh token count (bypasses cache)
   */
  async refreshTokenCount(token: string): Promise<number> {
    const count = await this.fetchTokenCount(token);
    this.setCachedTokens(count);
    return count;
  }
};
