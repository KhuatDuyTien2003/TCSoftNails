import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
import { HttpStaffService } from '../../services/http-staff.service';
import { Service } from '../../app.type/service.type';
import { StaffByServiceId } from '../../app.type/StaffByServiceId.type';

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
})
export class FormAppointmentComponent implements OnInit {
  constructor(
    private toastr: ToastrService,
    private httpStaff: HttpStaffService
  ) {}
  timeStart: Date | null = null;
  serviceList: Service[] = [];
  timeStartDefault: Date = new Date('1900-01-02T06:01');
  staffList: StaffByServiceId[] = [];

  private fb = inject(NonNullableFormBuilder);
  validateForm = this.fb.group({
    numberPhone: this.fb.control('', [Validators.required]),
    customerName: this.fb.control('', [Validators.required]),
    email: this.fb.control('', [Validators.required]),
    gender: this.fb.control('0', [Validators.required]),
    date: this.fb.control<Date | null>(null, [Validators.required]),
    listOfSelectedValue: this.fb.control([], Validators.required),
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

  getStaffByServiceId(serviceIds: number[]) {
    console.log('hihi');
    this.httpStaff.getStaffByServiceId(serviceIds).subscribe({
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
      console.log('submit', this.validateForm.value);
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
