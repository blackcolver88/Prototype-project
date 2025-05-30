import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  private readonly TOKEN_KEY = 'auth_token';
  private platformId = inject(PLATFORM_ID);

  // Cache pour éviter les appels répétés aux méthodes d'extraction
  private cachedUserRole: string | null = null;
  private cachedUserId: number | null = null;
  private lastToken: string | null = null;

  constructor() {}

  saveToken(token: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
      // Réinitialiser le cache lorsqu'un nouveau token est enregistré
      this.cachedUserRole = null;
      this.cachedUserId = null;
      this.lastToken = null;
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
      // Réinitialiser le cache lorsque le token est supprimé
      this.cachedUserRole = null;
      this.cachedUserId = null;
      this.lastToken = null;
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
      console.error('Error decoding token:', e);
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
      return null;
    }

    if (token === this.lastToken && this.cachedUserId !== null) {
      return this.cachedUserId;
    }

    try {
      const payload = this.decodeToken(token);

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

      if (!userId && payload?.email) {
        // Return a placeholder ID if using email as identifier
        this.cachedUserId = 999; // Temporary solution
      } else {
        this.cachedUserId = userId ? Number(userId) : null;
      }

      this.lastToken = token;
      return this.cachedUserId;
    } catch (e) {
      console.error('Error getting user ID from token:', e);
      return null;
    }
  }

  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    if (token === this.lastToken && this.cachedUserRole !== null) {
      return this.cachedUserRole;
    }

    try {
      const payload = this.decodeToken(token);
      console.log('Token payload for role extraction:', payload);

      // Try to extract role from different possible locations in the token
      this.cachedUserRole =
        payload?.role ||
        payload?.authorities?.[0] ||
        payload?.scope ||
        null;
      
      console.log('Extracted role from token (normalized):', this.cachedUserRole);
      
      this.lastToken = token;
      return this.cachedUserRole;
    } catch (e) {
      console.error('Error getting user role from token:', e);
      return null;
    }
  }

  hasRole(role: string): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    
    return userRole.toUpperCase() === role.toUpperCase();
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

  isManager(): boolean {
    return this.hasRole('ROLE_MANAGER');
  }

  canAccessAdminRoutes(): boolean {
    return this.isAdmin() || this.isHR() || this.isManager();
  }
}