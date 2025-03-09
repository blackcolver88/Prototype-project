import {Component, Inject, inject, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SelectBoxComponent } from '../../components/select-box/select-box.component';
import { CommonModule } from '@angular/common';
import {DIALOG_DATA, DialogRef} from "@angular/cdk/dialog";

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
  constructor(private fb: FormBuilder ,  @Inject(DIALOG_DATA) public data: any) {
    this.selectBoxForm = this.fb.group({
      type: ['SELECT_BOX'],
      title: ['', Validators.required],
      // labelText: ['Select an option'],
      options: ['']
    });
  }
  ngOnInit() {
    if (this.data && this.data.item && this.data.item.config) {
      this.selectBoxForm.patchValue({
        title: this.data.item.config.title || '',
        options: this.data.item.config.options.join(', ')});
    }
  }
  save(): void {
    const formData = this.selectBoxForm.value;
    const configuredItem = {
      ...formData,
      type: 'SELECT_BOX', 
      config: {
        
        label: formData.title,
        options: this.getOptionsArray(formData.options),

      },
        };
    console.log('Form data saved:', formData);
    this.dialogRef.close(configuredItem);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  getOptionsArray(optionsString: string): string[] {
    return optionsString.split(',').map(option => option.trim()).filter(option => option.length > 0);
  }
}
