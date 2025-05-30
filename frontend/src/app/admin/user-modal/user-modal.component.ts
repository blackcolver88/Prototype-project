import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RegisterRequest } from '../../model/RegisterRequest';
import { AuthService } from '../../services/Auth.service';

@Component({
  selector: 'app-user-modal',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-modal.component.html',
  styleUrl: './user-modal.component.css'
})
export class UserModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() userCreated = new EventEmitter<RegisterRequest>();

  registerForm: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  isSubmitting: boolean = false;
  availableRoles: string[] = [];
  isLoadingRoles: boolean = true;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
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

  ngOnInit(): void {
    this.loadRoles();
  }

  loadRoles(): void {
    this.isLoadingRoles = true;
    this.authService.getAvailableRoles().subscribe({
      next: (roles) => {
        this.availableRoles = roles;
        this.isLoadingRoles = false;
      },
      error: (err) => {
        console.error('Failed to load roles', err);
        this.errorMessage = 'Unable to load roles. Please try again later.';
        this.isLoadingRoles = false;
      }
    });
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

    const selectedRole = this.registerForm.value.role;

    const registerData: RegisterRequest = {
      firstname: this.registerForm.value.firstname,
      lastname: this.registerForm.value.lastname,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      role: selectedRole,
      accountLocked: false,
      enabled: true
    };

    this.authService.adminRegister(registerData).subscribe({
      next: (response) => {
        console.log('User registration successful', response);
        this.successMessage = `User ${registerData.firstname} ${registerData.lastname} has been successfully registered with role: ${registerData.role}`;
        this.errorMessage = '';
        this.registerForm.reset();
        this.registerForm.patchValue({ role: '' });
        this.userCreated.emit(registerData);

        setTimeout(() => {
          this.closeModal();
        }, 2000);
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.successMessage = '';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  closeModal() {
    this.close.emit();
  }

  get f() {
    return this.registerForm.controls;
  }
}
