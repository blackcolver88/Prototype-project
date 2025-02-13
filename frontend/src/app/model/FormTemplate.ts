import {FormLayout} from "./FormLayout";

export interface FormTemplate {
  id?: number;
  title?: string;
  formLayouts?:FormLayout[];
  icon?:string;
  icon2?:string;
}

