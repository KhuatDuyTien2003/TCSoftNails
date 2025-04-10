import { customer } from './../../../app.type/customer.type';
import { Component, LOCALE_ID, OnInit, ViewChild } from '@angular/core';
import { startOfWeek, endOfWeek } from 'date-fns';
import { CommonModule, registerLocaleData } from '@angular/common';
import localeVi from '@angular/common/locales/vi';

import { HttpStaffService } from '../../../services/http-staff.service';
import { ToastrService } from 'ngx-toastr';
import { HeaderComponent } from '../../../header/header.component';
import { RouterModule } from '@angular/router';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AccountComponent } from '../../account/account.component';
import { AddShiftComponent } from '../add-shift/add-shift.component';
import { ResponseWorkDate } from '../../../app.type/ResponseWorkDate.Type';
import { report } from 'node:process';
import { GetWeekPipe } from '../../../pipe/get-week.pipe';

registerLocaleData(localeVi);

@Component({
  selector: 'app-calendar-staff',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    NzIconModule,
    RouterModule,
    AddShiftComponent,
    GetWeekPipe,
  ],
  templateUrl: './calendar-staff.component.html',
  styleUrls: ['./calendar-staff.component.scss'],
  providers: [{ provide: LOCALE_ID, useValue: 'vi-VN' }],
})
export class CalendarStaffComponent implements OnInit {
  date = new Date();
  swatDate = new Date('1900-10-11');
  swatDate2 = new Date('1900-10-12');
  selectedWeek: Date[] = [];
  listCalendarWork: ResponseWorkDate[] = [];
  staffId: number = 0;
  staffName: string = '';
  pickDate: Date | null = null;

  @ViewChild(AddShiftComponent) addShiftComponent!: AddShiftComponent;
  constructor(
    private httpStaff: HttpStaffService,
    private toastr: ToastrService
  ) {
    this.updateWeek(this.date);
  }

  getNow(){
    this.updateWeek(this.date);
  }

  ngOnInit(): void {
    this.httpStaff.getWorkDate().subscribe((data) => {
      if (data.success) {
        this.listCalendarWork = data.data;
        console.log(this.listCalendarWork);
      } else this.toastr.error(data.message);
    });
  }

  receiveWorkScheule(data: ResponseWorkDate[]) {
    this.listCalendarWork = data;
  }

  getShiftDescription(shift: number, customerName: string): string {
    const shiftName =
      shift === 1
        ? 'Ca sáng'
        : shift === 2
        ? 'Ca chiều'
        : shift === 3
        ? 'Ca tối'
        : '';
    if (shiftName !== '') return `${shiftName}`;
    else return '';
  }

  formatDate(date?: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  goToNextWeek() {
    const nextWeekStart = new Date(this.selectedWeek[0]);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7); // Move to the next week

    this.updateWeek(nextWeekStart);
  }

  goToPreviousWeek() {
    const prevWeekStart = new Date(this.selectedWeek[0]);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7); // Move to the previous week

    this.updateWeek(prevWeekStart);
  }

  onDateSelect(date: Date) {
    this.date = date;
    this.updateWeek(date);
  }

  updateWeek(date: Date) {
    const start = startOfWeek(date, { weekStartsOn: 1 });
    const end = endOfWeek(date, { weekStartsOn: 1 });

    this.selectedWeek = this.getWeekDays(start, end);
  }

  getWeekDays(start: Date, end: Date): Date[] {
    const days = [];
    let currentDate = new Date(start);
    while (currentDate <= end) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return days;
  }

  openAddModel(
    WorkDateId: number | null,
    staffId: number,
    staffName: string,
    date: Date,
    customerId: number | null,
    shift: number | null,
    customerName: string | null,
    isEdit: boolean
  ) {
    console.log(WorkDateId);
    this.addShiftComponent.showModal(
      WorkDateId,
      staffId,
      staffName,
      date,
      customerId || 100,
      shift,
      customerName,
      isEdit
    );
  }

  onHidden(event: Event) {
    let element = event.currentTarget as HTMLElement;
    let addShift = element.querySelector('.addShift');

    if (addShift) {
      if (addShift.classList.contains('hidden')) {
        addShift.classList.remove('hidden');
      } else {
        addShift.classList.add('hidden');
      }
    }
  }
}
