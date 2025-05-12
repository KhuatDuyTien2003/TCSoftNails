import { customer } from './../../../app.type/customer.type';
import { product } from './../../../app.type/product.type';
import { Component, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { CategoryBill } from '../../../app.type/CategoryBill.type';
import { CommonModule } from '@angular/common';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { Promotion } from '../../../app.type/Promotion.type';
import { HttpBillService } from '../../../services/http-bill.service';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, of, Subject, switchMap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { VncurrencyPipe } from '../../../pipe/vncurrency.pipe';
import { BillDetailSend, BillSend } from '../../../app.type/BillSend.type';
import { Receipt } from '../../../app.type/receipt.type';
import { ReceiptComponent } from '../receipt/receipt.component';

@Component({
  selector: 'app-payment',
  standalone: true,
  templateUrl: './payment.component.html',
  styleUrl: './payment.component.scss',
  imports: [
    NzIconModule,
    CommonModule,
    NzSelectModule,
    FormsModule,
    VncurrencyPipe,
    ReceiptComponent,
  ],
})
export class PaymentComponent implements OnChanges, OnInit {
  selectedPayType: boolean = false;
  isPoint: boolean = false;
  @Input() CustomerSelect: customer = {
    birthday: null,
    customerId: null,
    customerName: null,
    email: null,
    gender: false,
    numberPhone: null,
    password: null,
    rankId: null,
    rankName: null,
    totalMoney: null,
    totalPoints: null,
    urlAvatar: null,
    userName: null,
  };

  totalDiscount: number | null = null;
  private _productSelects: CategoryBill[] = [];
  promotionList: Promotion[] = [];
  promotionSelect: Promotion = {
    promotionId: 0,
    condition: undefined,
    isPoints: true,
    productTypeId: undefined,
    promotionName: undefined,
    promotionType: undefined,
    quantity: undefined,
    rankId: undefined,
    urlImage: undefined,
    value_data: undefined,
  };
  receipt: Receipt = {
    customerName: '',
    numberPhone: '',
    receiptDetails: [],
    receiption: '',
    promotion: 0,
    totalMoney: 0,
    receiptDay: new Date(),
  };
  @Input()
  set ProductSelects(value: CategoryBill[]) {
    this._productSelects = value ?? [];
    this.getTotalMoney();
  }
  @ViewChild(ReceiptComponent) print!: ReceiptComponent;
  searchInput$ = new Subject<string>();
  loadingSearch: boolean = false;
  constructor(
    private httpBill: HttpBillService,
    private toastr: ToastrService
  ) {}
  get ProductSelects(): CategoryBill[] {
    return this._productSelects;
  }
  today = Date.now();
  totalMoney: number = 0;
  ngOnInit(): void {
    this.searchInput$
      .pipe(
        debounceTime(400),
        switchMap((code) => {
          if (code === '') {
            this.loadingSearch = false;
            return of([]);
          }
          this.loadingSearch = true;
          return this.httpBill.getPromotionByCode(code);
        })
      )
      .subscribe({
        next: (data: any) => {
          if (data.success) {
            this.promotionList = data.data;
          }
          this.loadingSearch = false;
        },
        error: (err) => {
          this.toastr.error(err);
          this.loadingSearch = false;
        },
      });
  }
  getPromotionByCode(code: string) {
    this.searchInput$.next(code);
  }
  ngOnChanges() {
    this.getTotalMoney();
  }

  getTotalMoney() {
    this.totalMoney = this.ProductSelects?.reduce(
      (sum, p) => sum + (p.unitStock ?? 0) * (p.price ?? 0),
      0
    );
  }

  createBill() {
    var model: BillSend = {
      billId: 0,
      customerId: this.CustomerSelect.customerId || 100,
      moneyPoint: this.isPoint
        ? (this.CustomerSelect.totalPoints || 0) * 1000
        : 0,
      isPay: true,
      paymentId: this.selectedPayType,
      points: this.isPoint ? this.CustomerSelect.totalPoints || 0 : 0,
      promotionId: this.promotionSelect.promotionId,
      receptionistId: Number(localStorage.getItem('staffId')) || 0,
      totalDiscount: this.totalDiscount || 0,
      totalMoney: this.totalMoney,
      billStatus: 1,
      totalMoneyAfterDiscount:
        this.totalMoney -
        (this.isPoint ? (this.CustomerSelect.totalPoints || 0) * 1000 : 0) -
        (this.totalDiscount || 0),
      billDetails: [],
    };

    for (let product of this.ProductSelects) {
      let item: BillDetailSend = {
        billId: 0,
        proAndSerId: product.id,
        quantity: product.unitStock,
        staffId: product.idWorker,
        totalMoney: (product.price || 0) * (product.unitStock || 0),
        unitPrice: product.price,
      };
      model.billDetails?.push(item);
    }
    console.log(model);
    this.httpBill.createBill(model).subscribe({
      next: (data) => {
        if (data.success) {
          this.toastr.success(data.message);
          this.printBill();
        } else this.toastr.error(data.message);
      },
      error: (err) => this.toastr.error(err),
    });
  }

  trackByFn(index: number, item: any): any {
    return item.id;
  }

  calculateDiscount() {
    this.promotionSelect?.promotionId === 0
      ? (this.totalDiscount =
          ((this.promotionSelect?.value_data ?? 0) / 100) *
          (this.totalMoney ?? 0))
      : (this.totalDiscount = this.promotionSelect?.value_data ?? 0);
  }

  setHidden() {
    if (document.getElementById('hidden')?.classList.contains('hidden')) {
      document.getElementById('hidden')?.classList.remove('hidden');
      this.getTotalMoney();
    } else document.getElementById('hidden')?.classList.add('hidden');
  }

  printBill() {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Không thể mở cửa sổ in. Vui lòng kiểm tra trình duyệt.');
      return;
    }

    const htmlContent = `
    <html>
      <head>
        <title>In Hóa Đơn</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            color: #000;
          }
          h1 {
            text-align: center;
            font-size: 18pt;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 12pt;
          }
          th, td {
            border: 1px solid black;
            padding: 6px;
            text-align: center;
          }
          .footer {
            margin-top: 30px;
            text-align: right;
          }
          .info {
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div style="text-align: left; font-size: 10pt;">
            <div>Địa chỉ: Định Công, Thanh Xuân, Hà Nội</div>
            <div>Điện thoại: 0987654321</div>
          </div>
          <h1>HÓA ĐƠN DỊCH VỤ</h1>
          <div style="text-align: left; font-size: 11pt;">
            <div>Tên khách hàng: ${this.CustomerSelect.customerName}</div>
            <div>SĐT: ${this.CustomerSelect.numberPhone}</div>
          </div>
        </div>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Tên dịch vụ/Sản phẩm</th>
              <th>Số lượng</th>
              <th>Đơn giá</th>
              <th>Giảm giá</th>
              <th>Người làm</th>
              <th>Tổng tiền</th>
            </tr>
          </thead>
          <tbody>
            ${this.ProductSelects.map(
              (item, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${item.name}</td>
                <td>${item.unitStock}</td>
                <td>${item.price}</td>
                <td>${this.promotionSelect.value_data ?? 0}</td>
                <td>${item.idWorker}</td>
                <td>${(item.price ?? 0) * (item.unitStock ?? 0)}</td>
              </tr>`
            ).join('')}
          </tbody>
        </table>
        <div class="info">
          <p>Tổng tiền: ${this.totalMoney}</p>
          <p>Giảm giá: ${this.totalDiscount}</p>
          <p>Tổng tiền sau khi giảm giá: ${
            this.totalMoney - (this.totalDiscount ?? 0)
          }</p>
        </div>
        <div class="footer">
          <p>Hà nội, ngày ${new Date().getDate()} tháng ${
      new Date().getMonth() + 1
    } năm ${new Date().getFullYear()}</p>
          <p>Người tạo hóa đơn</p>
          <p><strong>Khuất Văn A</strong></p>
        </div>
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
