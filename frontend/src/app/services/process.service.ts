import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface DeploymentOptions {
  deploymentName: string;
  processId: string;
  tenantId?: string;
  enableDuplicateFiltering?: boolean;
  deployChangedOnly?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  private apiUrl = 'api/process'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  // Enhanced deployment with options
  deployProcessWithOptions(xml: string, options: DeploymentOptions): Promise<any> {
    const formData = new FormData();
    const blob = new Blob([xml], { type: 'application/xml' });
    formData.append('deployment-name', options.deploymentName);
    formData.append('process', blob, `${options.processId}.bpmn`);
    
    if (options.tenantId) {
      formData.append('tenant-id', options.tenantId);
    }
    
    if (options.enableDuplicateFiltering) {
      formData.append('enable-duplicate-filtering', 'true');
    }
    
    if (options.deployChangedOnly) {
      formData.append('deploy-changed-only', 'true');
    }
    
    return this.http.post(`${this.apiUrl}/deploy`, formData).toPromise();
  }
  
  // Original deploy method
  deployProcess(xml: string, processName: string): Promise<any> {
    const formData = new FormData();
    const blob = new Blob([xml], { type: 'application/xml' });
    formData.append('deployment-name', processName);
    formData.append('process', blob, `${processName}.bpmn`);
    
    return this.http.post(`${this.apiUrl}/deploy`, formData).toPromise();
  }

  // Get all deployed processes
  getDeployedProcesses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/deployed`);
  }

  // Enhanced start process with business key and variables
  startProcess(
    processDefinitionKey: string,
    businessKey?: string,
    variables?: Record<string, any>
  ): Observable<any> {
    const payload: any = {
      processDefinitionId: processDefinitionKey
    };
    
    if (businessKey) {
      payload.businessKey = businessKey;
    }
    
    if (variables && Object.keys(variables).length > 0) {
      payload.variables = variables;
    }
    
    return this.http.post(`${this.apiUrl}/start`, payload);
  }

  // Get process instances
  getProcessInstances(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/instances`);
  }

  // Get specific instance details
  getProcessInstance(instanceId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/instances/${instanceId}`);
  }

  // Delete deployment
  deleteDeployment(deploymentId: string, cascade: boolean = false): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deployment/${deploymentId}?cascade=${cascade}`);
  }
}