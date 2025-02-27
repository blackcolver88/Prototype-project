import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray } from '@angular/forms';
import { RadioButtonComponent } from '../../components/radio-button/radio-button.component';
import { CommonModule } from '@angular/common';
import { DialogRef } from '@angular/cdk/dialog';

@Component({
  selector: 'app-radio-button-config',
  templateUrl: './radio-button-config.component.html',
  styleUrls: ['./radio-button-config.component.css'],
  standalone: true,
  imports: [RadioButtonComponent, ReactiveFormsModule, CommonModule]
})
export class RadioButtonConfigComponent {
  radioForm: FormGroup;
  private dialogRef = inject(DialogRef);

  constructor(private fb: FormBuilder) {
    this.radioForm = this.fb.group({
      groupLabel: ['Radio Group'],
      name: [''],
      isRequired: [false],
      isDisabled: [false],
      options: this.fb.array([])
    });

    // Add default option
    this.addOption();
  }

  get options() {
    return this.radioForm.get('options') as FormArray;
  }

  addOption() {
    const optionGroup = this.fb.group({
      label: [`Option ${this.options.length + 1}`],
      value: [`option_${this.options.length + 1}`]
    });
    this.options.push(optionGroup);
  }

  removeOption(index: number) {
    this.options.removeAt(index);
  }

  save(): void {
    const formData = this.radioForm.value;
    const configuredItem = {
      ...formData,
      type: 'radio-group',
      name: formData.groupLabel,
      config: formData
    };
    this.dialogRef.close(configuredItem);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
