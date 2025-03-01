import {FormLayoutType} from  './FormLayoutType';
import {FormTemplate} from './FormTemplate'
import {FormInput} from "./FormInput";
export interface FormLayout {
  id: number;
  title: string;
  type?: FormLayoutType;
  parent?: FormLayout;
  children?: FormLayout[];
  formTemplate?: FormTemplate;
  formInputs?:FormInput[]
}

