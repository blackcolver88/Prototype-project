import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
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
export class CheckboxComponent implements OnInit, OnChanges {
 
  @Input() groupLabel: string = 'Checkbox Group';
  @Input() options: CheckboxOption[] = [];
  @Input() name: string = '';
  @Input() isRequired: boolean = false;
  @Input() isDisabled: boolean = false;
  @Input() selectedOptions: string | string[] = '';  // Internal state

  @Output() valueChange = new EventEmitter<string[]>();

  ngOnInit() {
    // Convert string inputs to arrays (legacy data support)
    if (typeof this.selectedOptions === 'string') {
      this.selectedOptions = (this.selectedOptions as string).split(',').filter(v => v.trim() !== '');
    }
    this.selectedOptions = Array.isArray(this.selectedOptions) ? [...this.selectedOptions] : [];
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedOptions']) {
      // Handle string-to-array conversion on input changes
      if (typeof this.selectedOptions === 'string') {
        this.selectedOptions = this.selectedOptions.split(',').filter(v => v.trim() !== '');
      }
      this.selectedOptions = Array.isArray(this.selectedOptions) ? [...this.selectedOptions] : [];
    }
  }

  trackByValue(index: number, option: CheckboxOption): string {
  return option.value;
  }

  onCheckboxChange(option: CheckboxOption, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const value = option.value.trim();
    
    // Create a new array reference for change detection
    const newSelectedOptions = [...this.selectedOptions];
    
    if (inputElement.checked) {
      if (!newSelectedOptions.includes(value)) {
        newSelectedOptions.push(value);
      }
    } else {
      const index = newSelectedOptions.indexOf(value);
      if (index > -1) {
        newSelectedOptions.splice(index, 1);
      }
    }
    
    // Emit the new array reference
    this.selectedOptions = [...newSelectedOptions];
    this.valueChange.emit(this.selectedOptions);
  }
}
