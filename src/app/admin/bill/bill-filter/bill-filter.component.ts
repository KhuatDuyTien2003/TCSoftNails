import { CommonModule } from '@angular/common';
import { Component, OnInit, Output } from '@angular/core';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';

import { FormsModule } from '@angular/forms';
import { SearchBill } from '../../../app.type/SearchBill.type';
import { HttpBillService } from '../../../services/http-bill.service';
import { ToastrModule } from 'ngx-toastr';
import { EventEmitter } from '@angular/core';
import { BillResponse } from '../../../app.type/BillResponse.type';
import {
  catchError,
  debounce,
  debounceTime,
  of,
  Subject,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-bill-filter',
  standalone: true,
  templateUrl: './bill-filter.component.html',
  styleUrl: './bill-filter.component.scss',
  imports: [CommonModule, NzDatePickerModule, NzSelectModule, FormsModule],
})
export class BillFilterComponent implements OnInit {
  timeSelect: string = '';
  date: Date = new Date();
  searchModel: SearchBill = {
    billId: null,
    customerName: null,
    payment: null,
    productName: null,
    receiption: null,
    statusBill: [],
    fromDate: null,
    toDate: null,
  };

  constructor(
    private httpBill: HttpBillService,
    private toastr: ToastrModule
  ) {}
  @Output() sendBill: EventEmitter<BillResponse[] | null> = new EventEmitter<
    BillResponse[] | null
  >();
  searchInput$ = new Subject<SearchBill>();
  ngOnInit(): void {
    this.searchInput$
      .pipe(
        debounceTime(400),
        switchMap((searchModel) =>
          this.httpBill.searchBill(searchModel).pipe(
            catchError((error) => {
              // nếu không có cái catch  thì switchMap sẽ bị hủy hoàn toàn  khi mà fetch bị lỗi
              console.error('Lỗi khi tìm hóa đơn:', error);
              this.sendBill.emit([]);
              return of({ success: false, data: [] });
            })
          )
        )
      )
      .subscribe({
        next: (data) => {
          this.sendBill.emit(data.data);
        },
      });
  }
  onChangeDate(dates: Date[]) {
    if (dates && dates.length === 2) {
      this.searchModel.fromDate = new Date(dates[0]);
      this.searchModel.toDate = new Date(dates[1]);
    } else {
      this.searchModel.fromDate = null;
      this.searchModel.toDate = null;
    }
    this.getSearchBill(this.searchModel);
  }

  setSearchModel(event: Event) {
    let today = new Date();

    var input = event.currentTarget as HTMLInputElement;
    switch (input.name) {
      case 'billId':
        this.searchModel.billId = input.value
          ? Number(input.value.toString())
          : null;
        this.getSearchBill(this.searchModel);
        break;
      case 'customerName':
        this.searchModel.customerName = input.value ? input.value : null;
        this.getSearchBill(this.searchModel);
        break;
      case 'productName':
        this.searchModel.productName = input.value ? input.value : null;
        this.getSearchBill(this.searchModel);
        break;
      case 'receiption':
        this.searchModel.receiption = input.value ? input.value : null;
        this.getSearchBill(this.searchModel);
        break;
      case 'ytd':
        let yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        this.searchModel.fromDate = yesterday;
        this.searchModel.toDate = yesterday;
        this.getSearchBill(this.searchModel);
        break;
      case 'today':
        this.searchModel.fromDate = today;
        this.searchModel.toDate = today;
        this.getSearchBill(this.searchModel);
        break;
      case 'week':
        const firstDayOfWeek = new Date(today);
        firstDayOfWeek.setDate(today.getDate() - today.getDay());
        const lastDayOfWeek = new Date(today);
        lastDayOfWeek.setDate(today.getDate() + (6 - today.getDay()));
        this.searchModel.fromDate = firstDayOfWeek;
        this.searchModel.toDate = lastDayOfWeek;
        this.getSearchBill(this.searchModel);
        break;
      case 'lastweek':
        const firstDayOfLastWeek = new Date(today);
        firstDayOfLastWeek.setDate(today.getDate() - today.getDay() - 7);
        const lastDayOfLastWeek = new Date(today);
        lastDayOfLastWeek.setDate(today.getDate() - today.getDay() - 1);
        this.searchModel.fromDate = firstDayOfLastWeek;
        this.searchModel.toDate = lastDayOfLastWeek;
        this.getSearchBill(this.searchModel);
        break;
    }
  }

  setSearchCheckBox(event: Event) {
    console.log('hwhw');
    var input = event.currentTarget as HTMLInputElement;
    switch (input.name) {
      case 'unpaid':
      case 'paid':
      case 'cancel':
      case 'overdue':
        if (input.checked)
          this.searchModel.statusBill?.push(Number(input.value));
        else if (this.searchModel.statusBill) {
          this.searchModel.statusBill = this.searchModel.statusBill.filter(
            (status) => status !== Number(input.value)
          );
        }
        this.getSearchBill(this.searchModel);
        break;
      case 'cash':
      case 'card':
        if (input.checked) this.searchModel.payment?.push(Number(input.value));
        else if (this.searchModel.payment) {
          this.searchModel.payment = this.searchModel.payment.filter(
            (status) => status !== Number(input.value)
          );
        }
        this.getSearchBill(this.searchModel);
        break;
    }
  }

  getSearchBill(search: SearchBill) {
    console.log('heheh');
    this.searchInput$.next({ ...search });
  }
}
