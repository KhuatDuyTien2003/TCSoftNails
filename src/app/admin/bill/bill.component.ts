import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { HttpBillService } from '../../services/http-bill.service';
import { ToastrService } from 'ngx-toastr';
import { BillResponse } from '../../app.type/BillResponse.type';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReceiptComponent } from './receipt/receipt.component';
import { Receipt } from '../../app.type/receipt.type';
import {
  NZ_ICON_DEFAULT_TWOTONE_COLOR,
  NzIconModule,
} from 'ng-zorro-antd/icon';
import {
  BillFilterComponent,
  emitBill,
} from './bill-filter/bill-filter.component';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'app-bill',
  standalone: true,
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.scss',
  imports: [
    HeaderComponent,
    CommonModule,

    ReceiptComponent,
    BillFilterComponent,
    NzPaginationModule,
    NzIconModule,
  ],
})
export class BillComponent implements OnInit {
  isSearch = false;
  page: number = 1;
  countPage: number = 100;
  totalPages: number = 10;
  currentPage: number = 1;
  currentSearchPage: number = 1;
  pageSize: number = 10;
  billList: BillResponse[] = [];
  @ViewChild(ReceiptComponent) printReceipt!: ReceiptComponent;
  receipt: Receipt = {
    customerName: '',
    numberPhone: '',
    receiptDetails: [],
    receiption: '',
    promotion: 0,
    totalMoney: 0,
    receiptDay: new Date(),
  };
  constructor(
    private httpBill: HttpBillService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}
  ngOnInit(): void {
    this.updateOverdueBills();
    this.httpBill.getAllBill(this.pageSize, this.currentPage).subscribe({
      next: (data) => {
        if (data.success) {
          console.log(data);
          this.billList = data.data;
          this.countPage = data.totalPage;
        }
      },
    });
  }

  EditBill(id: number) {
    this.router.navigate(['/bill/add-receipt'], {
      queryParams: { billId: id },
    });
  }

  onHiddenDetail(event: Event) {
    let parent = event.currentTarget as HTMLElement;
    let children = parent.nextElementSibling;
    if (children?.classList.contains('hidden')) {
      children.classList.remove('hidden');
    } else {
      children?.classList.add('hidden');
    }
  }

  updateOverdueBills() {
    let day = localStorage.getItem('dayUpdateBill') || '';
    let dateUpdate = new Date(day);
    if (!day || dateUpdate < new Date()) {
      this.httpBill.updateOverdueBill().subscribe({
        next: (data) => {
          if (data.success) {
            localStorage.setItem('dayUpdateBill', new Date().toISOString());
          }
        },
      });
    }
  }

  delBill(id: number) {
    this.httpBill.delBill(id).subscribe({
      next: (data) => {
        if (data.success) this.toastr.success(data.message);
        else this.toastr.error(data.message);
      },
      error: (err) => this.toastr.error(err),
    });
  }

  getBillSearch(bills: emitBill): void {
    this.isSearch = bills.status;
    this.billList = bills.billList;
  }

  sendReceipt(billId: number) {
    const model = this.billList.find((b) => b.billId === billId);
    this.receipt.customerName = model?.customerName || '';
    this.receipt.numberPhone = model?.numberPhone || '';
    this.receipt.receiption = model?.receptionName || '';
    this.receipt.receiptDetails = model?.billSendDetails || [];
    this.receipt.totalMoney = model?.totalBill || 0;
    this.receipt.promotion = model?.value_data || 0;
    this.receipt.receiptDay = model?.billDate || new Date();
    this.cdr.detectChanges();
    console.log(this.receipt);
    this.printReceipt.in();
  }
  public onPageChange(page: number): void {
    if (!this.isSearch) {
      this.currentPage = page;
      this.httpBill.getAllBill(this.pageSize, this.currentPage).subscribe({
        next: (data) => {
          if (data.success) {
            console.log(data.data);
            this.billList = data.data;
          }
        },
      });
    } else this.currentSearchPage = page;
  }
}
