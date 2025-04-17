import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import {FormTemplate} from "../model/FormTemplate";
import {FormLayout} from "../model/FormLayout";
import { FormInput } from '../model/FormInput';

@Injectable({
  providedIn: 'root'
})

export class FormTemplateService {

  private baseUrl = 'http://localhost:8222/api/form-templates';

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

  getFormInputsByTemplateId(templateId: number): Observable<FormInput[]> {
    return this.http.get<FormInput[]>(`${this.baseUrl}/${templateId}/form-inputs`)
      .pipe(
        map(formInputs => {
          console.log('Fetched Form Inputs:', formInputs); // Add logging
          return formInputs;
        }),
        catchError(error => {
          console.error('Error fetching form inputs:', error);
          return throwError(() => new Error('Failed to fetch form inputs'));
        })
      );
  }

  addMultipleFormInputsToTemplate(templateId: number, formInputRequests: any[]): Observable<FormInput[]> {
    return this.http.post<FormInput[]>(`${this.baseUrl}/${templateId}/bulk-form-inputs`, formInputRequests)
      .pipe(
        catchError(error => {
          console.error('Error adding multiple form inputs:', error);
          return throwError(() => error);
        })
      );
  }

  updateFormLayoutsOrder(templateId: number, sectionOrder: any[]): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${templateId}/form-layouts/order`, sectionOrder)
      .pipe(
        catchError(error => {
          console.error('Error updating form layout order:', error);
          return throwError(() => error);
        })
      );
  }

  updateFormInputsOrder(templateId: number, inputOrders: any[]): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/${templateId}/form-inputs/order`, inputOrders)
      .pipe(
        catchError(error => {
          console.error('Error updating form input order:', error);
          return throwError(() => error);
        })
      );
  }
}
