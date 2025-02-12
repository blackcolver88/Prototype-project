import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-email',
  standalone: true,
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.scss'],
  imports: [CommonModule, FormsModule]
})
export class EmailComponent {
  @Input() label: string = 'Email';
  @Input() labelPosition: 'top' | 'left' | 'right' | 'bottom' = 'top';
  @Input() labelAlignment: 'left' | 'right' = 'left';
  @Input() textSize: number = 14;
  @Input() fontColor: string = '#000000';
  @Input() fontFamily: string = 'Arial';
  @Input() email: string = '';
  @Input() placeholder: string = 'Enter your email';

  get isEmailInvalid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(this.email);
  }
}
