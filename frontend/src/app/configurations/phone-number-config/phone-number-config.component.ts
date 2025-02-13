import {Component, inject} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { PhoneNumberComponent } from "../../components/phone-number/phone-number.component";
import {DialogRef} from "@angular/cdk/dialog";

@Component({
  selector: 'app-phone-number-config',
  standalone: true,
  imports: [CommonModule, PhoneNumberComponent, ReactiveFormsModule],
  templateUrl: './phone-number-config.component.html',
  styleUrls: ['./phone-number-config.component.css']
})
export class PhoneNumberConfigComponent {
  phoneNumberForm: FormGroup;
  private dialogRef = inject(DialogRef);
  constructor(private fb: FormBuilder) {
    this.phoneNumberForm = this.fb.group({
      label: ['Phone Number'],
      textSize: [14],
      fontColor: ['#000000'],
      fontFamily: ['Arial'],
      labelPosition: ['top']
    });
  }

  save(): void {
    console.log(this.phoneNumberForm.value);
    const formData = this.phoneNumberForm.value;
    console.log('Form data saved:', formData);
    this.dialogRef.close(formData);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
