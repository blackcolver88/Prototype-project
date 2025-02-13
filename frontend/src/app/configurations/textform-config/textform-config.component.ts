import {Component, inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from "@angular/forms";
import { CommonModule } from "@angular/common";
import { TextformComponent } from "../../components/textform/textform.component";
import {DialogRef} from "@angular/cdk/dialog";

@Component({
  selector: 'app-textform-config',
  standalone: true,
  imports: [CommonModule, TextformComponent, ReactiveFormsModule],
  templateUrl: './textform-config.component.html',
  styleUrl: './textform-config.component.scss'
})
export class TextformConfigComponent {
  textForm: FormGroup;
  private dialogRef = inject(DialogRef);
  constructor(private fb: FormBuilder) {
    this.textForm = this.fb.group({
      label: ['Text Field'],
      tabs: this.fb.array([]),
      textSize: [14],
      fontColor: ['#000000'],
      fontFamily: ['Helvetica'],
      labelPosition: ['top'],
      labelAlignment: ['left']
    });
  }

  save(): void {
    const formData = this.textForm.value;
    console.log('Form data saved:', formData);
    this.dialogRef.close(formData);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
