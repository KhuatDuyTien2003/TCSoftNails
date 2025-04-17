import {
  Appointment,
  AppointmentDetailModel,
} from './../../app.type/Appointment.type';
import { endOfWeek, startOfWeek } from 'date-fns';
import {
  AfterViewInit,
  Component,
  LOCALE_ID,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, registerLocaleData } from '@angular/common';
import { HeaderComponent } from '../../header/header.component';
import { RouterModule } from '@angular/router';
import { GetWeekPipe } from '../../pipe/get-week.pipe';

import { HttpStaffService } from '../../services/http-staff.service';
import { ToastrService } from 'ngx-toastr';
import localeVi from '@angular/common/locales/vi';
import { FormUpdateComponent } from './form-update/form-update.component';
registerLocaleData(localeVi);
@Component({
  selector: 'app-appointment',
  standalone: true,
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.scss',
  imports: [
    CommonModule,
    HeaderComponent,
    RouterModule,
    GetWeekPipe,
    FormUpdateComponent,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'vi-VN' }],
})
export class AppointmentComponent implements OnInit {
  date = new Date();
  swatDate = new Date('1900-10-11');
  swatDate2 = new Date('1900-10-12');
  selectedWeek: Date[] = [];
  appointmentList: Appointment[] = [];
  staffId: number = 0;
  staffName: string = '';
  pickDate: Date | null = null;
  colors = ['#FEE2E2', '#D1FAE5'];
  borderColors = ['#EF4444', '#10B981'];
  @ViewChild('formUpdate') formUpdate!: FormUpdateComponent;
  constructor(
    private httpStaff: HttpStaffService,
    private toastr: ToastrService
  ) {
    this.updateWeek(this.date);
  }
  ngOnInit(): void {
    this.getAppointments();
  }

  openFormUpdate(
    numberPhone: string,
    customerName: string,
    email: string,
    gender: boolean,
    description: string,
    idStaff: number,
    timeStart: Date,
    service: AppointmentDetailModel[],
    idAppointment: number,
    status: boolean
  ): void {
    console.log(status);
    if (this.formUpdate) {
      this.formUpdate.openForm(
        numberPhone,
        customerName,
        email,
        gender,
        description,
        idStaff,
        timeStart,
        service,
        idAppointment,
        status
      );
    } else {
      console.error('Child component chưa được khởi tạo!');
    }
  }

  getNow() {
    this.updateWeek(this.date);
  }

  getColor(status: boolean) {
    return {
      background: status ? this.colors[1] : this.colors[0],
      border: status ? this.borderColors[1] : this.borderColors[0],
    };
  }
  goToNextWeek() {
    const nextWeekStart = new Date(this.selectedWeek[0]);
    nextWeekStart.setDate(nextWeekStart.getDate() + 7);

    this.updateWeek(nextWeekStart);
  }

  goToPreviousWeek() {
    const prevWeekStart = new Date(this.selectedWeek[0]);
    prevWeekStart.setDate(prevWeekStart.getDate() - 7);

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

  formatDate(date?: Date | string): string {
    if (!date) return '';
    const d = typeof date === 'string' ? new Date(date) : date;

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  getAppointments(): void {
    this.httpStaff.getAppointment().subscribe({
      next: (data) => {
        if (data.success) {
          this.toastr.success(data.message);
          this.appointmentList = data.data;
          console.log(this.appointmentList);
        } else {
          this.toastr.error(data.message);
          this.appointmentList = [];
        }
      },
      error: (err) => {
        this.toastr.error(err);
        this.appointmentList = [];
      },
      complete: () => {
        console.log('Appointment fetching completed.');
      },
    });
  }
}
