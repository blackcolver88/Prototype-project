import {User} from "./User";
import {FormValue} from "./FormValue";
export interface FormSubmission {
  id?: number;
  date?: string;
  user?:User
  formvalues?:FormValue[];
}
