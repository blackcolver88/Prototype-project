import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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

}
