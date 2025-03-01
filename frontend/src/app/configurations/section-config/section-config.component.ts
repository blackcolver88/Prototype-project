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

  formTitle!: string;

  constructor(private fb: FormBuilder) {
    this.sectionForm = this.fb.group({
      type: ['SECTION'],
      title: '',
      children: [[]]
    });
  }


  onSave(): void {
    const formData = this.sectionForm.value;
    this.formTitle = formData.title; 

    this.dialogRef.close({
      type: 'SECTION',
      title: formData.title,
      children: formData.children,
      parent: formData.parent
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}