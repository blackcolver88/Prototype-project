import { Component, Input } from '@angular/core';
import {CommonModule} from "@angular/common";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-textform',
  standalone: true,
  templateUrl: './textform.component.html',
  styleUrl: './textform.component.css',
  imports: [CommonModule, FormsModule]
})
export class TextformComponent {
  @Input() textSize: number = 14;
  @Input() type: string = 'text';
  @Input() textName: string = '';
  @Input() placeholder: string = 'Enter your email';
  @Input() fontColor: string = '#000000';
  @Input() label: string = 'Text Field';
  @Input() fontFamily: string = 'Helvetica';
  @Input() labelPosition: string = 'top';
  @Input() labelAlignment: string = 'left';
}
