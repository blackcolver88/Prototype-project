import { Component, Input } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-phone-number',
  imports: [],
  templateUrl: './phone-number.component.html',
  styleUrl: './phone-number.component.css'
})
export class PhoneNumberComponent {
  @Input() textSize: number = 14;
  @Input() fontColor: string = '#000000';
  @Input() label: string = 'Phone Number';
  @Input() fontFamily: string = 'Arial';
  @Input() labelPosition: string = 'top'; // 'top', 'left', 'right', 'bottom'


  allowOnlyNumbers(event: KeyboardEvent): void {
    const charCode = event.charCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
    }
  }

}
