import { Component, Input } from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class CheckboxComponent {
  @Input() label: string = 'Check this box';

}
