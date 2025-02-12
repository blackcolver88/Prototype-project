import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {FormInput} from "../model/FormInput";

@Injectable({
  providedIn: 'root'
})
export class FormInputService {

  private baseUrl = 'http://localhost:8080/api/form-layouts';

  constructor(public http: HttpClient) {}

  getAllFormInputs(): Observable<FormInput[]> {
    return this.http.get<FormInput[]>(`${this.baseUrl}`);
  }

  getFormInputById(id: number): Observable<FormInput> {
    return this.http.get<FormInput>(`${this.baseUrl}/${id}`);
  }

  createFormInput(formInput: { title: any }): Observable<FormInput> {
    return this.http.post<FormInput>(this.baseUrl, formInput);
  }

  updateFormInput(id: number, formInput: FormInput): Observable<FormInput> {
    return this.http.put<FormInput>(`${this.baseUrl}/${id}`, formInput);
  }

  deleteFormInput(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
