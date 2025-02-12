import {Component, inject} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import {DialogRef} from "@angular/cdk/dialog";
import { PhoneNumberComponent } from '../../components/phone-number/phone-number.component';

@Component({
  selector: 'app-phone-number-config',
  imports: [CommonModule, PhoneNumberComponent, ReactiveFormsModule],
  templateUrl: './phone-number-config.component.html',
  styleUrl: './phone-number-config.component.css'
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

}}
