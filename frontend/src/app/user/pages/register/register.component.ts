import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/Auth.service';
import { CommonModule } from '@angular/common';
import { RegisterRequest } from '../../../model/RegisterRequest';
import { Role } from '../../../model/Role';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;
  roles = Role; // Make enum available to template

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      firstname: ['', [Validators.required]],
      lastname: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(formGroup: FormGroup) {
    const password = formGroup.get('password')?.value;
    const confirmPassword = formGroup.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Get the selected role value directly from the form
    const selectedRole = this.registerForm.value.role;
    console.log('Selected role:', selectedRole); // Debug: log the selected role

    const registerData: RegisterRequest = {
      firstname: this.registerForm.value.firstname,
      lastname: this.registerForm.value.lastname,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: selectedRole, // Use the role directly from the form
      accountLocked: false,
      enabled: true
    };

    this.authService.adminRegister(registerData).subscribe({
      next: (response) => {
        console.log('User registration successful', response);
        this.successMessage = `User ${registerData.firstname} ${registerData.lastname} has been successfully registered with role: ${registerData.role}`;
        this.registerForm.reset();
        // Set default form values after reset
        this.registerForm.patchValue({
          role: ''
        });
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  get f() {
    return this.registerForm.controls;
  }
}
