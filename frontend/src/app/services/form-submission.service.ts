import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {catchError, map, Observable, throwError} from "rxjs";
import {FormSubmission} from "../model/FormSubmission";
import { FormValueRequest } from '../model/FormValueRequest';
import { PaginatedSubmissionsResponse } from '../model/PaginatedSubmissionsResponse';


@Injectable({
  providedIn: 'root'
})
export class FormSubmissionService {
 

  private baseUrl = 'http://localhost:8222/form-service/api/form-submissions';

  constructor(public http: HttpClient) {}

  getAllFormSubmissions(): Observable<FormSubmission[]> {
    return this.http.get<FormSubmission[]>(`${this.baseUrl}`);
  }



  createFormSubmission(formSubmission: { title: any }): Observable<FormSubmission> {
    return this.http.post<FormSubmission>(this.baseUrl, formSubmission);
  }

  // updateFormSubmission(id: number, formSubmission:FormSubmission): Observable<FormSubmission> {
  //   return this.http.put<FormSubmission>(`${this.baseUrl}/${id}`, formSubmission);
  // }

  deleteFormSubmission(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
   getUserFormSubmissions(userId: number): Observable<FormSubmission[]> {
    return this.http.get<FormSubmission[]>(`${this.baseUrl}/user/${userId}`);
    
  }

  submitForm(userId: number, formId: number, formValues: FormValueRequest[]): Observable<FormSubmission> {
    const payload = { formValues: formValues };
    return this.http.post<FormSubmission>(`${this.baseUrl}/${userId}/${formId}`, payload);
}
getFormSubmissionsByUserAndForm(userId: number, formId: number): Observable<FormSubmission[]> {
  const url = `${this.baseUrl}/user/${userId}/form/${formId}`;
  return this.http.get<FormSubmission[]>(url);
}
  checkIfSubmissionExists(userId: number, formId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/check-submission/${userId}/${formId}`);
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
    const url = `${this.baseUrl}/submission/${submissionId}/values`;
    return this.http.get<any>(url).pipe(
      map(response => {
        // If the response is an object, convert to array or extract form values
        if (response && !Array.isArray(response)) {
          // If there's a formInputs array in the response, use that
          if (response.formInputs && Array.isArray(response.formInputs)) {
            return response.formInputs;
          }
          return [response];
        }
        return response;
      }),
      catchError((error) => {
        console.error('Error fetching form values by submission ID:', error);
        return throwError(() => new Error('Failed to load form values.'));
      })
    );
  }

  updateFormSubmission(userId: number, submissionId: number, updatedValues: any[]): Observable<any> {
    console.log('Updating form submission:', { userId, submissionId, updatedValues });
    const url = `${this.baseUrl}/${userId}/${submissionId}`;
    return this.http.patch(url, { formValues: updatedValues });
  }



  getAdminFormSubmissions(page: number, limit: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/paginated`, {
      params: {
        page: page.toString(),
        limit: limit.toString()
      }
    });
  }

  getFormSubmissionById(submissionId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${submissionId}`);
  }
  
  submitFormWithProcess(
    userId: number, 
    formId: number, 
    formValues: FormValueRequest[],
    processDefinitionKey: string
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/${userId}/${formId}`, {
      formValues: formValues,
      processDefinitionKey: processDefinitionKey
    });
  }
}
