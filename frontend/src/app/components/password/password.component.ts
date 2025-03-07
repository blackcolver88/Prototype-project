import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class PasswordComponent {

  @Input() placeholder: string = 'Password';
  @Input() label: string = 'Password';

  isPasswordVisible: boolean = false;

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
