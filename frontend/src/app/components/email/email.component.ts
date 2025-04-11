import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-email',
  standalone: true,
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.css'],
  imports: [CommonModule, FormsModule]
})
export class EmailComponent {
  @Input() label: string = 'Email';
  @Input() type: 'text' | 'number' = 'text';
  @Input() email: string = '';
  @Input() placeholder: string = 'Enter your email';
  @Input() isRequired: boolean = false;
  @Output() valueChange = new EventEmitter<string>();
  @Input() isDisabled: boolean = false; 

  @Input() value: string = '';
    
    onInputChange(event: any) {
      this.value = event.target.value;
      this.valueChange.emit(this.value);
    }
  

  get isEmailInvalid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(this.email);
  }
}
