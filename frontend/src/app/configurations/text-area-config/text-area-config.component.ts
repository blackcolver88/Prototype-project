import { DialogRef } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TextAreaComponent } from '../../components/text-area/text-area.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-text-area-config',
  imports: [TextAreaComponent,CommonModule,ReactiveFormsModule],
  templateUrl: './text-area-config.component.html',
  styleUrl: './text-area-config.component.css'
})
export class TextAreaConfigComponent {
  textArea: FormGroup;
  private dialogRef = inject(DialogRef);
  constructor(private fb: FormBuilder) {
    this.textArea = this.fb.group({
      label: ['Text Area'],
    });
  }

  save(): void {
    const formData = this.textArea.value;
    
    const configuredItem = {
      ...formData,
      type: 'textarea',
      config: formData
    };
    this.dialogRef.close(configuredItem);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
