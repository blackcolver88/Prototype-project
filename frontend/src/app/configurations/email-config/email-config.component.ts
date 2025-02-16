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
  styleUrls: ['./email-config.component.css']
})
export class EmailConfigComponent {
  emailForm: FormGroup;
  private dialogRef = inject(DialogRef);
  
  constructor(private fb: FormBuilder) {
    this.emailForm = this.fb.group({
      label: ['Email'],
      textSize: [14],
      type: ['email'],
      fontColor: ['#000000'],
      fontFamily: ['Arial'],
      placeholder: ['Enter email here'],
      labelPosition: ['top'],
      labelAlignment: ['left'],
    });

    // Subscribe to label changes
    this.emailForm.get('label')?.valueChanges.subscribe(label => {
      this.emailForm.patchValue({
        placeholder: `Enter ${label.toLowerCase()} here`
      }, { emitEvent: false });
    });
  }

  save(): void {
    const formData = this.emailForm.value;
    const configuredItem = {
      ...formData,
      type: 'email',
      name: formData.label,
      config: formData
    };
    this.dialogRef.close(configuredItem);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
