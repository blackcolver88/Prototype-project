import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, map } from 'rxjs';
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
  
  login(credentials: { email: string, password: string }): Observable<any> {
    return this.http.post<any>(`${this.API_URL}/authenticate`, credentials)
      .pipe(
        tap(response => {
          if (response && response.token) {
            // Save token
            this.tokenService.saveToken(response.token);
            
            // Validate we can get the user ID
            const userId = this.tokenService.getUserId();
            if (!userId) {
              console.warn('Token saved but user ID could not be extracted');
            } else {
              console.log('Authentication successful for user ID:', userId);
            }
            
            this.isAuthenticatedSubject.next(true);
          }
        }),
        catchError(error => {
          this.isAuthenticatedSubject.next(false);
          return throwError(() => error);
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
  
  adminRegister(request: RegisterRequest): Observable<AuthResponse> {
    console.log('Sending registration request with role:', request.role);
    return this.http.post<AuthResponse>(`${this.API_URL}/register`, request);
  }

  checkAuthStatus(): void {
    const token = this.tokenService.getToken();
    if (token && this.tokenService.isTokenValid()) {
      this.isAuthenticatedSubject.next(true);
    } else {
      this.isAuthenticatedSubject.next(false);
      if (token) {
        this.tokenService.removeToken();
      }
    }
  }

 

  getAvailableRoles(): Observable<string[]> {
    return this.http.get<{ name: string }[]>(`${this.API_URL}/roles`)
      .pipe(
        map((roles: { name: string }[]) => roles.map(r => r.name))
      );
  }


  getUserById(id: number): Observable<any> {
    return this.http.get<any>(`${this.API_URL}/users/${id}`);
  }

 
  getAllUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/users`);
  }
}