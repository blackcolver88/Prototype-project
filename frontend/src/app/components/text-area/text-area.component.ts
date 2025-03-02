import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-text-area',
  imports: [],
  templateUrl: './text-area.component.html',
  styleUrl: './text-area.component.css'
})
export class TextAreaComponent {
  @Input() label: string = 'Text Area';
  @Input() placeholder: string = 'Enter text here';
  @Input() required: boolean = false;
}
