import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { RadioButtonComponent } from '../../components/radio-button/radio-button.component';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';

interface Option {
  label: string;
  value: string;
  checked: boolean;
}

@Component({
  selector: 'app-radio-button-config',
  templateUrl: './radio-button-config.component.html',
  styleUrls: ['./radio-button-config.component.css'],
  standalone: true,
  imports: [RadioButtonComponent, ReactiveFormsModule, CommonModule]
})
export class RadioButtonConfigComponent implements OnInit {
  radioForm: FormGroup;
  private dialogRef = inject(DialogRef);

  constructor(private fb: FormBuilder, @Inject(DIALOG_DATA) public data: any) {
    this.radioForm = this.fb.group({
      title: ['', Validators.required],
      name: [`radio_${Math.random().toString(36).substr(2, 9)}`], // Generate a unique name
      isRequired: [false],
      isDisabled: [false],
      options: this.fb.array([])
    });

    // Add default option
    this.addOption();
  }

  ngOnInit() {
    if (this.data && this.data.item && this.data.item.config) {
      this.radioForm.patchValue({
        title: this.data.item.config.title || '',
        name: this.data.item.config.name || `radio_${Math.random().toString(36).substr(2, 9)}`, // Ensure unique name
        isRequired: this.data.item.config.isRequired || false,
      });
    }
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
      type: 'RADIO_BUTTON',
      config: {
        label: formData.title,
        name: formData.name, // Ensure the name is included in the config
        options: formData.options.map((option: Option) => ({
          label: option.label,
          value: option.value,
          checked: option.checked
        }))
      },
    };
    this.dialogRef.close(configuredItem);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
