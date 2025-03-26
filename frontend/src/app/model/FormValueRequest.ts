export class FormValueRequest {
  formInputId: number;
  value: string | null;
  multipleValues: string[] | null;

  constructor(
    formInputId: number, 
    value: string | null = null, 
    multipleValues: string[] | null = null
  ) {
    this.formInputId = formInputId;
    this.value = value;
    this.multipleValues = multipleValues;
  }
}