import {Component, inject} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmailComponent } from '../../components/email/email.component';
import {DialogRef} from "@angular/cdk/dialog";

@Component({
  selector: 'app-email-config',
  standalone: true,
  imports: [CommonModule, EmailComponent, ReactiveFormsModule],
  templateUrl: './email-config.component.html',
  styleUrls: ['./email-config.component.scss']
})
export class EmailConfigComponent {
  emailForm: FormGroup;
  private dialogRef = inject(DialogRef);
  constructor(private fb: FormBuilder) {
    this.emailForm = this.fb.group({
      label: ['Email'],
      textSize: [14],
      fontColor: ['#000000'],
      fontFamily: ['Arial'],
      placeholder: ['Enter your email'],
      labelPosition: ['top'],
      labelAlignment: ['left'],
    });
  }

  save(): void {
    console.log(this.emailForm.value);
    const formData = this.emailForm.value;
    console.log('Form data saved:', formData);
    this.dialogRef.close(formData);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
