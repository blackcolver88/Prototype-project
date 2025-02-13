import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-select-box',
  templateUrl: './select-box.component.html',
  styleUrls: ['./select-box.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class SelectBoxComponent {
  @Input() label: string = 'Select an option';
  @Input() options: string[] = [];
}
