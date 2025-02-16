import {Component, inject} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SelectBoxComponent } from '../../components/select-box/select-box.component';
import { CommonModule } from '@angular/common';
import {DialogRef} from "@angular/cdk/dialog";

@Component({
  selector: 'app-select-box-config',
  templateUrl: './select-box-config.component.html',
  styleUrls: ['./select-box-config.component.css'],
  standalone: true,
  imports: [SelectBoxComponent, ReactiveFormsModule, CommonModule]
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
    const configuredItem = {
      ...formData,
      type: 'selectbox',
      name: formData.labelText,
      config: formData
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
