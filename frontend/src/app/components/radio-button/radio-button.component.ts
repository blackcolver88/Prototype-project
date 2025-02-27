import { Component, Input, Output, EventEmitter } from '@angular/core';
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
export class RadioButtonComponent {
  @Input() groupLabel: string = 'Radio Group';
  @Input() options: RadioOption[] = [];
  @Input() name: string = 'radio';
  @Input() isRequired: boolean = false;
  @Input() isDisabled: boolean = false;
  @Input() selectedOption: string = '';

  @Output() optionChange = new EventEmitter<string>();

  onOptionChange(selectedValue: string) {
    this.selectedOption = selectedValue;
    this.optionChange.emit(this.selectedOption);
  }
}
