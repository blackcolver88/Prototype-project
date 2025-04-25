import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface DeploymentOptions {
  deploymentName: string;
  processId?: string;
  tenantId?: string;
  enableDuplicateFiltering?: boolean;
  deployChangedOnly?: boolean;
}

export interface ProcessInstanceOptions {
  businessKey?: string;
  variables?: Record<string, VariableValue>;
}

export interface VariableValue {
  value: any;
  type?: string;
  valueInfo?: Record<string, any>;
}

// Define a proper return type for process instance
export interface ProcessInstanceResult {
  id: string;
  definitionId?: string;
  processDefinitionId?: string;
  businessKey?: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class ProcessService {
  // Change this to your actual Camunda REST API endpoint
  private apiUrl = 'http://localhost:8222/workflow-service/engine-rest';

  constructor(private http: HttpClient) {}

  // Deploy a BPMN process
  deployProcess(xml: string, options: DeploymentOptions): Observable<any> {
    const enhancedXml = this.ensureHistoryTimeToLive(xml);
    const formData = new FormData();
    
    // Add the BPMN XML as a file
    const blob = new Blob([enhancedXml], { type: 'application/bpmn+xml' });
    
    // Set required options
    formData.append('deployment-name', options.deploymentName || 'Process Deployment');
    
    // Set optional parameters only if they have values
    if (options.deployChangedOnly) {
      formData.append('deploy-changed-only', 'true');
    }
    
    if (options.enableDuplicateFiltering) {
      formData.append('enable-duplicate-filtering', 'true');
    }
    
    if (options.tenantId && options.tenantId.trim()) {
      formData.append('tenant-id', options.tenantId);
    }
    
    // Generate a filename from the process ID if available
    const fileName = options.processId ? 
      `${options.processId}.bpmn` : 
      `process_${new Date().getTime()}.bpmn`;
    
    // Important: The file parameter must be named exactly like this
    formData.append('file', blob, fileName);
    
    // Log what we're sending
    console.log('Deploying with options:', options);
    
    return this.http.post(`${this.apiUrl}/deployment/create`, formData);
  }

  testApiConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/engine`);
  }

  // Add this method to match the component call
  deployProcessWithOptions(xml: string, options: DeploymentOptions): Observable<any> {
    return this.deployProcess(xml, options);
  }

  // Get all deployed process definitions
  getDeployedProcesses(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/process-definition`)
      .pipe(
        map(definitions => {
          console.log('Raw process definitions from API:', definitions);
          // Add logging to see the structure
          return definitions.map(def => ({
            id: def.id,
            key: def.key,
            name: def.name || def.key,
            version: def.version,
            deploymentId: def.deploymentId,
            processDefinitionId: def.id
          }));
        })
      );
  }

  // Get latest versions of deployed process definitions
  getLatestProcessDefinitions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/process-definition?latestVersion=true`);
  }

  // Get deployments
  getDeployments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/deployment`);
  }

  // Start a process instance by process definition ID
  startProcess(processDefinitionId: string, businessKey?: string, variables?: Record<string, any>): Observable<ProcessInstanceResult> {
    if (!processDefinitionId || processDefinitionId === 'undefined') {
      console.error('Invalid process definition ID:', processDefinitionId);
      return throwError(() => new Error('No valid process definition ID provided'));
    }
    
    const options: any = {};
    
    if (businessKey) {
      options.businessKey = businessKey;
    }
    
    if (variables) {
      options.variables = this.formatVariables(variables);
    }
    
    console.log(`Starting process with ID ${processDefinitionId} and options:`, options);
    
    // Use direct ID in URL
    return this.http.post<ProcessInstanceResult>(
      `${this.apiUrl}/process-definition/${processDefinitionId}/start`, 
      options
    );
  }

  // Start a process instance by message
  startProcessByMessage(messageName: string, businessKey?: string, variables?: Record<string, any>): Observable<any> {
    const body: any = {
      messageName
    };
    
    if (businessKey) {
      body.businessKey = businessKey;
    }
    
    if (variables) {
      body.processVariables = this.formatVariables(variables);
    }
    
    return this.http.post(`${this.apiUrl}/message`, body);
  }

  // Get process instances
  getProcessInstances(params?: any): Observable<any[]> {
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    
    return this.http.get<any[]>(`${this.apiUrl}/process-instance`, { params: httpParams });
  }

  // Get a specific process instance
  getProcessInstance(instanceId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/process-instance/${instanceId}`);
  }

  // Get process instance variables
  getProcessInstanceVariables(instanceId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/process-instance/${instanceId}/variables`);
  }

  // Delete a deployment
  deleteDeployment(deploymentId: string, cascade: boolean = false): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/deployment/${deploymentId}?cascade=${cascade}`
    );
  }

  // Format variables for Camunda REST API
  private formatVariables(variables: Record<string, any>): Record<string, VariableValue> {
    const formatted: Record<string, VariableValue> = {};
    
    Object.keys(variables).forEach(key => {
      const value = variables[key];
      const jsType = typeof value;
      let camundaType: string;
      let formattedValue = value;
      
      // Determine the proper Camunda variable type
      if (jsType === 'number') {
        if (Number.isInteger(value)) {
          camundaType = 'Integer';
        } else {
          camundaType = 'Double';
        }
      } else if (jsType === 'boolean') {
        camundaType = 'Boolean';
      } else if (jsType === 'string') {
        camundaType = 'String';
      } else if (value instanceof Date) {
        camundaType = 'Date';
        formattedValue = value.toISOString();
      } else if (value === null || value === undefined) {
        camundaType = 'Null';
      } else if (Array.isArray(value)) {
        camundaType = 'Object';
      } else if (jsType === 'object') {
        camundaType = 'Json';
      } else {
        camundaType = 'String'; // Default fallback
      }
      
      formatted[key] = {
        value: formattedValue,
        type: camundaType
      };
    });
    
    return formatted;
  }

  // Add this method to process service
  private ensureHistoryTimeToLive(xml: string): string {
    if (xml.includes('camunda:historyTimeToLive')) {
      return xml; // Already has TTL defined
    }
    
    // Add historyTimeToLive attribute to process element if missing
    return xml.replace(
      /<bpmn:process\s+([^>]*)isExecutable="true"([^>]*)>/g,
      '<bpmn:process $1isExecutable="true"$2 camunda:historyTimeToLive="30">'
    );
  }

  // Add this to your process service
  getProcessDefinition(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/process-definition/${id}`);
  }

  // Check if a process definition exists
  checkProcessDefinitionExists(id: string): Observable<boolean> {
    return this.getProcessDefinition(id).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}