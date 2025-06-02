import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Staff } from '../../../../app.type/Staff.type';
import { NzFormModule } from 'ng-zorro-antd/form';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { HttpStaffService } from '../../../../services/http-staff.service';

@Component({
  selector: 'app-staffreport-filter',
  standalone: true,
  templateUrl: './staffreport-filter.component.html',
  styleUrl: './staffreport-filter.component.scss',
  imports: [CommonModule, NzDatePickerModule, NzSelectModule, FormsModule],
})
export class StaffreportFilterComponent implements OnInit {
  date: Date = new Date();
  listStaff: Staff[] = [];
  listStaffId: number[] = [];

  constructor(private httpStaff: HttpStaffService) {}

  ngOnInit(): void {
    this.getStaff();
  }

  getStaff() {
    this.httpStaff.getAllStaff(1, 1000).subscribe({
      next: (data) => {
        if ('data' in data) {
          this.listStaff = data.data;
        }
      },
    });
  }
}
