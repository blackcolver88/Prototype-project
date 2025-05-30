import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpEventType, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';

export interface UserProfile {
  id: number;
  email: string;
  firstname: string;
  lastname: string;
  role: {
    id: number;
    name: string;
  };  password?: string; 
  photo?: string;

}


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly API_URL = `${environment.apiUrl}/auth-service/api/v1/auth/users`;
  private readonly API = `${environment.apiUrl}/auth-service/api/v1/auth`;
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
  getAllUsers(): Observable<UserProfile[]> {
    return this.http.get<UserProfile[]>(this.API_URL).pipe(
      map(users => 
        users.filter(user => user.role?.name !== 'ROLE_ADMIN') 
      ),
      catchError(err => {
        console.error('Erreur lors de la récupération des utilisateurs.', err);
        return of([]); 
      })
    );
  }
  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${userId}`);
  }
  updateUser(id: number, user: Partial<UserProfile>): Observable<UserProfile> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.tokenService.getToken()}`
    });
  
    return this.http.put<UserProfile>(`${this.API}/modifier/${id}`, user, { headers });
  }
  ModifierPhoto(id: any, file: any): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.tokenService.getToken()}`
    });
    
    return this.http.put(`${this.API}/ModifierPhoto/${id}`, file, { headers }).pipe(
      tap(response => {
        console.log('Photo modification response:', response);
        this.loadCurrentUser();
      }),
      catchError(error => {
        console.error('Erreur lors de la modification de la photo:', error);
        throw error;
      })
    );
  }
getPhoto(userId: number): Observable<string | null> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${this.tokenService.getToken()}`
  });

  return this.http.get<{photo: string}>(`${this.API}/GetPhoto/${userId}`, { headers }).pipe(
    map(response => response.photo),
    catchError(error => {
      console.error('Erreur lors de la récupération de la photo:', error);
      return of(null);
    })
  );
}

loadCurrentUserWithPhoto(): void {
  const userId = this.tokenService.getUserId();
  if (!userId) return;

  this.getUserById(userId).subscribe({
    next: (user) => {
      if (user) {
        // Récupérer la photo séparément
        this.getPhoto(userId).subscribe({
          next: (photoBase64) => {
            if (photoBase64) {
              user.photo = photoBase64;
            }
            this.currentUserSubject.next(user);
          },
          error: () => {
            this.currentUserSubject.next(user);
          }
        });
      }
    },
    error: () => this.currentUserSubject.next(null)
  });
}


}
