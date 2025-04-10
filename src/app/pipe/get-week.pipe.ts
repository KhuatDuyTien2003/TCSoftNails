import { Pipe, PipeTransform } from '@angular/core';
import { format } from 'date-fns';

@Pipe({
  name: 'getWeek',
  standalone: true,
})
export class GetWeekPipe implements PipeTransform {
  transform(date: Date, ...args: unknown[]): string {
    // Calculate the week number of the month
    const weekNumber = this.getWeekNumberOfMonth(date);
    const monthYear = format(date, 'MM/yyyy');

    // Return the formatted string "Tuần X"
    return `Tuần ${weekNumber} - tháng ${monthYear}`;
  }

  private getWeekNumberOfMonth(date: Date): number {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const days = Math.floor(
      (date.getTime() - startOfMonth.getTime()) / (24 * 60 * 60 * 1000)
    );
    return Math.ceil((days + startOfMonth.getDay() + 1) / 7);
  }
}
