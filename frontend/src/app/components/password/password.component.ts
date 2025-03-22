import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-password',
  templateUrl: './password.component.html',
  styleUrls: ['./password.component.css'],
  standalone: true,
  imports: [CommonModule,FormsModule],
})
export class PasswordComponent {

  @Input() placeholder: string = 'Password';
  @Input() label: string = 'Password'; // This will be used to display the custom label
    @Input() required: boolean = false;
    @Output() valueChange = new EventEmitter<string>();
    @Input() isRequired: boolean = false;
    @Input() value: string = '';
    
    onInputChange(event: any) {
      this.value = event.target.value;
      this.valueChange.emit(this.value);
    }

  isPasswordVisible: boolean = false;

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
