import {FormInput} from "./FormInput";
import {FormSubmission} from "./FormSubmission";

export interface FormValue {
  id?: number;
  value?: string;
  formInputs?: FormInput[];
  formSubmission?: FormSubmission;
}
