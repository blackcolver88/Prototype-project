import { Component, inject } from '@angular/core';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { DialogRef } from '@angular/cdk/dialog';
import { FormTemplate } from "../../../../model/FormTemplate";
import { FormTemplateService } from "../../../../services/form-template.service";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-form-template-create',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule
  ],
  templateUrl: './form-template-create.component.html',
  styleUrls: ['./form-template-create.component.scss']
})
export class FormTemplateCreateComponent {
  data = inject(DIALOG_DATA);
  formTemplate: FormTemplate = {
    title: '',
    formLayouts: []
  };
  titleRequired = false;

  constructor(
    private dialogRef: DialogRef<FormTemplate>,
    private formTemplateService: FormTemplateService
  ) {}

  save() {
    if (this.formTemplate.title) {
      this.titleRequired = false;

      this.formTemplate.icon = '../../../assets/icons/adjustment.svg';
      this.formTemplate.icon2='../../../assets/icons/trash.svg'
      this.formTemplateService.createFormTemplate({
        title: this.formTemplate.title,
        formLayouts: this.formTemplate.formLayouts
      }).subscribe({
        next: (response) => {
          console.log('Form template created successfully', response);


          const result: FormTemplate = {
            ...response,
            icon: this.formTemplate.icon,
            icon2:this.formTemplate.icon2
          };

          this.dialogRef.close(result);
        },
        error: (error) => {
          console.error('Error creating form template', error);
        }
      });
    } else {
      this.titleRequired = true;
    }
  }


  closeDialog() {
    this.dialogRef.close();
  }
}
