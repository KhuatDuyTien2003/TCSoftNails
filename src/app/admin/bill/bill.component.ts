import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { HttpBillService } from '../../services/http-bill.service';
import { ToastrService } from 'ngx-toastr';
import { BillResponse } from '../../app.type/BillResponse.type';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ReceiptComponent } from './receipt/receipt.component';
import { Receipt } from '../../app.type/receipt.type';
import { BillFilterComponent } from './bill-filter/bill-filter.component';
import { error } from 'console';

@Component({
  selector: 'app-bill',
  standalone: true,
  templateUrl: './bill.component.html',
  styleUrl: './bill.component.scss',
  imports: [
    HeaderComponent,
    CommonModule,
    RouterModule,
    ReceiptComponent,
    BillFilterComponent,
  ],
})
export class BillComponent implements OnInit {
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
    private cdr: ChangeDetectorRef
  ) {}
  ngOnInit(): void {
    this.httpBill.getAllBill().subscribe({
      next: (data) => {
        if (data.success) {
          console.log(data.data);
          this.billList = data.data;
        }
      },
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

  delBill(id: number) {
    this.httpBill.delBill(id).subscribe({
      next: (data) => {
        if (data.success) this.toastr.success(data.message);
        else this.toastr.error(data.message);
      },
      error: (err) => this.toastr.error(err),
    });
  }

  getBillSearch(bills: BillResponse[] | null): void {
    console.log('value: ', bills);
    this.billList = bills || [];
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
  // ngAfterViewInit(): void {
  //   setTimeout(() => {
  //     this.printReceipt.in();
  //   }, 0);
  // }
}
