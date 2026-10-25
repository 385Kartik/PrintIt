const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

import { tokenCacheService } from './tokenCache.service';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  college?: string;
  tokens: number;
  isAdmin?: boolean;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export const authService = {
  // NEW: Request OTP for signup (includes phone)
  async requestSignupOTP(
    name: string,
    email: string,
    phone?: string
  ): Promise<{ message: string; email: string; phone?: string }> {
    const response = await fetch(`${API_URL}/auth/request-signup-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, phone }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }

    return response.json();
  },

  // NEW: Verify OTP and complete signup
  async verifySignupOTP(
    name: string,
    email: string,
    phone: string | undefined,
    otp: string,
    college?: string
  ): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/verify-signup-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, phone, otp, college }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }

    return response.json();
  },

  async requestLoginOTP(email: string): Promise<{ message: string; email: string }> {
    const response = await fetch(`${API_URL}/auth/request-login-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send OTP');
    }

    return response.json();
  },

  async verifyLoginOTP(email: string, otp: string): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/verify-login-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, otp }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'OTP verification failed');
    }

    return response.json();
  },

  async getProfile(token: string): Promise<{ user: User }> {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch profile');
    }

    return response.json();
  },

  async updateProfile(
    token: string,
    updates: { phone?: string; college?: string }
  ): Promise<User> {
    const response = await fetch(`${API_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    const data = await response.json();
    return data.user;
  },

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  },

  getToken(): string | null {
    return localStorage.getItem('token');
  },

  removeToken(): void {
    localStorage.removeItem('token');
  },

  saveUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    // Update token cache when user is saved
    tokenCacheService.setCachedTokens(user.tokens);
  },

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  removeUser(): void {
    localStorage.removeItem('user');
  },

  logout(): void {
    this.removeToken();
    this.removeUser();
    // Clear token cache on logout
    tokenCacheService.clearCache();
  },

  /**
   * Get token count with cache-first strategy
   * Returns cached value immediately and updates in background
   */
  async getTokensWithCache(
    updateCallback?: (count: number) => void
  ): Promise<number | null> {
    const token = this.getToken();
    return tokenCacheService.getTokensWithCache(token, updateCallback);
  },

  /**
   * Force refresh token count from backend
   */
  async refreshTokenCount(): Promise<number | null> {
    const token = this.getToken();
    if (!token) return null;
    
    try {
      const count = await tokenCacheService.refreshTokenCount(token);
      
      // Update user object with fresh token count
      const user = this.getUser();
      if (user) {
        user.tokens = count;
        this.saveUser(user);
      }
      
      return count;
    } catch (error) {
      console.error('Failed to refresh token count:', error);
      return null;
    }
  }
};
