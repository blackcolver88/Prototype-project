import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, forkJoin } from 'rxjs';
import { map, catchError, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DiagramService {
  private apiUrl = 'api/diagrams'; // Keep existing endpoint
  private camundaApiUrl = 'http://localhost:8222/workflow-service/engine-rest'; // Match ProcessService URL

  constructor(private http: HttpClient) {}

  // Existing methods


  // New methods for Camunda repository integration
  getAllProcessDefinitions(): Observable<any[]> {
    // Include all versions, not just latest
    return this.http.get<any[]>(`${this.camundaApiUrl}/process-definition`)
      .pipe(
        map(definitions => definitions.map(def => ({
          id: def.id,
          key: def.key,
          name: def.name || def.key,
          version: def.version,
          deploymentId: def.deploymentId,
          deploymentTime: this.getDeploymentTime(def.deploymentId)
        })))
      );
  }

  getProcessDefinitionXml(processDefinitionId: string): Observable<string> {
    return this.http.get<any>(`${this.camundaApiUrl}/process-definition/${processDefinitionId}/xml`)
      .pipe(
        map(response => response.bpmn20Xml)
      );
  }

  saveAsDeployment(xml: string, name: string): Observable<any> {
    const formData = new FormData();
    const blob = new Blob([xml], { type: 'application/bpmn+xml' });
    formData.append('deployment-name', name);
    formData.append('enable-duplicate-filtering', 'true');
    formData.append('file', blob, `${name}.bpmn`);
    return this.http.post(`${this.camundaApiUrl}/deployment/create`, formData);
  }

  // Add method to save process to filesystem
  saveToFilesystem(xml: string, filename: string): Observable<any> {
    console.log(`Attempting to save file: ${filename}`);
    
    // Use the simpler API endpoint
    const endpoint = 'http://localhost:8222/workflow-service/api/save-process';
    
    return this.http.post(endpoint, {
      xml,
      filename
    }).pipe(
      tap(response => {
        console.log('Save response:', response);
      }),
      catchError(error => {
        console.error('Error saving to filesystem:', error);
        let errorMsg = 'Failed to save to filesystem';
        
        if (error.error && error.error.error) {
          errorMsg = error.error.error;
        }
        
        return throwError(() => new Error(errorMsg));
      })
    );
  }

  // Get deployment time (returns an Observable that completes later)
  private getDeploymentTime(deploymentId: string): Observable<string> {
    return this.http.get<any>(`${this.camundaApiUrl}/deployment/${deploymentId}`)
      .pipe(
        map(deployment => deployment.deploymentTime),
        catchError(() => of('Unknown'))
      );
  }

  // Add this method to match the component call
  getDeployedProcesses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.camundaApiUrl}/process-definition?latestVersion=true`)
      .pipe(
        map(definitions => definitions.map(def => ({
          id: def.id,
          key: def.key,
          name: def.name || def.key,
          version: def.version,
          deploymentId: def.deploymentId,
          processDefinitionId: def.id
        })))
      );
  }

  // Get all deployed processes with more details
  getDeployedProcessesWithDetails(): Observable<any[]> {
    return this.http.get<any[]>(`${this.camundaApiUrl}/process-definition?latestVersion=true`)
      .pipe(
        switchMap(definitions => {
          if (definitions.length === 0) return of([]);
          
          // Add deployment time to each process definition
          const processesWithDetails = definitions.map(def => {
            return this.http.get<any>(`${this.camundaApiUrl}/deployment/${def.deploymentId}`).pipe(
              map(deployment => ({
                id: def.id,
                key: def.key,
                name: def.name || def.key,
                version: def.version,
                deploymentId: def.deploymentId,
                deploymentTime: deployment.deploymentTime || 'Unknown',
                suspended: def.suspended
              }))
            );
          });
          
          return forkJoin(processesWithDetails);
        })
      );
  }
}