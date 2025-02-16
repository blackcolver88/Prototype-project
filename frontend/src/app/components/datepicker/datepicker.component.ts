import {Component, Input} from '@angular/core';
import  {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

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


  constructor() {
    this.generateCalendar();
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

    this.daysInMonth = [];

    for (let i = firstDay.getDate(); i <= lastDay.getDate(); i++) {
      this.daysInMonth.push(new Date(year, month, i));
    }
  }

  selectDate(date: Date): void {
    if (!this.selectedStartDate || (this.selectedStartDate && this.selectedEndDate)) {
      this.selectedStartDate = date;
      this.selectedEndDate = null;
    } else if (!this.selectedEndDate && date > this.selectedStartDate) {
      this.selectedEndDate = date;
      this.updateDateRange();
      this.showCalendar = false;
    }
  }

  updateDateRange(): void {
    if (this.selectedStartDate && this.selectedEndDate) {
      this.dateRange = `${this.formatDate(this.selectedStartDate)} - ${this.formatDate(this.selectedEndDate)}`;
    }
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }

  isSelectedDate(date: Date): boolean {
    if (!this.selectedStartDate) return false;
    if (this.selectedStartDate && !this.selectedEndDate) {
      return date.getTime() === this.selectedStartDate.getTime();
    }
    if (this.selectedStartDate && this.selectedEndDate) {
      return date >= this.selectedStartDate && date <= this.selectedEndDate;
    }
    return false;
  }
}
