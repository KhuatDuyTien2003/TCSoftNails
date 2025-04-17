import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Output } from '@angular/core';
import {
  AbstractControl,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
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
import { Toast, ToastrService } from 'ngx-toastr';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {
  Appointment,
  AppointmentDetailModel,
} from '../../../app.type/Appointment.type';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { AppointmentSent } from '../../../app.type/AppointmentSent.type';

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
  //  @Output() getAppointments = new EventEmitter<void>();
  idAppointment: number = 0;
  isOpen: boolean = true;
  private fb = inject(NonNullableFormBuilder);
  validateForm = this.fb.group({
    numberPhone: this.fb.control('', [Validators.required]),
    customerName: this.fb.control('', [Validators.required]),
    email: this.fb.control('', [Validators.required]),
    gender: this.fb.control(false, [Validators.required]),
    description: this.fb.control('', [Validators.required]),
    date: this.fb.control<Date | null>(null, [Validators.required]),
    listOfSelectedValue: this.fb.control<any[]>([], Validators.required),
    idStaff: this.fb.control(0, Validators.required),
    time: this.fb.control('', Validators.required),
    timeStart: this.fb.control(
      this.formatDate(new Date()),
      Validators.required
    ),
    status: this.fb.control(false),
  });

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
  }

  openForm(
    numberPhone: string,
    customerName: string,
    email: string,
    gender: number,
    description: string,
    idStaff: number,
    timeStart: Date,
    service: AppointmentDetailModel[],
    idAppoint: number
  ) {
    var services: Service[] = [];

    for (let s of service) {
      let item = this.serviceList.find((i) => i.serviceId === s.idService);
      if (item) {
        services.push(item);
      }
    }
    this.getStaffByServiceId(services);
    const timeStartDate = new Date(timeStart);
    console.log(`${timeStartDate.getHours()}:${timeStartDate.getMinutes()}`);
    var form = document.getElementById('form-update');
    if (form?.classList.contains('hidden')) {
      form.classList.remove('hidden');
      console.log(idStaff);
      this.validateForm.patchValue({
        customerName: customerName,
        numberPhone: numberPhone,
        idStaff: idStaff,
        email: email,
        gender: gender === 0 ? false : true,
        description: description,
        time: `${timeStartDate.getHours()}:${timeStartDate.getMinutes()}0`,
        listOfSelectedValue: services,
        timeStart: this.formatDate(timeStartDate),
      });
      this.idAppointment = idAppoint;
    } else {
      form?.classList.add('hidden');
    }
  }

  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = ('0' + (date.getMonth() + 1)).slice(-2); // thêm 0 nếu < 10
    const day = ('0' + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`; // yyyy-MM-dd
  }

  exit() {
    document.getElementById('form-update')?.classList.add('hidden');
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

  onSubmit() {
    let endTime = new Date(
      this.validateForm.value.timeStart || '2025-04-14T10:30:00'
    );
    endTime.setMinutes(endTime.getMinutes() + this.totalTime);
    let model: AppointmentSent = {
      customerName: this.validateForm.value.customerName || '',
      description: this.validateForm.value.description || '',
      email: this.validateForm.value.email || '',
      idStaff: this.validateForm.value.idStaff || 0,
      gender: this.validateForm.value.gender || false,
      numberPhone: this.validateForm.value.numberPhone || '',
      listOfSevice: this.validateForm.value.listOfSelectedValue || [],
      startTime: new Date(
        this.validateForm.value.timeStart || '2025-04-14T10:30:00'
      ),
      endTime: endTime,
    };
    this.httpStaff.updateAppointment(this.idAppointment, model).subscribe({
      next: (data) => {
        if (data.success) {
          this.exit();
        }
      },
    });
  }
}
