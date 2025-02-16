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
  @Input() textSize: number = 14;
  @Input() fontColor: string = '#000000';
  @Input() placeholder: string = 'Phone Number';
  @Input() label: string = 'Phone Number';
  @Input() fontFamily: string = 'Arial';
  @Input() labelPosition: string = 'top';
  @Input() labelAlignment: string = 'left';

  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }
}
