import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TokenService {
  // Implementation remains the same
  private readonly TOKEN_KEY = 'auth_token';
  
  constructor() { }
  
  saveToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }
  
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }
  
  removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
  
  isTokenValid(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } catch (e) {
      return false;
    }
  }
}