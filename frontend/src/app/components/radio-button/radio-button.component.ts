import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class RadioButtonComponent {
  @Input() label: string = 'Option';
  @Input() name: string = 'radioGroup';
}
