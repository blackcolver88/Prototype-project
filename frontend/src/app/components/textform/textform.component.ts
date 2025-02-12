import { Component, Input } from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-textform',
  imports:[CommonModule],
  templateUrl: './textform.component.html',
  styleUrl: './textform.component.css',

})
export class TextformComponent {
  @Input() textSize: number = 14;
  @Input() fontColor: string = '#000000';
  @Input() label: string = 'Text Field';
  @Input() fontFamily: string = 'Helvetica';
  @Input() labelPosition: string = 'top';
  @Input() labelAlignment: string = 'left';

}
