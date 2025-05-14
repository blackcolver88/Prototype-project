import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';

export interface UserProfile {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  role: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/auth-service/api/v1/auth/users`;
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private tokenService: TokenService) {
    // Try to load user profile if we have a valid token
    if (this.tokenService.isTokenValid()) {
      this.loadCurrentUser();
    }
  }

  loadCurrentUser(): void {
    const userId = this.tokenService.getUserId();
    if (!userId) return;

    this.getUserById(userId).subscribe({
      next: (user) => this.currentUserSubject.next(user),
      error: () => this.currentUserSubject.next(null)
    });
  }

  getUserById(id: number): Observable<UserProfile | null> {
    return this.http.get<UserProfile>(`${this.API_URL}/${id}`).pipe(
      tap(user => this.currentUserSubject.next(user)),
      catchError(() => {
        this.currentUserSubject.next(null);
        return of(null);
      })
    );
  }

  clearCurrentUser(): void {
    this.currentUserSubject.next(null);
  }
}