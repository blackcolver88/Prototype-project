import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-textform',
  standalone: true,
  templateUrl: './textform.component.html',
  styleUrl: './textform.component.css',
  imports: [CommonModule, FormsModule]
})
export class TextformComponent implements OnInit {
  @Input() type: string = 'text';
  @Input() textName: string = '';
  @Input() placeholder: string = 'Enter your email';
  @Input() isRequired: boolean = false;
  @Input() label: string = 'Text Field';
  @Input() value: string = '';

  @Output() valueChange = new EventEmitter<string>();
  
  ngOnInit() {
    if (this.textName && (this.value === undefined || this.value === null)) {
      this.value = this.textName;
    }
  }

  onInputChange(event: any) {
    this.value = event.target.value;
    this.valueChange.emit(this.value);
  }
}