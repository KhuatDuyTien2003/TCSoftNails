import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
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
export class FormAppointmentComponent {
  constructor(private toastr: ToastrService) {}
  timeStart: Date | null= null;
  timeStartDefault: Date = new Date('1900-01-02T06:01');
  serviceList = [
    { id: 'DV001', name: 'Cắt tóc nam', price: 50000, time: '30 phút' },
    { id: 'DV002', name: 'Gội đầu', price: 30000, time: '15 phút' },
    { id: 'DV003', name: 'Nhuộm tóc', price: 150000, time: '1 tiếng' },
    { id: 'DV004', name: 'Cạo mặt', price: 40000, time: '20 phút' },
    { id: 'DV005', name: 'Massage đầu', price: 60000, time: '25 phút' },
  ];
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
}
