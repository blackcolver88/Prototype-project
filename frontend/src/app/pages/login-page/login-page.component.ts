import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../services/Auth.service';
import { UserService, UserProfile } from '../../services/user-profile.service';
import { TokenService } from '../../services/token.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.component.html',
  styleUrls: ['./login-page.component.css']
})
export class LoginPageComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private tokenService = inject(TokenService);

  loginForm!: FormGroup;
  error = '';
  isLoading = false;
  returnUrl: string = '/';
  showPassword = false; 

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      remember: [false]
    });

    // Get return URL from route parameters - we'll determine the default after login based on role
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.error = '';

    const { email, password } = this.loginForm.value;

    this.authService.login({ email, password })
      .subscribe({
        next: (response) => {
          // Debug the token
          console.log("LOGIN RESPONSE:", response);

          const token = this.tokenService.getToken();
          if (token) {
            try {
              const payload = JSON.parse(atob(token.split('.')[1]));
              console.log("FULL TOKEN PAYLOAD:", payload);
            } catch (e) {
              console.error("Could not parse token", e);
            }
          }

          // After successful login, load the user profile
          this.userService.loadCurrentUser();

          // Determine redirect URL based on role
          let redirectUrl = this.returnUrl;
          if (!redirectUrl) {
            const userRole = this.tokenService.getUserRole();
            console.log('Redirection based on role:', userRole);
            
            if (this.tokenService.isUser()) {
              console.log('Redirecting to user profile (ROLE_USER)');
              redirectUrl = '/user/profile';
            } else {
              // Any role other than ROLE_USER goes to admin dashboard
              console.log('Redirecting to admin dashboard (non-user role)');
              redirectUrl = '/admin';
            }
          }

          this.router.navigate([redirectUrl]);
        },
        error: err => {
          this.isLoading = false;
          this.error = err.error?.message || 'Authentication failed. Please check your credentials.';
        },
        complete: () => {
          this.isLoading = false;
        }
      });
  }
}
