import {
  Component,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-select-box',
  templateUrl: './select-box.component.html',
  styleUrls: ['./select-box.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class SelectBoxComponent {
  @Input() label: string = 'Select an option';
  @Input() options: string[] = [];
  @Input() fontFamily: string = 'Arial';
  @Input() id: string = 'select-' + Math.random().toString(36).substr(2, 9);
  @Input() isRequired: boolean = false;
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();

  selectedValue: string = '';

  onSelectChange() {
    this.valueChange.emit(this.selectedValue);
  }
  ngOnInit() {
    if (this.value) {
      this.selectedValue = this.value;
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['value'] && changes['value'].currentValue) {
      this.selectedValue = changes['value'].currentValue;
    }
  }
}
