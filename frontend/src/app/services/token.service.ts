import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';
  private platformId = inject(PLATFORM_ID);

  constructor() {}

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
    }
  }

  getToken(): string | null {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(this.TOKEN_KEY);
    }
    return null;
  }

  removeToken(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
    }
  }

  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Simple check for token expiration
      const payload = JSON.parse(atob(token.split('.')[1]));
      // Check if token has expired
      return payload.exp > Date.now() / 1000;
    } catch (e) {
      return false;
    }
  }

  private decodeToken(token: string): any {
    try {
      // Decode the JWT payload
      return JSON.parse(atob(token.split('.')[1]));
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  getUserId(): number | null {
    const token = this.getToken();
    if (!token) {
      console.warn('No token available');
      return null;
    }

    try {
      const payload = this.decodeToken(token);
      console.log('Token payload:', payload); // For debugging

      // Spring Security typically places the user details in different ways
      // Try all possible paths where the ID might be stored
      const userId =
        // Direct ID
        payload?.id ||
        payload?.userId ||
        payload?.user_id ||

        // Spring Security often puts user info in 'sub' field
        payload?.sub ||

        // Or in a custom claims object
        payload?.claims?.id ||

        // Sometimes in userInfo
        payload?.userInfo?.id ||

        // Check if sub contains a number (sometimes it's just the ID as string)
        (typeof payload?.sub === 'string' && !isNaN(Number(payload?.sub)) ? Number(payload?.sub) : null) ||

        // Sometimes, it might be in other formats
        (payload?.email && payload.email.split('@')[0]) ||

        null;

      if (!userId) {
        console.warn('User ID not found in token payload. Full payload:', payload);
        // If JWT contains email but no ID, we could use email as identifier
        if (payload?.email) {
          console.log("Using email as fallback identifier", payload.email);
          // Return a placeholder ID if using email as identifier
          return 999; // Temporary solution
        }
      }

      return userId ? Number(userId) : null;
    } catch (e) {
      console.error('Error getting user ID from token:', e);
      return null;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) {
      console.warn('No token available');
      return null;
    }

    try {
      const payload = this.decodeToken(token);

      // Try to extract role from different possible locations in the token
      const role =
        payload?.role ||
        payload?.authorities?.[0] ||
        payload?.scope ||
        null;

      console.log('Extracted role from token:', role);
      return role;
    } catch (e) {
      console.error('Error getting user role from token:', e);
      return null;
    }
  }

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    return userRole === role;
  }

  isAdmin(): boolean {
    return this.hasRole('ROLE_ADMIN');
  }

  isHR(): boolean {
    return this.hasRole('ROLE_HR');
  }

  isUser(): boolean {
    return this.hasRole('ROLE_USER');
  }

  canAccessAdminRoutes(): boolean {
    return this.isAdmin() || this.isHR();
  }
}