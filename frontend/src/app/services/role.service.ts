import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { RoleDTO } from '../model/RoleDTO';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  private readonly API_URL = `${environment.apiUrl}/auth-service/api/roles`;

  constructor(private http: HttpClient) {}

 
  getAvailableRoles(): Observable<string[]> {
    return this.http.get<RoleDTO[]>(this.API_URL).pipe(
      map(roles => roles.map(role => role.name)),
      catchError(error => {
        console.error('Erreur lors de la récupération des rôles', error);
        return of([]); 
      })
    );
  }


  getRoleByName(name: string): Observable<RoleDTO | null> {
    return this.http.get<RoleDTO>(`${this.API_URL}/name/${name}`).pipe(
      catchError(() => of(null))
    );
  }

  
  createRole(roleName: string): Observable<RoleDTO> {
    return this.http.post<RoleDTO>(this.API_URL, { name: roleName });
  }


  updateRole(id: number, roleName: string): Observable<RoleDTO> {
    return this.http.put<RoleDTO>(`${this.API_URL}/${id}`, { name: roleName });
  }


  deleteRole(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API_URL}/${id}`);
  }
}
