import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-basic-datepicker',
  templateUrl: './basic-datepicker.component.html',
  styleUrls: ['./basic-datepicker.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class BasicDatepickerComponent {
  selectedDate: Date | null = null;
  selectedDateFormatted: string = '';
  showCalendar: boolean = false;
  currentMonth: Date = new Date();
  daysInMonth: Date[] = [];
  weekDays: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
   @Input() label: string = 'Select a date';
  @Input() dateFormat: string = 'MM/DD/YYYY'; 
  @Input() value: string = '';
  @Output() valueChange = new EventEmitter<string>();
  @Output() dateSelected = new EventEmitter<Date>();
  
  constructor() {
    this.generateCalendar();
  }
  
  onInputChange(event: any) {
    this.value = event.target.value;
    this.valueChange.emit(this.value);
  }
  
  toggleCalendar(): void {
    this.showCalendar = !this.showCalendar;
  }
  prevMonth(): void {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() - 1));
    this.generateCalendar();
  }
  
  nextMonth(): void {
    this.currentMonth = new Date(this.currentMonth.setMonth(this.currentMonth.getMonth() + 1));
    this.generateCalendar();
  }
  
  generateCalendar(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Get the day of week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDay.getDay();
    
    this.daysInMonth = [];
    
    // Add empty spaces for days before the first day of the month
    for (let i = 0; i < firstDayOfWeek; i++) {
      this.daysInMonth.push(new Date(year, month, -firstDayOfWeek + i + 1));
    }
    
    // Add all days of the month
    for (let i = firstDay.getDate(); i <= lastDay.getDate(); i++) {
      this.daysInMonth.push(new Date(year, month, i));
    }
    
    // Calculate remaining cells to complete the grid
    const remainingDays = (7 - (this.daysInMonth.length % 7)) % 7;
    for (let i = 1; i <= remainingDays; i++) {
      this.daysInMonth.push(new Date(year, month + 1, i));
    }
  }
  
  selectDate(date: Date): void {
    this.selectedDate = date;
    // Emit the raw Date object
    this.dateSelected.emit(date);
    
    // Keep original format for display if value is manually entered
    if (!this.value) {
      this.selectedDateFormatted = this.formatDate(date);
      this.value = this.selectedDateFormatted;
      this.valueChange.emit(this.value);
    }
    
    this.showCalendar = false;
  }
  
  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
  
  isSelectedDate(date: Date): boolean {
    return this.selectedDate ? date.getTime() === this.selectedDate.getTime() : false;
  }
  
  isCurrentMonth(date: Date): boolean {
    return date.getMonth() === this.currentMonth.getMonth();
  }
}