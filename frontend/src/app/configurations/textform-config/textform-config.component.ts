import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { TextformComponent } from "../../components/textform/textform.component";
import { DialogRef } from "@angular/cdk/dialog";

@Component({
  selector: 'app-textform-config',
  standalone: true,
  imports: [CommonModule, TextformComponent, ReactiveFormsModule],
  templateUrl: './textform-config.component.html',
  styleUrl: './textform-config.component.scss'
})
export class TextformConfigComponent {
  textForm: FormGroup;
  private dialogRef = inject(DialogRef);
  
  // Define input types
  inputTypes = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' }
  ];

  constructor(private fb: FormBuilder) {
    this.textForm = this.fb.group({
      label: ['Text Field', Validators.required],
      textName: [''],
      type: ['text', Validators.required],
      textSize: [14, [Validators.required, Validators.min(8), Validators.max(72)]],
      placeholder: ['Enter Text Field here'],
      fontColor: ['#000000', Validators.required],
      fontFamily: ['Helvetica', Validators.required],
      labelPosition: ['top', Validators.required],
      labelAlignment: ['left', Validators.required]
    });

    // Subscribe to type changes
    this.textForm.get('type')?.valueChanges.subscribe(type => {
      const label = this.textForm.get('label')?.value;
      let placeholder: string;
      
      switch(type) {
        case 'email':
          placeholder = `Enter ${label} email`;
          this.textForm.get('textName')?.setValidators([Validators.required, Validators.email]);
          break;
        case 'number':
          placeholder = `Enter ${label} number`;
          this.textForm.get('textName')?.setValidators([Validators.required, Validators.pattern(/^[0-9]*$/)]);
          break;
        default:
          placeholder = `Enter ${label} here`;
          this.textForm.get('textName')?.setValidators(Validators.required);
      }
      
      this.textForm.patchValue({
        textName: '',
        placeholder: placeholder
      });
      this.textForm.get('textName')?.updateValueAndValidity();
    });

    // Subscribe to label changes
    this.textForm.get('label')?.valueChanges.subscribe(label => {
      const type = this.textForm.get('type')?.value;
      let placeholder: string;
      
      switch(type) {
        case 'email':
          placeholder = `Enter ${label} email`;
          break;
        case 'number':
          placeholder = `Enter ${label} number`;
          break;
        default:
          placeholder = `Enter ${label} here`;
      }
      
      this.textForm.patchValue({
        placeholder: placeholder
      }, { emitEvent: false });
    });
  }

  save(): void {
    if (this.textForm.valid) {
      const formData = this.textForm.value;
      const configuredItem = {
        ...formData,
        type: 'textfield',
        name: formData.label,
        config: formData
      };
      console.log('Form data saved:', configuredItem);
      this.dialogRef.close(configuredItem);
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}