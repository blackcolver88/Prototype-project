import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-text-area',
  standalone: true,
  templateUrl: './text-area.component.html',
  styleUrl: './text-area.component.css',
  imports: [CommonModule, FormsModule]
})
export class TextAreaComponent implements OnInit {
  @Input() label: string = 'Text Area';
  @Input() placeholder: string = 'Enter text here';
  @Input() required: boolean = false;
  @Input() value: string = '';
  
  @Output() valueChange = new EventEmitter<string>();
  
  ngOnInit() {
    if (this.value === undefined || this.value === null) {
      this.value = '';
    }
  }

  onInputChange(event: any) {
    this.value = event.target.value;
    this.valueChange.emit(this.value);
  }
}