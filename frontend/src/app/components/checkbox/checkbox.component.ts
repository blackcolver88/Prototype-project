import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from '@angular/forms';

interface CheckboxOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-checkbox',
  templateUrl: './checkbox.component.html',
  styleUrls: ['./checkbox.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class CheckboxComponent implements OnInit {
  @Input() groupLabel: string = 'Checkbox Group';
  @Input() options: CheckboxOption[] = [];
  @Input() name: string = '';
  @Input() isRequired: boolean = false;
  @Input() isDisabled: boolean = false;
  @Input() selectedOptions: string[] = [];  // Internal state

  @Output() valueChange = new EventEmitter<string[]>();

  ngOnInit() {
    if (!this.name) {
      this.name = `checkbox_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Ensure selectedOptions is an array
    if (!Array.isArray(this.selectedOptions)) {
      this.selectedOptions = [];
    }
  }

// In CheckboxComponent
onCheckboxChange(option: CheckboxOption, event: Event) {
  const inputElement = event.target as HTMLInputElement;
  const value = option.value.trim();
  
  if (!value) return; // Prevent empty values

  let newSelectedOptions = [...this.selectedOptions];
  
  if (inputElement.checked) {
    if (!newSelectedOptions.includes(value)) {
      newSelectedOptions.push(value);
    }
  } else {
    newSelectedOptions = newSelectedOptions.filter(v => v !== value);
  }

  this.selectedOptions = newSelectedOptions;
  this.valueChange.emit(this.selectedOptions);
}
}
