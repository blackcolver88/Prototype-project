import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormArray, Validators } from '@angular/forms';
import { SelectBoxComponent } from '../../components/select-box/select-box.component';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";

interface Option {
  label: string;
  value: string;
}

@Component({
  selector: 'app-select-box-config',
  templateUrl: './select-box-config.component.html',
  styleUrls: ['./select-box-config.component.css'],
  standalone: true,
  imports: [SelectBoxComponent, ReactiveFormsModule, CommonModule]
})
export class SelectBoxConfigComponent implements OnInit {
  selectBoxForm: FormGroup;
  private dialogRef = inject(DialogRef);

  constructor(private fb: FormBuilder, @Inject(DIALOG_DATA) public data: any) {
    this.selectBoxForm = this.fb.group({
      type: ['SELECT_BOX'],
      title: ['', Validators.required],
      options: this.fb.array([]),
      isRequired: [false]
    });

    // Add default option
    this.addOption();
  }

  ngOnInit() {
    if (this.data?.item?.config) {
      this.selectBoxForm.patchValue({
        title: this.data.item.config.label || '',
        isRequired: this.data.item.config.isRequired || false
      });

      // Initialize options if provided
      if (this.data.item.config.options && this.data.item.config.options.length > 0) {
        // Clear default option
        this.options.clear();
        this.data.item.config.options.forEach((option: string) => 
          this.addOption({ label: option, value: option })
        );
      }
    }
  }

  get options() {
    return this.selectBoxForm.get('options') as FormArray;
  }

  get optionLabels(): string[] {
    return this.options.value.map((option: Option) => option.label);
  }

  addOption(option: Option = { label: '', value: '' }) {
    const optionGroup = this.fb.group({
      label: [option.label],
      value: [option.value || option.label]
    });
    this.options.push(optionGroup);
  }

  removeOption(index: number) {
    this.options.removeAt(index);
  }

  save(): void {
    const formData = this.selectBoxForm.value;
    const configuredItem = {
      type: 'SELECT_BOX',
      title: formData.title,
      name: formData.title,
      config: {
        label: formData.title,
        options: formData.options.map((option: Option) => option.label),
        isRequired: formData.isRequired
      }
    };
    this.dialogRef.close(configuredItem);
  }

  cancel(): void {
    this.dialogRef.close();
  }


}
