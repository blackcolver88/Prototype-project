export class FormValueRequest {
    formInputId: number;
    value?: string;
    multipleValues?: string[];
  
    constructor(formInputId: number, value?: string, multipleValues?: string[]) {
      this.formInputId = formInputId;
      this.value = value;
      this.multipleValues = multipleValues;
    }
  }