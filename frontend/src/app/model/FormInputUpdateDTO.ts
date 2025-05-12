import { FormInput } from "./FormInput";
import { MultipleValue } from "./MultipleValue";

export interface FormInputUpdateDTO extends FormInput {
    multipleValues?: MultipleValue[];
}