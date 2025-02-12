/*import { Component } from '@angular/core';

@Component({
  selector: 'app-basic-datepicker',
  imports: [],
  templateUrl: './basic-datepicker.component.html',
  styleUrl: './basic-datepicker.component.css'
})
export class BasicDatepickerComponent {

}/*

 */
import {Component, Input} from '@angular/core';
import {CommonModule} from "@angular/common";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-basic-datepicker',
  templateUrl: './basic-datepicker.component.html',
  styleUrls: ['./basic-datepicker.component.scss'],
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
    this.selectedDate = date;
    this.selectedDateFormatted = this.formatDate(date);
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
}
