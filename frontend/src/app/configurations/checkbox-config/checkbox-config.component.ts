import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CheckboxComponent } from '../../components/checkbox/checkbox.component';
import { CommonModule } from "@angular/common";
import { DialogRef } from "@angular/cdk/dialog";

@Component({
  selector: 'app-checkbox-config',
  templateUrl: './checkbox-config.component.html',
  styleUrls: ['./checkbox-config.component.scss'],
  standalone: true,
  imports: [CheckboxComponent, ReactiveFormsModule, CommonModule]
})
export class CheckboxConfigComponent {
  checkboxForm: FormGroup;
  private dialogRef = inject(DialogRef);

  constructor(private fb: FormBuilder) {
    this.checkboxForm = this.fb.group({
      groupLabel: ['Checkbox Group'],
      textSize: [14],
      textColor: ['#000000'],
      name: [''],
      isRequired: [false],
      isDisabled: [false],
      labelPosition: ['right'],
      checkboxSize: [16],
      checkboxColor: ['#4A90E2'],
      options: this.fb.array([])
    });

    // Add default option
    this.addOption();
  }

  get options() {
    return this.checkboxForm.get('options') as FormArray;
  }

  addOption() {
    const optionGroup = this.fb.group({
      label: [`Option ${this.options.length + 1}`],
      value: [`option_${this.options.length + 1}`],
      checked: [false]
    });
    this.options.push(optionGroup);
  }

  removeOption(index: number) {
    this.options.removeAt(index);
  }

  save(): void {
    const formData = this.checkboxForm.value;
    const configuredItem = {
      ...formData,
      type: 'checkbox-group',
      name: formData.groupLabel,
      config: formData
    };
    this.dialogRef.close(configuredItem);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
