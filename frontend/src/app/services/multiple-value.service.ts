import { Injectable } from '@angular/core';
import { MultipleValue } from '../model/MultipleValue';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MultipleValueService {

  private apiUrl = 'http://localhost:8081/api/multiple-values';

  constructor(private http: HttpClient) { }


  createMultipleValue(multipleValue: {
    valeurs: string[];
    formInput: { id: number }
  }): Observable<MultipleValue> {
    return this.http.post<MultipleValue>(this.apiUrl, multipleValue);
  }

 
  getMultipleValuesByFormInputId(formInputId: number): Observable<MultipleValue[]> {
    return this.http.get<MultipleValue[]>(`${this.apiUrl}/form-input/${formInputId}`);
  }

  getAllMultipleValues(): Observable<MultipleValue[]> {
    return this.http.get<MultipleValue[]>(this.apiUrl);
  }


}
