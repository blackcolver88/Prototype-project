import { Component, Input } from '@angular/core';
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
  @Input() label: string = 'Phone Number';
  @Input() labelPosition: string = 'top';


  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
