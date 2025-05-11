import { Component, EventEmitter, inject, Inject, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { SubsectionComponent } from '../../components/subsection/subsection.component';

@Component({
  selector: 'app-subsection-config',
  standalone: true,
  imports: [CommonModule, SubsectionComponent, ReactiveFormsModule],
  templateUrl: './subsection-config.component.html',
  styleUrls: ['./subsection-config.component.css']
})
export class SubsectionConfigComponent implements OnInit {
  subsectionForm!: FormGroup;
  mode: 'add' | 'edit' = 'add';
  originalChildren: any[] = [];

  @Output() saveSection = new EventEmitter<any>();
  private dialogRef = inject(DialogRef);

  constructor(
    private fb: FormBuilder,
    @Inject(DIALOG_DATA) public data: any
  ) {
    this.mode = data?.mode || 'add';

    this.subsectionForm = this.fb.group({
      type: ['Subsection'],
      title: ['', Validators.required],
      children: this.fb.array([])
    });

    if (this.mode === 'edit' && data?.item) {
      this.originalChildren = data.item.config?.children || [];
      
      this.subsectionForm.patchValue({
        title: data.item.title || '',
      });

      const children = data.item.config?.children || [];
      const childrenFormArray = this.childrenArray;

      children.forEach((child: { type: any; label: any; placeholder: any; required: any; options: any; }) => {
        childrenFormArray.push(this.fb.group({
          type: child.type,
          label: child.label,
          placeholder: child.placeholder,
          required: child.required,
          options: this.fb.array(child.options || [])
        }));
      });
    }
  }

  get childrenArray(): FormArray {
    return this.subsectionForm.get('children') as FormArray;
  }

  ngOnInit(): void {}

  onSave(): void {
    if (this.subsectionForm.valid) {
      const formData = this.subsectionForm.value;
      
      const childrenToUse = this.childrenArray.length === 0 && this.mode === 'edit' 
                          ? this.originalChildren 
                          : formData.children;

      const result = {
        type: 'Subsection',
        title: formData.title,
        config: {
          title: formData.title,
          children: childrenToUse 
        },
        items: []
      };

      if (this.mode === 'edit' && this.data?.item?.items) {
        result.items = this.data.item.items;
      }

      this.dialogRef.close(result);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }
}