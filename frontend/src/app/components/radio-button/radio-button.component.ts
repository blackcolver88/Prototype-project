import { Component, Input, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-radio-button',
  templateUrl: './radio-button.component.html',
  styleUrls: ['./radio-button.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class RadioButtonComponent {
  @Input() label: string = 'Option';
  @Input() name: string = 'radioGroup';
  @Input() textSize: number = 14;
  @Input() textColor: string = '#000000';
  @Input() options: { value: string }[] = [{ value: 'option1' }];
  @Input() selectedOption: string = '';
  @Input() required: boolean = false;
  @Output() optionChange = new EventEmitter<string>();

  onOptionChange(selectedValue: string) {
    this.selectedOption = selectedValue;
    this.optionChange.emit(this.selectedOption);
  }
}
