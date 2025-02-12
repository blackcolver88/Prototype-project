import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-select-box',
  imports: [CommonModule],
  templateUrl: './select-box.component.html',
  styleUrl: './select-box.component.css'
})
export class SelectBoxComponent {
  @Input() label: string = 'Select an option';
  @Input() options: string[] = [];

}
