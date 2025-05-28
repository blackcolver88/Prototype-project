import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private baseUrl = 'http://localhost:8222/form-service/api';

  constructor(private http: HttpClient) {}

  countUsers(): Observable<number> {
    return this.http.get<number>(`http://localhost:8222/auth-service/api/v1/auth/users/count`);
  }

  countFormTemplates(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/form-templates/count`);
  }

  countFormSubmissions(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/form-submissions/count`);
  }

  countFormProcesses(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/form-processes/countProcess`);
  }
}
