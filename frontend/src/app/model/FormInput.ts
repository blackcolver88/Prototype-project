import {FormLayout} from  './FormLayout';
import {FormInputType} from "./FormInputType";
import {FormValue} from "./FormValue";
export interface FormInput {
  id: number;
  title: string;
  priority: number;
  type: FormInputType;
  style: string;
  formLayout?: FormLayout;
  option: string;
  length:number;
  required:boolean;
  formValue?: FormValue;
}

