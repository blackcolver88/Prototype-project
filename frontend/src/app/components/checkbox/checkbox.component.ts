import { Component, Input } from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class CheckboxComponent {
  @Input() label: string = 'Check this box';
  @Input() textColor: string = '#000000';
  @Input() textSize: number = 14;
}
