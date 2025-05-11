import {Component, EventEmitter, Inject, inject, OnInit, Output} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SectionComponent } from "../../components/section/section.component";
import {DIALOG_DATA, DialogRef} from "@angular/cdk/dialog";

@Component({
  selector: 'app-section-config',
  standalone: true,
  imports: [CommonModule, SectionComponent, ReactiveFormsModule,],
  templateUrl: './section-config.component.html',
  styleUrls: ['./section-config.component.css']
})
export class SectionConfigComponent implements OnInit {
  sectionForm: FormGroup;
  @Output() saveSection = new EventEmitter<any>();
  mode: 'add' | 'edit' = 'add'; 
  subsectionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: any
  ) {
    this.mode = data?.mode || 'add';

    this.sectionForm = this.fb.group({
      type: ['Section'],
      title: ['', Validators.required],
      children: []
    });
    if (this.mode === 'edit' && data?.item) {
      this.sectionForm.patchValue({
        title: data.item.title || '',
        children: data.item.children || [] 
      });
    }
    this.subsectionForm = this.fb.group({
      title: ['', Validators.required],
      children: this.fb.array([]) 
    });
  }

  ngOnInit(): void {
    if (this.mode === 'edit' && this.data?.item) {
      this.sectionForm.patchValue({
        title: this.data.item.title || '',
      });
    }
  }

  onSave(): void {
    if (this.sectionForm.valid) {
      const formData = this.sectionForm.value;

      this.dialogRef.close({
        type: 'Section',
        title: formData.title,
        config: {
          title: formData.title,
          children: formData.children 

        },
        items: []
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }

  get isEditMode(): boolean {
    return this.mode === 'edit';
  }
}
