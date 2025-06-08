import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { FormTemplateService } from '../../../services/form-template.service';
import { FormTemplate } from '../../../model/FormTemplate';

@Component({
  selector: 'app-create-request-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './create-request-dialog.component.html',
  styleUrls: ['./create-request-dialog.component.css']
})
export class CreateRequestDialogComponent implements OnInit {
  requestForm: FormGroup;
  availableForms: FormTemplate[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private dialogRef: MatDialogRef<CreateRequestDialogComponent>,
    private formBuilder: FormBuilder,
    private formTemplateService: FormTemplateService
  ) {
    this.requestForm = this.formBuilder.group({
      formId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadAvailableForms();
  }

  loadAvailableForms() {
    this.isLoading = true;
    this.formTemplateService.getAllFormTemplates().subscribe({
      next: (forms) => {
        this.availableForms = forms;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading forms:', error);
        this.errorMessage = 'Failed to load available forms';
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.requestForm.valid) {
      const formData = this.requestForm.value;
      const selectedForm = this.availableForms.find(form => form.id === parseInt(formData.formId));
      
      // Store complete data with formId only (target role will be determined by form template configuration)
      const result = {
        formId: parseInt(formData.formId),
        formTitle: selectedForm?.title || 'Unknown Form'
      };
      
      // Store in localStorage for use in form submission
      localStorage.setItem('pendingRequestData', JSON.stringify(result));
      
      this.dialogRef.close(result);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel() {
    this.dialogRef.close();
  }

  private markFormGroupTouched() {
    Object.keys(this.requestForm.controls).forEach(key => {
      const control = this.requestForm.get(key);
      control?.markAsTouched();
    });
  }

  getFormError(fieldName: string): string {
    const control = this.requestForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'Form is required';
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.requestForm.get(fieldName);
    return !!(control?.invalid && control.touched);
  }
}
