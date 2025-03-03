import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { TextformComponent } from "../../components/textform/textform.component";
import { DialogRef } from "@angular/cdk/dialog";
import {EmailComponent} from '../../components/email/email.component';
import {PhoneNumberComponent} from '../../components/phone-number/phone-number.component';
import {PasswordComponent} from '../../components/password/password.component';

@Component({
  selector: 'app-textform-config',
  standalone: true,
  imports: [CommonModule, TextformComponent,EmailComponent,PhoneNumberComponent,PasswordComponent,ReactiveFormsModule],
  templateUrl: './textform-config.component.html',
  styleUrl: './textform-config.component.scss'
})
export class TextformConfigComponent {
  textForm: FormGroup;
  private dialogRef = inject(DialogRef);

  inputTypes = [
    { value: 'text', label: 'Text' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Number' },
    { value: 'password', label: 'Password'}
  ];

  constructor(private fb: FormBuilder) {
    this.textForm = this.fb.group({
      label: ['Text Field', Validators.required],
      textName: [''], // No required validator
      type: ['text', Validators.required],
      placeholder: ['Enter Text Field here'],
      labelPosition: ['top', Validators.required],
      labelAlignment: ['left', Validators.required]
    });

    // Type changes with proper typing
    this.textForm.get('type')?.valueChanges.subscribe((type: string) => {
      const label = this.textForm.get('label')?.value;
      let placeholder: string;

      switch(type) {
        case 'email':
          placeholder = `Enter ${label} email`;
          this.textForm.get('textName')?.setValidators([Validators.email]);
          break;
        case 'number':
          placeholder = `Enter ${label} number`;
          this.textForm.get('textName')?.setValidators([Validators.pattern(/^[0-9]*$/)]);
          break;
         case 'password':
           placeholder = `Enter ${label} password`;
           this.textForm.get('textName')?.setValidators([Validators.email]);
           break;
        default:
          placeholder = `Enter ${label} here`;
          this.textForm.get('textName')?.clearValidators();
      }

      this.textForm.patchValue({
        textName: '',
        placeholder: placeholder
      });

      // Force validation update
      this.textForm.get('textName')?.updateValueAndValidity();
    });

    // Label changes with proper typing
    this.textForm.get('label')?.valueChanges.subscribe((label: string) => {
      const type = this.textForm.get('type')?.value;
      let placeholder: string;

      switch(type) {
        case 'email': placeholder = `Enter ${label} email`; break;
        case 'number': placeholder = `Enter ${label} number`; break;
        case 'password': placeholder = `Enter ${label} password`; break;
        default: placeholder = `Enter ${label} here`;
      }

      this.textForm.patchValue({ placeholder }, { emitEvent: false });
    });
  }

  save(): void {
    if (this.textForm.valid) {
      const formData = this.textForm.value;
      const configuredItem = {
        ...formData,
        type: formData.type === 'EMAIL' ? 'EMAIL' : formData.type === 'number' ? 'number' : formData.type === 'password' ? 'password' :'TEXTFIELD',
        name: formData.label,

        config: formData
      };
      this.dialogRef.close(configuredItem);
    } else {
      console.log('Form Errors:', this.textForm.errors);
      console.log('textName Errors:', this.textForm.get('textName')?.errors);
      this.textForm.markAllAsTouched();
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
