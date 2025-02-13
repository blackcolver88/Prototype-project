import {Component, inject} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatepickerComponent } from '../../components/datepicker/datepicker.component';
import {DialogRef} from "@angular/cdk/dialog";

@Component({
  selector: 'app-datepicker-config',
  templateUrl: './datepicker-config.component.html',
  styleUrls: ['./datepicker-config.component.css'],
  standalone: true,
  imports: [DatepickerComponent, ReactiveFormsModule, CommonModule]
})
export class DatepickerConfigComponent {
  datepickerForm: FormGroup;
  private dialogRef = inject(DialogRef);
  constructor(private fb: FormBuilder) {
    this.datepickerForm = this.fb.group({
      label: ['Select a date range'],
    });
  }

  save(): void {
    const formData = this.datepickerForm.value;
    console.log('Form data saved:', formData);
    this.dialogRef.close(formData);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
