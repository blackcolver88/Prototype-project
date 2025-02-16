import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-box',
  templateUrl: './select-box.component.html',
  styleUrls: ['./select-box.component.css'],
  standalone: true,
  imports: [CommonModule , FormsModule]
})
export class SelectBoxComponent {
  @Input() label: string = 'Select an option';
  @Input() options: string[] = [];
  @Input() textSize: number = 14;
  @Input() fontColor: string = '#000000';
  @Input() fontFamily: string = 'Arial';
  @Input() id: string = 'select-' + Math.random().toString(36).substr(2, 9);
  
  selectedValue: string = '';
}
