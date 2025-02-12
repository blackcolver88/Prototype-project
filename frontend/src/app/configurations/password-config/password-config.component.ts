import {Component, inject} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { PasswordComponent } from '../../components/password/password.component';
import { CommonModule } from '@angular/common';
import {DialogRef} from "@angular/cdk/dialog";

@Component({
  selector: 'app-password-config',
  templateUrl: './password-config.component.html',
  styleUrls: ['./password-config.component.scss'],
  standalone: true,
  imports: [PasswordComponent, ReactiveFormsModule, CommonModule],
})
export class PasswordConfigComponent {
  passwordForm: FormGroup;
  passwordFields: any[] = [];
  private dialogRef = inject(DialogRef);
  constructor(private fb: FormBuilder) {
    this.passwordForm = this.fb.group({});
  }

  addPasswordField(): void {
    this.passwordFields.push({});
  }

  removePasswordField(): void {
    if (this.passwordFields.length > 0) {
      this.passwordFields.pop();
    }
  }

  save(): void {
    const formData = this.passwordForm.value;
    console.log('Form data saved:', formData);
    this.dialogRef.close(formData);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
