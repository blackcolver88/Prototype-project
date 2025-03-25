import {FormInput} from "./FormInput";
import {FormSubmission} from "./FormSubmission";

export interface FormValue {
  id?: number;
  title: string;
  value?: string;
  formInputs?: FormInput[];
  formSubmission?: FormSubmission;
}
