import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";

@Component({
  selector: 'app-datepicker',
  templateUrl: './datepicker.component.html',
  styleUrls: ['./datepicker.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class DatepickerComponent {
  dateRange: string = '';
  showCalendar: boolean = false;
  currentMonth: Date = new Date();
  selectedStartDate: Date | null = null;
  selectedEndDate: Date | null = null;
  daysInMonth: Date[] = [];
  weekDays: string[] = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  
  @Input() label: string = 'Select a date range';
  @Input() textSize: number = 14;
  @Input() fontColor: string = '#000000';
  @Input() fontFamily: string = 'Arial';
  @Input() value: string = '';
  @Input() isRequired: boolean = false;

  @Output() valueChange = new EventEmitter<string>();
  @Output() dateRangeChange = new EventEmitter<{start: Date | null, end: Date | null}>();

  constructor() {
    this.generateCalendar();
  }

  ngOnInit() {
    // Parse initial value if provided
    if (this.value) {
      this.parseDateRange(this.value);
    }
  }

  parseDateRange(rangeString: string): void {
    if (!rangeString || !rangeString.includes('-')) return;
    
    const [startStr, endStr] = rangeString.split('-').map(d => d.trim());
    try {
      const [startMonth, startDay, startYear] = startStr.split('/').map(Number);
      const [endMonth, endDay, endYear] = endStr.split('/').map(Number);
      
      this.selectedStartDate = new Date(startYear, startMonth - 1, startDay);
      this.selectedEndDate = new Date(endYear, endMonth - 1, endDay);
      
      // Set current month to start date's month
      this.currentMonth = new Date(this.selectedStartDate);
      this.generateCalendar();
    } catch (e) {
      console.error('Error parsing date range', e);
    }
  }

  onInputChange(event: any) {
    this.value = event.target.value;
    this.valueChange.emit(this.value);
    this.parseDateRange(this.value);
  }

  toggleCalendar(): void {
    this.showCalendar = !this.showCalendar;
  }

  closeCalendar(): void {
    this.showCalendar = false;
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
    
    // Get first day of month and last day
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    this.daysInMonth = [];
    
    // Add empty spaces for days before the first day of month
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevDate = new Date(year, month, -i);
      this.daysInMonth.unshift(prevDate);
    }
    
    // Add all days in current month
    for (let i = firstDay.getDate(); i <= lastDay.getDate(); i++) {
      this.daysInMonth.push(new Date(year, month, i));
    }
    
    // Add days to fill the last row
    const remainingDays = 7 - (this.daysInMonth.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        this.daysInMonth.push(new Date(year, month + 1, i));
      }
    }
  }

  selectDate(date: Date): void {
    if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate)) {
      // Start a new selection
      this.selectedStartDate = new Date(date);
      this.selectedEndDate = null;
      this.dateRange = this.formatDate(this.selectedStartDate);
      this.value = this.dateRange;
      this.valueChange.emit(this.value);
      this.dateRangeChange.emit({
        start: this.selectedStartDate,
        end: null
      });
    } else if (!this.selectedEndDate) {
      // Complete the selection
      if (date >= this.selectedStartDate) {
        this.selectedEndDate = new Date(date);
      } else {
        // If user clicks an earlier date, swap start and end
        this.selectedEndDate = new Date(this.selectedStartDate);
        this.selectedStartDate = new Date(date);
      }
      this.updateDateRange();
      this.closeCalendar();
    }
  }

  updateDateRange(): void {
    if (this.selectedStartDate && this.selectedEndDate) {
      this.dateRange = `${this.formatDate(this.selectedStartDate)} - ${this.formatDate(this.selectedEndDate)}`;
      this.value = this.dateRange;
      this.valueChange.emit(this.value);
      this.dateRangeChange.emit({
        start: this.selectedStartDate,
        end: this.selectedEndDate
      });
    }
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  // Check if date is within selected range
  isInRange(date: Date): boolean {
    if (!this.selectedStartDate) return false;
    if (!this.selectedEndDate) return date.getTime() === this.selectedStartDate.getTime();
    return date >= this.selectedStartDate && date <= this.selectedEndDate;
  }



  // Check if date is selectable (in current month)
  isCurrentMonthDate(date: Date): boolean {
    return date.getMonth() === this.currentMonth.getMonth();
  }

  // Clear the selected dates
  clearSelection(): void {
    this.selectedStartDate = null;
    this.selectedEndDate = null;
    this.dateRange = '';
    this.value = '';
    this.valueChange.emit(this.value);
    this.dateRangeChange.emit({
      start: null,
      end: null
    });
  }
}