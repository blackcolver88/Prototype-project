import {Component, inject} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {DialogRef} from "@angular/cdk/dialog";
import { SelectBoxComponent } from '../../components/select-box/select-box.component';

@Component({
  selector: 'app-select-box-config',
  imports: [SelectBoxComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './select-box-config.component.html',
  styleUrl: './select-box-config.component.css'
})
export class SelectBoxConfigComponent {
  selectBoxForm: FormGroup;
  selectBoxes: any[] = [];
  private dialogRef = inject(DialogRef);
  constructor(private fb: FormBuilder) {
    this.selectBoxForm = this.fb.group({
      labelText: ['Select an option'],
      options: ['']
    });
  }

  addSelectBox(): void {
    const selectBoxConfig = this.selectBoxForm.value;
    this.selectBoxes.push(selectBoxConfig);
  }

  removeSelectBox(): void {
    if (this.selectBoxes.length > 0) {
      this.selectBoxes.pop();
    }
  }

  save(): void {
    const formData = this.selectBoxForm.value;
    console.log('Form data saved:', formData);
    this.dialogRef.close(formData);
  }

  cancel(): void {
    this.dialogRef.close();
  }

  getOptionsArray(optionsString: string): string[] {
    return optionsString.split(',').map(option => option.trim()).filter(option => option.length > 0);
  }

}
