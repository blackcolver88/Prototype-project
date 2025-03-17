import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() type: string = 'text';
  @Input() textName: string = '';
  @Input() placeholder: string = 'Enter your email';
  @Input() required: boolean = false;
  @Input() label: string = 'Text Field';
    @Output() valueChange = new EventEmitter<string>();
    
    value: string = '';
    
    onInputChange(event: any) {
      this.value = event.target.value;
      this.valueChange.emit(this.value);
    }
  
}
