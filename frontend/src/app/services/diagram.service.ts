import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DiagramService {
  private apiUrl = 'api/diagrams'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  // Save diagram to backend
  saveDiagram(xml: string): Promise<any> {
    return this.http.post(this.apiUrl, { xml }).toPromise();
  }

  // Load diagram from backend
  loadDiagram(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  // Get list of available diagrams
  getDiagrams(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  // Delete a diagram
  deleteDiagram(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}