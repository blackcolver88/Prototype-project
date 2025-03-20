import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DatepickerComponent } from '../../components/datepicker/datepicker.component';
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";

@Component({
  selector: 'app-datepicker-config',
  templateUrl: './datepicker-config.component.html',
  styleUrls: ['./datepicker-config.component.css'],
  standalone: true,
  imports: [DatepickerComponent, ReactiveFormsModule, CommonModule]
})
export class DatepickerConfigComponent implements OnInit {
  datepickerForm: FormGroup;
  private dialogRef = inject(DialogRef);

  constructor(private fb: FormBuilder, @Inject(DIALOG_DATA) public data: any) {
    this.datepickerForm = this.fb.group({
      label: ['Select a date range', Validators.required],
      isRequired: [false]
    });
  }

  ngOnInit(): void {
    if (this.data?.item?.config) {
      this.datepickerForm.patchValue({
        label: this.data.item.config.label || 'Select a date range',
        isRequired: this.data.item.config.isRequired || false
      });
    }
  }

  save(): void {
    const formData = this.datepickerForm.value;
    const configuredItem = {
      type: 'datepicker',
      title: formData.label,
      name: formData.label,
      config: {
        ...formData,
        label: formData.label,
        isRequired: formData.isRequired
      }
    };
    this.dialogRef.close(configuredItem);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}