import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-phone-number',
  standalone: true,
  templateUrl: './phone-number.component.html',
  styleUrls: ['./phone-number.component.css'],
  imports: [CommonModule, FormsModule]
})
export class PhoneNumberComponent {
  @Input() placeholder: string = 'Phone Number';
  @Input() label: string = 'Phone Number';
  @Output() valueChange = new EventEmitter<string>();
  @Input() isRequired: boolean = false;
  @Input() isDisabled: boolean = false; 
  @Input() value: string = '';
  
  onInputChange(event: any) {
    this.value = event.target.value;
    this.valueChange.emit(this.value);
  }

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
