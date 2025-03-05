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
  private dialogRef = inject(DialogRef);
  
  constructor(private fb: FormBuilder, @Inject(DIALOG_DATA) public data: any) {
    this.sectionForm = this.fb.group({
      type: ['Section'],
      title: ['', Validators.required],
      children: []
    });
  }

  ngOnInit() {
    if (this.data && this.data.item && this.data.item.config) {
      this.sectionForm.patchValue({
        title: this.data.item.title || '',
        children: this.data.item.items || []
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
          title: formData.title
        },
        items: []
      });
    }
  }

  cancel(): void {
    this.dialogRef.close();
  }
}