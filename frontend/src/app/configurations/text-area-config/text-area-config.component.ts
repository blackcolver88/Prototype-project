import { Component, Inject, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TextAreaComponent } from '../../components/text-area/text-area.component';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";

@Component({
  selector: 'app-text-area-config',
  standalone: true,
  imports: [TextAreaComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './text-area-config.component.html',
  styleUrl: './text-area-config.component.css'
})
export class TextAreaConfigComponent implements OnInit {
  textArea: FormGroup;
  private dialogRef = inject(DialogRef);

  constructor(
    private fb: FormBuilder,
    @Inject(DIALOG_DATA) public data: any
  ) {
    this.textArea = this.fb.group({
      label: ['Text Area', Validators.required],
      placeholder: ['Enter text here'],
      isRequired: [false]
    });
  }

  ngOnInit(): void {
    if (this.data?.item?.config) {
      this.textArea.patchValue({
        label: this.data.item.config.label || 'Text Area',
        placeholder: this.data.item.config.placeholder || 'Enter text here',
        isRequired: this.data.item.config.isRequired || false
      });
    }
  }

  save(): void {
    const formData = this.textArea.value;
    const configuredItem = {
      type: 'textarea',
      title: formData.label,
      name: formData.label,
      config: {
        ...formData,
        label: formData.label,
        isRequired: formData.isRequired
      }
    };
    this.dialogRef.close(configuredItem);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}