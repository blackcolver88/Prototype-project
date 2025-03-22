import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { BasicDatepickerComponent } from '../../components/basic-datepicker/basic-datepicker.component';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-basicdatepicker-config',
  templateUrl: './basicdatepicker-config.component.html',
  styleUrls: ['./basicdatepicker-config.component.css'],
  standalone: true,
  imports: [BasicDatepickerComponent, ReactiveFormsModule, CommonModule],
})
export class BasicdatepickerConfigComponent implements OnInit {
  basicDatepickerForm: FormGroup;
  private dialogRef = inject(DialogRef);
  constructor(private fb: FormBuilder, @Inject(DIALOG_DATA) public data: any) {
    this.basicDatepickerForm = this.fb.group({
      label: ['Select a date'],
      isRequired: [false],
    });
  }
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  save(): void {
    console.log('Saved configurations:', this.basicDatepickerForm);
    const formData = this.basicDatepickerForm.value;
    console.log('Form data saved:', formData);
    const configuredItem = {
      ...formData,
      type: 'basic_datepicker',
      name: formData.label,
      isRequired: formData.isRequired,
      config: formData,
    };
    this.dialogRef.close(configuredItem);
  }

  cancel(): void {
    this.basicDatepickerForm.reset();
    this.dialogRef.close();
  }
}
