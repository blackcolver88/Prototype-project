import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {FormSubmission} from "../model/FormSubmission";


@Injectable({
  providedIn: 'root'
})
export class FormSubmissionService {

  private baseUrl = 'http://localhost:8080/api/form-layouts';

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
}
