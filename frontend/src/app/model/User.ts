import {FormSubmission} from "./FormSubmission";

export interface User {
  id?: number;
  task?: string;
  formSubmissions?:FormSubmission[];
}
