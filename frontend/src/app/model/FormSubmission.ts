import {User} from "./User";
import {FormValue} from "./FormValue";
export interface FormSubmission {
  templateId: number | null;
  id?: number;
  date?: string;
  user?:User
  formValues?: FormValue[];
}
