import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {FormSubmission} from "../model/FormSubmission";
import { FormValueRequest } from '../model/FormValueRequest';


@Injectable({
  providedIn: 'root'
})
export class FormSubmissionService {
 

  private baseUrl = 'http://localhost:8081/api/form-submissions';

  constructor(public http: HttpClient) {}

  getAllFormSubmissions(): Observable<FormSubmission[]> {
    return this.http.get<FormSubmission[]>(`${this.baseUrl}`);
  }

  getFormSubmissionById(id: number): Observable<FormSubmission> {
    return this.http.get<FormSubmission>(`${this.baseUrl}/${id}`);
  }

  createFormSubmission(formSubmission: { title: any }): Observable<FormSubmission> {
    return this.http.post<FormSubmission>(this.baseUrl, formSubmission);
  }

  updateFormSubmission(id: number, formSubmission:FormSubmission): Observable<FormSubmission> {
    return this.http.put<FormSubmission>(`${this.baseUrl}/${id}`, formSubmission);
  }

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
  return this.http.get<FormSubmission[]>(`${this.baseUrl}/user/${userId}/form/${formId}`);
}
  checkIfSubmissionExists(userId: number, formId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/check-submission/${userId}/${formId}`);
  }
}
