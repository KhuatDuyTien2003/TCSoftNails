import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { StaffByServiceId } from '../../../app.type/StaffByServiceId.type';
import { HttpStaffService } from '../../../services/http-staff.service';
import { Service } from '../../../app.type/service.type';
import { ToastrService } from 'ngx-toastr';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AppointmentDetailModel } from '../../../app.type/Appointment.type';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { AppointmentSent } from '../../../app.type/AppointmentSent.type';
import { timePick } from '../../../app.type/timePick.type';

@Component({
  selector: 'app-form-update',
  standalone: true,
  templateUrl: './form-update.component.html',
  styleUrl: './form-update.component.scss',
  imports: [
    ReactiveFormsModule,

    NzButtonModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    RouterModule,
    CommonModule,
    NzIconModule,
    NzRadioModule,
  ],
})
export class FormUpdateComponent implements OnInit {
  @Output() getAppointments = new EventEmitter<void>();
  idAppointment: number = 0;
  isOpen: boolean = true;
  timeStartDefault: Date = new Date('1900-01-02T06:01');
  timeStart: Date = new Date();
  private fb = inject(NonNullableFormBuilder);
  validateForm = this.fb.group({
    numberPhone: this.fb.control('', [Validators.required]),
    customerName: this.fb.control('', [Validators.required]),
    email: this.fb.control('', [Validators.required]),
    gender: this.fb.control(true, [Validators.required]),
    description: this.fb.control('', [Validators.required]),
    listOfSelectedValue: this.fb.control<any[]>([], Validators.required),
    idStaff: this.fb.control(0, Validators.required),
    time: this.fb.control('', Validators.required),
    timeStart: this.fb.control(
      this.formatDate(new Date()),
      Validators.required
    ),
    status: this.fb.control(false),
  });
  timeAppointmentPicked: timePick[] = [];
  staffList: StaffByServiceId[] = [];
  totalTime: number = 0;
  TotalMoney: number = 0;
  serviceList: Service[] = [];
  status: boolean = false;

  timeSlots = [
    { time: '08:00', status: 'Còn chỗ' },
    { time: '09:00', status: 'Còn chỗ' },
    { time: '10:00', status: 'Còn chỗ' },
    { time: '11:00', status: 'Còn chỗ' },
    { time: '13:00', status: 'Còn chỗ' },
    { time: '14:00', status: 'Còn chỗ' },
    { time: '15:00', status: 'Còn chỗ' },
    { time: '16:00', status: 'Còn chỗ' },
    { time: '17:00', status: 'Còn chỗ' },
    { time: '18:00', status: 'Còn chỗ' },
    { time: '19:00', status: 'Còn chỗ' },
    { time: '20:00', status: 'Còn chỗ' },
  ];
  constructor(
    private httpStaff: HttpStaffService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.getService();
    this.getTimeAppointment();
  }

  openForm(
    numberPhone: string,
    customerName: string,
    email: string,
    gender: boolean,
    description: string,
    idStaff: number,
    timeStart: Date,
    service: AppointmentDetailModel[],
    idAppoint: number,
    status: boolean
  ) {
    var services: Service[] = [];
    for (let s of service) {
      let item = this.serviceList.find((i) => i.serviceId === s.idService);
      if (item) {
        services.push(item);
      }
    }
    this.getStaffByServiceId(services);
    let totalTimeService = 0;
    let totalMoneyService = 0;
    this.serviceList.forEach((s) => {
      totalTimeService += s.workTime ?? 0;
      totalMoneyService += s.sellingPrice ?? 0;
    });
    this.totalTime = totalTimeService;
    this.TotalMoney = totalMoneyService;
    const timeStartDate = new Date(timeStart);
    var form = document.getElementById('form-update');
    if (form?.classList.contains('hidden')) {
      form.classList.remove('hidden');
      this.validateForm.patchValue({
        customerName: customerName,
        numberPhone: numberPhone,
        idStaff: idStaff,
        email: email,
        gender: gender,
        description: description,
        time: `${timeStartDate.getHours()}:${timeStartDate.getMinutes()}0`,
        listOfSelectedValue: services,
        timeStart: this.formatDate(timeStartDate),
        status: status,
      });
      this.idAppointment = idAppoint;
    } else {
      form?.classList.add('hidden');
    }
    const date = new Date(timeStart);
    this.setFreeTime(date.toISOString());
  }

  getTimeAppointment() {
    this.httpStaff.getTimeAppointment().subscribe({
      next: (data) => {
        if (data.success) {
          this.timeAppointmentPicked = data.data;
        }
      },
      error: (err) => {
        this.toastr.error(err);
      },
    });
  }

  setFreeTime(day: string) {
    const pickDay = new Date(day);
    const pickTime = this.timeAppointmentPicked
      .filter((t) => {
        const start = new Date(t.startTime);
        const end = new Date(t.endTime);

        const sameDay =
          start.getFullYear() === pickDay.getFullYear() &&
          start.getMonth() === pickDay.getMonth() &&
          start.getDate() === pickDay.getDate() &&
          end.getFullYear() === pickDay.getFullYear() &&
          end.getMonth() === pickDay.getMonth() &&
          end.getDate() === pickDay.getDate();

        return sameDay;
      })
      .map((t) => {
        const timeStart = new Date(t.startTime).getHours();
        const timeEnd = new Date(t.endTime).getHours();

        if (isNaN(timeStart) || isNaN(timeEnd)) {
          console.error('Invalid time data:', t);
          return null;
        }

        return {
          timeStart,
          timeEnd,
        };
      })
      .filter(
        (item): item is { timeStart: number; timeEnd: number } => item !== null
      );
    console.log(pickDay, '   ', pickTime);
    this.timeSlots.forEach((time) => {
      const hours = parseInt(time.time.split(':')[0], 10);
      time.status = 'Còn trống';
      for (let item of pickTime) {
        if (hours >= item.timeStart && hours < item.timeEnd) {
          time.status = 'Đã đặt';
          break;
        }
      }
    });
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  }

  exit() {
    document.getElementById('form-update')?.classList.add('hidden');
  }
  onDelete() {
    if (document.getElementById('formDelete')?.classList.contains('hidden'))
      document.getElementById('formDelete')?.classList.remove('hidden');
    else document.getElementById('formDelete')?.classList.add('hidden');
  }
  deleteAppointment(id: number) {
    this.httpStaff.deleteAppointment(id).subscribe({
      next: (data) => {
        if (data.success) {
          this.toastr.success(data.message);
          this.exit();
          this.onDelete();
          this.getAppointments.emit();
        } else {
          this.toastr.error(data.message);
        }
      },
      error: (err) => {
        this.toastr.error(err);
      },
    });
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

    this.httpStaff.getStaffByServiceId(idList).subscribe({
      next: (data) => {
        if (data.success) {
          this.staffList = data.data;
        } else {
          this.toastr.error(data.message);
        }
      },
      error: (err) => {
        this.toastr.error(err);
      },
    });
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
  changeDate(time: string): Date | undefined {
    if (this.validateForm.value.timeStart !== null) {
      let timeStart: Date = new Date(
        `${this.validateForm.value.timeStart}T${time}`
      );
      this.timeStart = timeStart;
      return timeStart;
    } else {
      this.toastr.warning('Vui lòng chọn ngày ở phía trên');
      return undefined;
    }
  }
  onSubmit() {
    let startTime = this.timeStart ? new Date(this.timeStart) : new Date();
    let endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + this.totalTime);
    let model: AppointmentSent = {
      customerName: this.validateForm.value.customerName || '',
      description: this.validateForm.value.description || 'hihihahah',
      email: this.validateForm.value.email || '',
      idStaff: this.validateForm.value.idStaff || 0,
      status: this.validateForm.value.status || false,
      gender: this.validateForm.value.gender || false,
      numberPhone: this.validateForm.value.numberPhone || '',
      listOfSevice:
        this.validateForm.value.listOfSelectedValue?.map((s) => s.serviceId) ||
        [],
      startTime: startTime || new Date(),
      endTime: endTime,
    };
    this.httpStaff.updateAppointment(this.idAppointment, model).subscribe({
      next: (data) => {
        if (data.success) {
          this.validateForm.reset({
            numberPhone: '',
            customerName: '',
            email: '',
            gender: true,
            description: '',

            listOfSelectedValue: [],
            idStaff: 0,
            time: '',
            timeStart: this.formatDate(new Date()),
            status: false,
          });
          this.getAppointments.emit();
          this.exit();
        }
      },
    });
  }
}
