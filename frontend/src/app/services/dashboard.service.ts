import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private baseUrl = 'http://localhost:8222/form-service/api';
  private camundaApiUrl = 'http://localhost:8222/workflow-service/engine-rest';

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

  // Count deployed processes from Camunda (latest versions only)
  countDeployedProcesses(): Observable<number> {
    return this.http.get<any[]>(`${this.camundaApiUrl}/process-definition?latestVersion=true`)
      .pipe(
        map(definitions => {
          console.log('Deployed processes found:', definitions.length);
          return definitions ? definitions.length : 0;
        }),
        catchError(error => {
          console.error('Error fetching deployed processes count:', error);
          // Return 0 as fallback when there's an error
          return of(0);
        })
      );
  }
}
