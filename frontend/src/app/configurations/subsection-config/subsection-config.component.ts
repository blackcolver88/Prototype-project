// subsection-config.component.ts
import { Component, EventEmitter, inject, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { SubsectionComponent } from '../../components/subsection/subsection.component';

@Component({ 
  selector: 'app-subsection-config',
  standalone: true,
  imports: [CommonModule, SubsectionComponent, ReactiveFormsModule,],
  templateUrl: './subsection-config.component.html',
  styleUrls: ['./subsection-config.component.css']  
}) 
export class SubsectionConfigComponent implements OnInit {
  subsectionForm: FormGroup;
  @Output() saveSection = new EventEmitter<any>();
  private dialogRef = inject(DialogRef);

  constructor(private fb: FormBuilder, @Inject(DIALOG_DATA) public data: any) {
    this.subsectionForm = this.fb.group({
      type: ['Subsection'],
      title: ['', Validators.required],
      children: []
    });
  }

  ngOnInit() {
    if (this.data && this.data.item && this.data.item.config) {
      this.subsectionForm.patchValue({
        title: this.data.item.title || ''
      });
    }
  }

  onSave(): void {
    if (this.subsectionForm.valid) {
      const formData = this.subsectionForm.value;

      const result = {
        type: 'Subsection',
        title: formData.title,
        items: [] 
      };

      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}