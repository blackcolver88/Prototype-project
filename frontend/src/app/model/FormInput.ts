import {FormLayout} from  './FormLayout';
import {FormInputType} from "./FormInputType";
import {FormValue} from "./FormValue";
import { MultipleValue } from './MultipleValue';
// export interface FormInput {
//   id: number;
//   title: string;
//   type: FormInputType;
//   formLayout?: FormLayout;
//   option: string;
//   required:boolean;
//   formValue?: FormValue;
  
// }
export interface FormInput {
  id: number;
  title: string;
  type: string;
  required: boolean;
  ordinalPosition?: number;
  config?: string;
  option?: string;
  formLayout: {
    id: number;
    title: string;
    type: string;
    parent?: FormLayout;
    children: any[];
  };
  formValue: any;
  multipleValues?: MultipleValue[];
}
