import { Component, Inject, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  FormArray,
  Validators,
} from '@angular/forms';
import { CheckboxComponent } from '../../components/checkbox/checkbox.component';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

interface Option {
  label: string;
  value: string;
  checked: boolean;
}

@Component({
  selector: 'app-checkbox-config',
  templateUrl: './checkbox-config.component.html',
  styleUrls: ['./checkbox-config.component.scss'],
  standalone: true,
  imports: [CheckboxComponent, ReactiveFormsModule, CommonModule],
})
export class CheckboxConfigComponent implements OnInit {
  checkboxForm: FormGroup;
  private dialogRef = inject(DialogRef);

  constructor(private fb: FormBuilder, @Inject(DIALOG_DATA) public data: any) {
    this.checkboxForm = this.fb.group({
      // groupLabel: ['Checkbox Group'],
      title: ['', Validators.required],

      name: [''],
      isRequired: [false],
      isDisabled: [false],
      options: this.fb.array([]),
    });

    // Add default option
    this.addOption();
  }
  ngOnInit() {
    if (this.data && this.data.item && this.data.item.config) {
      this.checkboxForm.patchValue({
        title: this.data.item.config.title || '',
        name: this.data.item.config.name || '',
        isRequired: this.data.item.config.isRequired || false,
      });
    }
  }

  get options() {
    return this.checkboxForm.get('options') as FormArray;
  }

  addOption() {
    const optionGroup = this.fb.group({
      label: [`Option ${this.options.length + 1}`],
      value: [`option_${this.options.length + 1}`],
      checked: [false],
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
      type: 'CHECKBOX',
      config: {
        label: formData.title,
        name: formData.name, // Ensure the name is included in the config
        isRequired: formData.isRequired,
        options: formData.options.map((option: Option) => ({
          label: option.label,
          value: option.value,
          checked: option.checked,
        })),
      },
    };
    this.dialogRef.close(configuredItem);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
