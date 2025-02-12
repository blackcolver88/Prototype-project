import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {FormLayout} from "../model/FormLayout";

@Injectable({
  providedIn: 'root'
})
export class FormLayoutService {

  private baseUrl = 'http://localhost:8080/api/form-layouts';

  constructor(public http: HttpClient) {}

  getAllFormLayouts(): Observable<FormLayout[]> {
    return this.http.get<FormLayout[]>(`${this.baseUrl}`);
  }

  getFormLayoutById(id: number): Observable<FormLayout> {
    return this.http.get<FormLayout>(`${this.baseUrl}/${id}`);
  }

  createFormLayout(formLayout: { title: any }): Observable<FormLayout> {
    return this.http.post<FormLayout>(this.baseUrl, formLayout);
  }

  updateFormLayout(id: number, formLayout: FormLayout): Observable<FormLayout> {
    return this.http.put<FormLayout>(`${this.baseUrl}/${id}`, formLayout);
  }

  deleteFormLayout(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
