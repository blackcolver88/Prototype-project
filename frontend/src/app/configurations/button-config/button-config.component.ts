import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DialogRef } from '@angular/cdk/dialog';
import { ButtonComponent } from "../../components/button/button.component";

@Component({
  selector: 'app-button-config',
  templateUrl: './button-config.component.html',
  styleUrls: ['./button-config.component.css'],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonComponent]
})
export class ButtonConfigComponent {

  buttonForm!: FormGroup;
  private dialogRef = inject(DialogRef);

  buttonLabel: string = 'Button';
  buttonType: 'submit' | 'reset' = 'submit';

  @Output() configChange = new EventEmitter<{ label: string, type: 'submit' | 'reset' }>();

  onConfigChange() {
    this.configChange.emit({ label: this.buttonLabel, type: this.buttonType });
  }
constructor(private fb: FormBuilder) {
    this.buttonForm = this.fb.group({
     label: ['Button'],
      type: ['submit']
    });
  }

  save(): void {
    const formData = this.buttonForm.value;
    const configuredItem = {
      ...formData,
      type: 'button',
      name: formData.label,
      config: formData
    };

    console.log('Form data saved:', configuredItem);
    this.dialogRef.close(configuredItem);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
