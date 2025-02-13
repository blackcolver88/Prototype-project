import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {BasicDatepickerComponent} from "../../components/basic-datepicker/basic-datepicker.component";
import {CommonModule} from "@angular/common";
import {DialogRef} from "@angular/cdk/dialog";

@Component({
  selector: 'app-basicdatepicker-config',
  templateUrl: './basicdatepicker-config.component.html',
  styleUrls: ['./basicdatepicker-config.component.css'],
  standalone: true,
  imports: [BasicDatepickerComponent, ReactiveFormsModule,CommonModule]
})
export class BasicdatepickerConfigComponent {
  basicDatepickerForm: FormGroup;
  private dialogRef = inject(DialogRef);
  constructor(private fb: FormBuilder) {
    this.basicDatepickerForm = this.fb.group({
      label: ['Select a date']
    });
  }

  save(): void {
    console.log('Saved configurations:', this.basicDatepickerForm);
    const formData = this.basicDatepickerForm.value;
    console.log('Form data saved:', formData);
    this.dialogRef.close(formData);
  }

  cancel(): void {
    this.basicDatepickerForm.reset();
    this.dialogRef.close();
  }
}
