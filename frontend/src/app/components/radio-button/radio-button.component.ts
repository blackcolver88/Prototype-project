import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface RadioOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class RadioButtonComponent implements OnInit {
  @Input() groupLabel: string = 'Radio Group';
  @Input() options: RadioOption[] = [];
  @Input() name: string = '';
  @Input() isRequired: boolean = false;
  @Input() isDisabled: boolean = false; 
  @Input() selectedOption: string = '';

  @Output() valueChange = new EventEmitter<string>();

  ngOnInit() {
    if (!this.name) {
      this.name = `radio_${Math.random().toString(36).substr(2, 9)}`;
    }
  }

  onOptionChange(selectedValue: string) {
    this.selectedOption = selectedValue; // Make sure to update the internal state
    this.valueChange.emit(selectedValue);
  }
}