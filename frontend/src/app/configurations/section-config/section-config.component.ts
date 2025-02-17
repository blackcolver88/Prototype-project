import {Component, EventEmitter, inject, Output} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { SectionComponent } from "../../components/section/section.component";
import {DialogRef} from "@angular/cdk/dialog";

@Component({
  selector: 'app-section-config',
  standalone: true,
  imports: [CommonModule, SectionComponent, ReactiveFormsModule],
  templateUrl: './section-config.component.html',
  styleUrls: ['./section-config.component.css']
})
export class SectionConfigComponent {
  sectionForm: FormGroup;
  @Output() saveSection = new EventEmitter<any>();
  private dialogRef = inject(DialogRef);
  customizedSectionData: any;
  constructor(private fb: FormBuilder) {
    this.sectionForm = this.fb.group({
      type: ['section'],
      name: ['Section'],
      items: [[]]
  
    });
  }
  get section(): FormArray {
    return this.sectionForm.get('section') as FormArray;
  }
  onSave(): void {
    const formData = this.sectionForm.value;
    this.dialogRef.close({
      type: 'section',
      name: formData.name,
      items: [],
      config: formData
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
