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
    });
  }
  get section(): FormArray {
    return this.sectionForm.get('sections') as FormArray;
  }
  onSave(): void {
    this.customizedSectionData = {
      type: 'section'
    };
    this.saveSection.emit(this.customizedSectionData);
    const formData = this.sectionForm.value;
    console.log('Form data saved:', formData);
    this.dialogRef.close(formData);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
