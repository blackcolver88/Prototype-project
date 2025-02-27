import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';

interface CheckboxOption {
  label: string;
  value: string;
  checked: boolean;
}

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CheckboxComponent {
  @Input() groupLabel: string = 'Checkbox Group';
  @Input() options: CheckboxOption[] = [];
  @Input() name: string = 'checkbox';
  @Input() isRequired: boolean = false;
  @Input() isDisabled: boolean = false;

  @Output() optionChange = new EventEmitter<CheckboxOption[]>();

  onOptionChange() {
    this.optionChange.emit(this.options);
  }
}
