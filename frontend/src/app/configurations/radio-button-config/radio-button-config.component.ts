import {Component, inject} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RadioButtonComponent } from '../../components/radio-button/radio-button.component';
import {DialogRef} from "@angular/cdk/dialog";

@Component({
  selector: 'app-radio-button-config',
  templateUrl: './radio-button-config.component.html',
  styleUrls: ['./radio-button-config.component.css'],
  standalone: true,
  imports: [RadioButtonComponent, ReactiveFormsModule, CommonModule]
})
export class RadioButtonConfigComponent {
  radioForm: FormGroup;
  radioButtons: any[] = [];
  private dialogRef = inject(DialogRef);
  constructor(private fb: FormBuilder) {
    this.radioForm = this.fb.group({
      labelText: ['Option 1'],
      textSize: [14],
      textColor: ['#000000'],
    });
  }

  addRadioButton(): void {
    const radioConfig = this.radioForm.value;
    this.radioButtons.push(radioConfig);
  }

  removeRadioButton(): void {
    if (this.radioButtons.length > 0) {
      this.radioButtons.pop();
    }
  }

  save(): void {
    const formData = this.radioForm.value;
    const configuredItem = {
      ...formData,
      type: 'radio-button',
      name: formData.labelText,
      config: formData
    };
    console.log('Form data saved:', formData);
    this.dialogRef.close(configuredItem);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
