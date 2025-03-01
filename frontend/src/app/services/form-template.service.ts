import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import {FormTemplate} from "../model/FormTemplate";
import {FormLayout} from "../model/FormLayout";

@Injectable({
  providedIn: 'root'
})

export class FormTemplateService {

  private baseUrl = 'http://localhost:8081/api/form-templates';

  constructor(public http: HttpClient) {}

  getAllFormTemplates(): Observable<FormTemplate[]> {
    return this.http.get<FormTemplate[]>(`${this.baseUrl}`);
  }

  getFormTemplateById(id: number): Observable<FormTemplate> {
    return this.http.get<FormTemplate>(`${this.baseUrl}/${id}`);
  }

  createFormTemplate(formTemplate: { formLayouts: FormLayout[] | undefined; title: string }): Observable<FormTemplate> {
    return this.http.post<FormTemplate>(this.baseUrl, formTemplate);
  }

  updateFormTemplate(id: number, formTemplate: FormTemplate): Observable<FormTemplate> {
    return this.http.put<FormTemplate>(`${this.baseUrl}/${id}`, formTemplate);
  }

  deleteFormTemplate(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  addFormLayoutsToFormTemplate(formTemplateId: number, formLayouts: FormLayout[]): Observable<FormTemplate> {
    return this.http.post<FormTemplate>(`${this.baseUrl}/${formTemplateId}/form-layouts`, formLayouts);
  }

  getFormTemplateWithFormLayouts(formTemplateId: number): Observable<FormTemplate> {
    return this.http.get<FormTemplate>(`${this.baseUrl}/${formTemplateId}/form-layouts`);
  }

  getFormInputsByTemplateId(templateId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${templateId}/form-inputs`)
      .pipe(
        catchError(error => {
          console.error('Error fetching form inputs:', error);
          return throwError(() => error);
        })
      );
  }

  addFormInputToTemplate(templateId: number, formInput: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${templateId}/form-inputs`, formInput);
  }
}
