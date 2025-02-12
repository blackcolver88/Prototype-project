import { Component, Input} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-radio-button',
  imports: [CommonModule],
  templateUrl: './radio-button.component.html',
  styleUrl: './radio-button.component.css',

})
export class RadioButtonComponent {
  @Input() label: string = 'Option';
  @Input() name: string = 'radioGroup';
  @Input() textSize: number = 14;
  @Input() textColor: string = '#000000';
}

