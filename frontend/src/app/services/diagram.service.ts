import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';

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
    console.log(`API URL: ${this.camundaApiUrl}/process-definition/save-to-filesystem`);
    
    // Log the first 100 chars of XML to verify content
    console.log(`XML content (first 100 chars): ${xml.substring(0, 100)}...`);
    
    // Use a more verbose HTTP request to catch all errors
    return this.http.post(`${this.camundaApiUrl}/process-definition/save-to-filesystem`, {
      xml,
      filename
    }, {
      observe: 'response'  // Get full HTTP response
    }).pipe(
      tap(response => console.log('Save response:', response)),
      catchError(error => {
        console.error('Save error details:', error);
        if (error.error) console.error('Error response body:', error.error);
        return throwError(() => error);
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
}