import { AppointmentSent } from './../../../app.type/AppointmentSent.type';
import { CommonModule, registerLocaleData } from '@angular/common';
import { Component, inject, LOCALE_ID, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormsModule,
  NgModel,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { ToastrService } from 'ngx-toastr';
import { HttpStaffService } from '../../../services/http-staff.service';
import { Service } from '../../../app.type/service.type';
import { StaffByServiceId } from '../../../app.type/StaffByServiceId.type';
import localeVi from '@angular/common/locales/vi';
registerLocaleData(localeVi);
@Component({
  selector: 'app-form-appointment',
  standalone: true,
  templateUrl: './form-appointment.component.html',
  styleUrl: './form-appointment.component.scss',
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzDatePickerModule,
    NzFormModule,
    NzSelectModule,
  ],
  providers: [{ provide: LOCALE_ID, useValue: 'vi-VN' }],
})
export class FormAppointmentComponent implements OnInit {
  todayDate: string = '';
  constructor(
    private toastr: ToastrService,
    private httpStaff: HttpStaffService
  ) {
    const today = new Date();
    this.todayDate = today.toISOString().split('T')[0];
  }
  timeStart: Date | null = null;
  totalTime: number = 0;
  TotalMoney: number = 0;
  serviceList: Service[] = [];
  timeStartDefault: Date = new Date('1900-01-02T06:01');
  staffList: StaffByServiceId[] = [];

  private fb = inject(NonNullableFormBuilder);
  validateForm = this.fb.group({
    numberPhone: this.fb.control('', [Validators.required]),
    customerName: this.fb.control('', [Validators.required]),
    email: this.fb.control('', [Validators.required]),
    gender: this.fb.control('0', [Validators.required]),
    description: this.fb.control('', [Validators.required]),
    date: this.fb.control<Date | null>(null, [Validators.required]),
    listOfSelectedValue: this.fb.control([], Validators.required),
    listOfSelectedStaff: this.fb.control('', Validators.required),
  });
  timeSlots = [
    { time: '09:00', status: 'Còn chỗ' },
    { time: '10:00', status: 'Còn chỗ' },
    { time: '11:00', status: 'Còn chỗ' },
    { time: '12:00', status: 'Còn chỗ' },
    { time: '13:00', status: 'Còn chỗ' },
    { time: '14:00', status: 'Còn chỗ' },
    { time: '15:00', status: 'Còn chỗ' },
    { time: '16:00', status: 'Còn chỗ' },
    { time: '17:00', status: 'Còn chỗ' },
    { time: '18:00', status: 'Còn chỗ' },
    { time: '19:00', status: 'Còn chỗ' },
    { time: '20:00', status: 'Còn chỗ' },
  ];

  selectedTime: string | null = null;
  ngOnInit(): void {
    this.getService();
  }
  selectTime(time: string) {
    this.selectedTime = time;
    if (this.validateForm.value.date !== null) {
      this.timeStart = new Date(`${this.validateForm.value.date}T${time}`);
    } else {
      this.toastr.warning('Vui lòng chọn ngày ở phía trên');
    }
  }

  onChange(result: Date): void {
    console.log('onChange: ', result);
  }

  getStaffByServiceId(serviceIds: Service[]) {
    let totalTimeService = 0;
    let totalMoneyService = 0;
    serviceIds.forEach((s) => {
      totalTimeService += s.workTime ?? 0;
      totalMoneyService += s.sellingPrice ?? 0;
    });
    this.totalTime = totalTimeService;
    this.TotalMoney = totalMoneyService;

    let idList = serviceIds.map((service) => service.serviceId);
    console.log('hihi', idList);
    this.httpStaff.getStaffByServiceId(idList).subscribe({
      next: (data) => {
        if (data.success) {
          this.staffList = data.data;
          console.log(this.staffList);
        } else {
          this.toastr.error(data.message);
        }
      },
      error: (err) => {
        this.toastr.error(err);
      },
    });
  }

  submitForm(): void {
    if (this.validateForm.valid) {
    
    } else {
      Object.values(this.validateForm.controls).forEach((control) => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
    }
  }

  getService(): void {
    this.httpStaff.getService().subscribe({
      next: (data) => {
        if (data.success) {
          this.serviceList = data.data;
        } else {
          this.toastr.error(data.message);
        }
      },
      error: (error: any) => {
        this.toastr.error(error);
      },
    });
  }
}
