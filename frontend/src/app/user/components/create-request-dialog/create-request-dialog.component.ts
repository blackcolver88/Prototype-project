import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { FormTemplateService } from '../../../services/form-template.service';
import { RoleService } from '../../../services/role.service';
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
  availableRoles: string[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private dialogRef: MatDialogRef<CreateRequestDialogComponent>,
    private formBuilder: FormBuilder,
    private formTemplateService: FormTemplateService,
    private roleService: RoleService
  ) {
    this.requestForm = this.formBuilder.group({
      formId: ['', Validators.required],
      targetRole: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadAvailableForms();
    this.loadAvailableRoles();
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

  loadAvailableRoles() {
    this.roleService.getAvailableRoles().subscribe({
      next: (roles) => {
        // Filter out ROLE_USER as it's not typically an approval role
        this.availableRoles = roles.filter(role => role !== 'ROLE_USER');
      },
      error: (error) => {
        console.error('Error loading roles:', error);
        this.errorMessage = 'Failed to load available roles';
      }
    });
  }

  onSubmit() {
    if (this.requestForm.valid) {
      const formData = this.requestForm.value;
      const selectedForm = this.availableForms.find(form => form.id === parseInt(formData.formId));
      
      // Store complete data with formId and targetRole
      const result = {
        formId: parseInt(formData.formId),
        formTitle: selectedForm?.title || 'Unknown Form',
        targetRole: formData.targetRole
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
        return `${fieldName === 'formId' ? 'Form' : 'Target Role'} is required`;
      }
    }
    return '';
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.requestForm.get(fieldName);
    return !!(control?.invalid && control.touched);
  }
}
