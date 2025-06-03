import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { catchError, map, Observable, throwError } from "rxjs";
import { FormSubmission } from "../model/FormSubmission";
import { FormValueRequest } from '../model/FormValueRequest';
import { PaginatedSubmissionsResponse } from '../model/PaginatedSubmissionsResponse';
import { environment } from "../../environments/environment";
import { TokenService } from "./token.service";

@Injectable({
  providedIn: 'root'
})
export class FormSubmissionService {
  private baseUrl = `${environment.apiUrl}/form-service/api/form-submissions`;
  private workflowUrl = `${environment.apiUrl}/workflow-service/api/workflow`;
  
  constructor(
    private http: HttpClient,
    private tokenService: TokenService
  ) {}

  private getUserId(): number {
    const userId = this.tokenService.getUserId();
    if (!userId) {
      console.error('No user ID found in token');
      // Redirect to login page
      window.location.href = '/login';
      throw new Error('You need to log in to access this feature');
    }
    return userId;
  }

  getAllFormSubmissions(): Observable<FormSubmission[]> {
    return this.http.get<FormSubmission[]>(`${this.baseUrl}`);
  }

  createFormSubmission(formSubmission: { title: any }): Observable<FormSubmission> {
    return this.http.post<FormSubmission>(this.baseUrl, formSubmission);
  }

  deleteFormSubmission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  submitForm(formId: number, formValues: FormValueRequest[]): Observable<FormSubmission> {
    const userId = this.getUserId();
    const payload = { formValues: formValues };
    return this.http.post<FormSubmission>(`${this.baseUrl}/${userId}/${formId}`, payload);
  }

  // Modified to support both automatic and explicit userId
  getUserFormSubmissions(userId?: number): Observable<any[]> {
    const finalUserId = userId || this.getUserId();
    return this.http.get<any[]>(`${this.baseUrl}/user/${finalUserId}`);
  }

  getFormSubmissionsByFormId(formId: number): Observable<any[]> {
    const userId = this.getUserId();
    return this.http.get<any[]>(`${this.baseUrl}/user/${userId}/form/${formId}`);
  }

  // Add this method for backward compatibility
  getFormSubmissionsByUserAndForm(userId: number, formId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/user/${userId}/form/${formId}`);
  }

  getFormTemplateBySubmissionId(submissionId: number): Observable<any> {
    const url = `${this.baseUrl}/submission/${submissionId}/template`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error('Error fetching form template by submission ID:', error);
        return throwError(() => new Error('Failed to load form template.'));
      })
    );
  }

  getFormValuesBySubmissionId(submissionId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/submission/${submissionId}/values`);
  }

  // Fix: Method should take userId as separate parameter
  updateFormSubmission(userId: number, submissionId: number, updatedValues: any[]): Observable<any> {
    console.log('Updating form submission:', { userId, submissionId, updatedValues });
    const url = `${this.baseUrl}/${userId}/${submissionId}`;
    return this.http.patch(url, { formValues: updatedValues });
  }

  getAdminFormSubmissions(page: number, limit: number): Observable<any> {
    const url = `${this.baseUrl}/paginated?page=${page}&limit=${limit}`;
    return this.http.get<PaginatedSubmissionsResponse>(url);
  }

  getFormSubmissionsByTargetRole(targetRole: string, page: number, limit: number): Observable<any> {
    const url = `${this.baseUrl}/paginated/by-target-role?targetRole=${targetRole}&page=${page}&limit=${limit}`;
    return this.http.get<PaginatedSubmissionsResponse>(url);
  }

  getFormSubmissionById(submissionId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${submissionId}`);
  }
  
  submitFormWithProcess(
    formId: number, 
    formValues: FormValueRequest[],
    processDefinitionKey: string
  ): Observable<any> {
    try {
      const userId = this.getUserId();
      const pendingRequestData = JSON.parse(localStorage.getItem('pendingRequestData') || '{}');
      const payload = { 
        formValues: formValues,
        processDefinitionKey: processDefinitionKey,
        targetRole: pendingRequestData.targetRole
      };
      return this.http.post<FormSubmission>(`${this.baseUrl}/${userId}/${formId}`, payload);
    } catch (error) {
      // Return an observable that immediately throws
      return throwError(() => error);
    }
  }

  // Workflow Service Methods
  completeTask(taskId: string, userId: number): Observable<string> {
    const url = `${this.workflowUrl}/complete-task?taskId=${taskId}&userId=${userId}`;
    return this.http.post<string>(url, {}, { responseType: 'text' as 'json' });
  }

  getTasksByRole(role: string): Observable<any[]> {
    const url = `${this.workflowUrl}/tasks-by-role?role=${role}`;
    return this.http.get<any[]>(url);
  }
}
