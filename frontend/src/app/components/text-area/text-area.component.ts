import { Component, EventEmitter, Input, Output } from '@angular/core';
import {CommonModule} from "@angular/common";

@Component({
  selector: 'app-text-area',
  imports: [CommonModule],
  templateUrl: './text-area.component.html',
  styleUrl: './text-area.component.css'
})
export class TextAreaComponent {
  @Input() label: string = 'Text Area';
  @Input() placeholder: string = 'Enter text here';
  @Input() isRequired: boolean = false;
  @Output() valueChange = new EventEmitter<string>();
  
  value: string = '';
  
  onInputChange(event: any) {
    this.value = event.target.value;
    this.valueChange.emit(this.value);
  }

}
