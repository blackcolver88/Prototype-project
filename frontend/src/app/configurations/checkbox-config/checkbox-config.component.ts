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
  styleUrls: ['./checkbox-config.component.css'],
  standalone: true,
  imports: [CheckboxComponent, ReactiveFormsModule, CommonModule],
})
export class CheckboxConfigComponent implements OnInit {
  checkboxForm: FormGroup;
  private dialogRef = inject(DialogRef);

  constructor(private fb: FormBuilder, @Inject(DIALOG_DATA) public data: any) {
    this.checkboxForm = this.fb.group({
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
    this.checkboxForm = this.fb.group({
      title: ['', Validators.required],
      name: [''],
      isRequired: [false],
      isDisabled: [false],
      options: this.fb.array([]), // Ensure options are initialized here
    });
  
    if (this.data && this.data.item && this.data.item.config) {
      this.checkboxForm.patchValue({
        title: this.data.item.config.title || '',
        name: this.data.item.config.name || '',
        isRequired: this.data.item.config.isRequired || false,
      });
  
      // Initialize options if provided
      if (this.data.item.config.options) {
        this.data.item.config.options.forEach((option: Option) => this.addOption(option));
      }
    }
  }

  get options() {
    return this.checkboxForm.get('options') as FormArray;
  }

  // Getter for selected options
  get selectedOptions() {
    return this.checkboxForm.get('options')?.value.filter((option: Option) => option.checked);
  }

  addOption(option: Option = { label: '', value: '', checked: false }) {
    const optionGroup = this.fb.group({
      label: [option.label],
      value: [option.value],
      checked: [option.checked],
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
        name: formData.name,
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
