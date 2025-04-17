import { customer } from './../../../app.type/customer.type';
import { WorkDate } from './../../../app.type/WorkDate.type';
import { Component, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NzOptionComponent, NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { HttpStaffService } from '../../../services/http-staff.service';
import { ToastrService } from 'ngx-toastr';
import { EventEmitter } from '@angular/core';
import { ResponseWorkDate } from '../../../app.type/ResponseWorkDate.Type';
@Component({
  selector: 'app-add-shift',
  standalone: true,
  templateUrl: './add-shift.component.html',
  styleUrl: './add-shift.component.scss',
  imports: [
    FormsModule,

    NzModalModule,
    NzCheckboxModule,
    NzSwitchModule,
    NzButtonModule,
    CommonModule,
    RouterModule,
    NzOptionComponent,
    NzDatePickerModule,
    NzSelectModule,
  ],
  encapsulation: ViewEncapsulation.None,
})
export class AddShiftComponent implements OnInit {
  @Output() dataEvent = new EventEmitter<ResponseWorkDate[]>();
  date = null;
  isVisible = false;
  repeatWeekly = false;
  scheduleOtherTasks = false;
  selectedShifts: string[] = [];
  selectedCustomer: number | string = '';
  staffId: number = 0;
  staffName: string = '';
  pickDate: Date = new Date('1990/09/09');
  weekCount: number = 1;

  isClosingByX = false;
  customerList: Omit<
    customer,
    | 'birthday'
    | 'email'
    | 'gender'
    | 'password'
    | 'rankId'
    | 'rankName'
    | 'totalMoney'
    | 'totalPoints'
    | 'urlAvatar'
    | 'userName'
  >[] = [];
  customerId: number | null = 4;
  shift: number | null = 10;
  isEdit: boolean | null = false;
  WorkDateId: number | null = null;
  constructor(
    private router: RouterModule,
    private httpStaff: HttpStaffService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  deleteCalendar(id: number) {
    this.httpStaff.deleteWorkDate(id).subscribe({
      next: (data) => {
        if (data.success) {
          this.toastr.success(data.message);
          this.httpStaff.getWorkDate().subscribe((data) => {
            if (data.success) {
              this.dataEvent.emit(data.data as ResponseWorkDate[]);
            }
          });
        } else {
          this.toastr.error(data.message);
        }
      },
      error: (err) => {
        this.toastr.error(err.message || 'Đã xảy ra lỗi khi tải khách hàng');
      },
    });
  }

  onChangeDate(result: Date): void {
    console.log('onChange: ', result);
    console.log(
      this.getWeekNumber(result) + '  ' + this.getWeekNumber(this.pickDate)
    );
    this.weekCount =
      this.getWeekNumber(result) - this.getWeekNumber(this.pickDate);
    console.log(this.weekCount);
  }

  private getWeekNumber(date: Date): number {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor(
      (date.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000)
    );
    return Math.ceil((days + startOfYear.getDay() + 1) / 7);
  }
  showModal(
    WorkDateId: null | number,
    staffId: number,
    nameStaff: string,
    date: Date,
    customerId: number | null,
    shift: number | null,
    customerName: string | null,
    isEdit: boolean
  ): void {
    this.isVisible = isEdit;
    this.staffId = staffId;
    this.staffName = nameStaff;
    this.pickDate = date;
    this.isEdit = isEdit;
    this.customerId = customerId || null;
    this.shift = shift;
    this.selectedCustomer = customerId || 100;
    this.WorkDateId = WorkDateId;
    if (isEdit) {
      this.isVisible = false;
      document.getElementById('deleteDiv')?.classList.remove('hidden');
    } else {
      this.isVisible = true;
      document.getElementById('deleteDiv')?.classList.add('hidden');
    }
  }
  handleCloseDelete() {
    document.getElementById('deleteDiv')?.classList.add('hidden');
  }

  handleClose(): void {
    console.log('Đóng bằng dấu X');
    this.isVisible = false;
  }

  handleCancel(): void {
    console.log(this.WorkDateId !== null ? 'Thực hiện XÓA' : 'Thực hiện HỦY');
    if (this.WorkDateId !== null) {
      this.deleteCalendar(this.WorkDateId);
    }
    this.isVisible = false;
  }
  handleDelete() {
    if (this.WorkDateId !== null) {
      this.deleteCalendar(this.WorkDateId);
      this.handleCloseDelete();
    }
  }
  handleOk(): void {
    this.isVisible = false;
    this.createCalendar(this.weekCount);
    document.getElementById('deleteDiv')?.classList.add('hidden');
  }

  public createCalendar(weekCount: number) {
    for (let week = 0; week < weekCount; week++) {
      for (let i = 0; i < this.selectedShifts.length; i++) {
        let schedule: WorkDate = {
          workScheduleId: 100,
          customerId: null,
          staffId: this.staffId,
          staffName: null,
          customerName: null,
          shift: Number(this.selectedShifts[i]),

          workDate: this.addWeeks(this.pickDate, week),
          isDone: false,
        };
        this.httpStaff.createCalendar(schedule).subscribe((data) => {
          if (data.success) {
            this.toastr.success(data.message);
            if (week === weekCount - 1) {
              this.httpStaff.getWorkDate().subscribe((data) => {
                if (data.success) {
                  this.dataEvent.emit(data.data as ResponseWorkDate[]);
                }
              });
            }
          } else {
            this.toastr.error(data.message);
          }
        });
      }
    }
  }

  private addWeeks(date: Date, weeks: number): Date {
    let result = new Date(date);
    result.setDate(result.getDate() + weeks * 7);
    return result;
  }

  onShiftChange(values: string[]): void {
    this.selectedShifts = values;
  }
  getCustomers() {
    this.httpStaff.getCustomer().subscribe((data) => {
      if (data.success) this.customerList = data.data;
    });
  }
}
