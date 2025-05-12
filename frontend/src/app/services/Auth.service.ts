import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse } from '../model/AuthResponse';
import { LoginRequest } from '../model/LoginRequest';
import { RegisterRequest } from '../model/RegisterRequest';
import { TokenService } from './token.service';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = `${environment.apiUrl}/auth-service/api/v1/auth`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  private platformId = inject(PLATFORM_ID);
  
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  
  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {
    // Only check authentication status in browser environment
    if (isPlatformBrowser(this.platformId)) {
      this.isAuthenticatedSubject.next(this.tokenService.isTokenValid());
    }
  }
  
  // Rest of the service remains the same...
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/authenticate`, request)
      .pipe(
        tap(response => {
          this.tokenService.saveToken(response.token);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }
  
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request)
      .pipe(
        tap(response => {
          this.tokenService.saveToken(response.token);
          this.isAuthenticatedSubject.next(true);
        })
      );
  }
  
  logout(): void {
    this.tokenService.removeToken();
    this.isAuthenticatedSubject.next(false);
  }
  
  validateToken(token: string): Observable<any> {
    return this.http.get(`${this.API_URL}/validate?token=${token}`);
  }
  
  checkAuthStatus(): void {
    const isAuthenticated = this.tokenService.isTokenValid();
    this.isAuthenticatedSubject.next(isAuthenticated);
  }
}