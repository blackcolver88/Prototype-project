import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CheckboxComponent } from '../../components/checkbox/checkbox.component';
import {CommonModule} from "@angular/common";
import {DialogRef} from "@angular/cdk/dialog";

@Component({
  selector: 'app-checkbox-config',
  templateUrl: './checkbox-config.component.html',
  styleUrls: ['./checkbox-config.component.scss'],
  standalone: true,
  imports: [CheckboxComponent, ReactiveFormsModule,CommonModule]
})
export class CheckboxConfigComponent {
  checkboxForm: FormGroup;
  checkboxes: any[] = [];
  private dialogRef = inject(DialogRef);
  constructor(private fb: FormBuilder) {
    this.checkboxForm = this.fb.group({
      labelText: ['Check this box']
    });
  }

  addCheckbox(): void {
    const checkboxConfig = this.checkboxForm.value;
    this.checkboxes.push(checkboxConfig);
  }
  removeCheckbox(): void {
    if (this.checkboxes.length > 0) {
      this.checkboxes.pop();
    }
  }
  save(): void {
    const formData = this.checkboxForm.value;
    console.log('Form data saved:', formData);
    this.dialogRef.close(formData);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
