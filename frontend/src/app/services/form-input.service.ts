import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {FormInput} from "../model/FormInput";
import {MultipleValue} from "../model/MultipleValue";

@Injectable({
  providedIn: 'root'
})
export class FormInputService {

  private baseUrl = 'http://localhost:8222/form-service/api/form-inputs';

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
    const formInputUpdateDTO: any = {
      title: formInput.title,
      type: formInput.type,
      required: formInput.required,
      ordinalPosition: formInput.ordinalPosition,
      formLayoutId: formInput.formLayout?.id,
      formValueId: formInput.formValue?.id,
      multipleValues: [],
      config: formInput.config
    };
  
    if (formInput.type === 'SELECT_BOX' || formInput.type === 'RADIO_BUTTON' || formInput.type === 'CHECKBOX') {
      const uniqueValues = new Set<string>();
      
      try {
        if (formInput.multipleValues && Array.isArray(formInput.multipleValues)) {
          formInput.multipleValues.forEach(mv => {
            if (mv.valeurs && Array.isArray(mv.valeurs)) {
              mv.valeurs.forEach(val => {
                try {
                  if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
                    const parsed = JSON.parse(val);
                    uniqueValues.add(parsed.label || parsed.value || val);
                  } else {
                    uniqueValues.add(val);
                  }
                } catch (e) {
                  uniqueValues.add(val);
                }
              });
            }
          });
        }
        
        let config: any = {};
        if (formInput.config) {
          config = typeof formInput.config === 'string' 
            ? JSON.parse(formInput.config) 
            : formInput.config;
            
          if (config.options && Array.isArray(config.options)) {
            config.options.forEach((opt: any) => {
              if (typeof opt === 'string') {
                uniqueValues.add(opt);
              } else if (typeof opt === 'object') {
                uniqueValues.add(opt.label || opt.value || '');
              }
            });
          }
        }
        
        formInputUpdateDTO.multipleValues = Array.from(uniqueValues)
          .filter(val => val.trim() !== '');
          
        console.log('MultipleValues uniques à envoyer:', formInputUpdateDTO.multipleValues);
      } catch (error) {
        console.error('Erreur lors du traitement des valeurs multiples:', error);
      }
    }
  
    return this.http.put<FormInput>(`${this.baseUrl}/${id}`, formInputUpdateDTO);
  }


  deleteFormInput(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}