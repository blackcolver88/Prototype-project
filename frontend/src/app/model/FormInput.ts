import {FormLayout} from  './FormLayout';
import {FormInputType} from "./FormInputType";
import {FormValue} from "./FormValue";
export interface FormInput {
  id: number;
  title: string;
  type: FormInputType;
  formLayout?: FormLayout;
  option: string;
  length:number;
  required:boolean;
  formValue?: FormValue;
}

