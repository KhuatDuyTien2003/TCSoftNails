import { PriceList, PriceListDetail } from './../../../app.type/PriceList.type';
import { customer } from './../../../app.type/customer.type';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {
  FormArray,
  FormsModule,
  NonNullableFormBuilder,
  ReactiveFormsModule,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CategoryBill } from '../../../app.type/CategoryBill.type';
import { HttpBillService } from '../../../services/http-bill.service';
import { ToastrService } from 'ngx-toastr';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { HttpStaffService } from '../../../services/http-staff.service';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { StaffByServiceId } from '../../../app.type/StaffByServiceId.type';
import { debounceTime, of, Subject, switchMap, tap } from 'rxjs';
import { HttpCustomerService } from '../../../services/http-customer.service';
import { searchCustomerType } from '../../../app.type/searchCustomerType.type';
import { PaymentComponent } from '../payment/payment.component';
import { VncurrencyPipe } from '../../../pipe/vncurrency.pipe';
import { subscribe } from 'node:diagnostics_channel';
import {
  BillResponse,
  BillResponseDetail,
} from '../../../app.type/BillResponse.type';
import { BillDetailSend, BillSend } from '../../../app.type/BillSend.type';
import { log } from 'node:console';
@Component({
  selector: 'app-add-receipt',
  standalone: true,
  templateUrl: './add-receipt.component.html',
  styleUrl: './add-receipt.component.scss',
  imports: [
    NzIconModule,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    CommonModule,
    VncurrencyPipe,
    RouterModule,
    NzSelectModule,
    NzRadioModule,
    ReactiveFormsModule,
    PaymentComponent,
  ],
})
export class AddReceiptComponent implements OnInit {
  billIdForcus: number = 0;
  billUnpaidList: BillResponse[] = [];
  selectUnpaidBill: BillResponse = {
    billId: 100,
    billSendDetails: [],
    billDate: new Date(),
    customerName: 'Khách lẻ',
  };
  @ViewChild(PaymentComponent) GetPayment?: PaymentComponent;
  productList: CategoryBill[] = [];
  productSelects: CategoryBill[] = [];
  loadingSearch: boolean = false;
  loadingSearchCus: boolean = false;
  productSearch: number = 0;
  priceList: PriceList[] = [];
  priceSelect: PriceListDetail[] | null = null;
  selectCustomer: customer = {
    birthday: null,
    customerId: 100,
    customerName: 'Khách lẻ',
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
  modelCusSearch: searchCustomerType = {
    keyword: null,
    fromDate: null,
    gender: null,
    rankId: null,
    page: 1,
    pageSize: 10,
    toDate: null,
  };
  customerSearch: number = 0;
  customerSearchList: customer[] = [];
  staffByServiceMap: { [serviceId: number]: StaffByServiceId[] } = {};
  private fb = inject(NonNullableFormBuilder);
  form = this.fb.group({
    selects: this.fb.array(
      this.productSelects.map(() => this.fb.control(null))
    ),
  });

  ProductSearchList: CategoryBill[] = [];
  type: number = 1;
  searchInput$ = new Subject<string>();
  searchCustomerInput$ = new Subject<string>();
  updateBill$ = new Subject<BillSend[]>();
  constructor(
    private httpBill: HttpBillService,
    private toastr: ToastrService,
    private httpStaff: HttpStaffService,
    private httpCustomer: HttpCustomerService,
    private router: ActivatedRoute
  ) {}
  ngOnInit(): void {
    this.createNewBill();
    this.router.queryParams.subscribe((params) => {
      const id = params['billId'];
      this.billIdForcus = id ? +id : 0;
    });
    this.updateOverdueBills();
    this.getServiceAndProduct(1);
    this.getBillUnpaid();
    this.searchInput$
      .pipe(
        debounceTime(400),
        switchMap((name) => {
          if (name === '') {
            this.loadingSearch = false;
            return of([]);
          }
          this.loadingSearch = true;
          return this.httpBill.searchProduct(name);
        })
      )
      .subscribe({
        next: (data: any) => {
          if (data.success) {
            this.ProductSearchList = data.data;
          } else {
            this.toastr.error(data.message);
          }
          this.loadingSearch = false;
        },
        error: (err) => {
          this.toastr.error(err);
          this.loadingSearch = false;
        },
      });
    this.searchCustomerInput$
      .pipe(
        debounceTime(400),
        tap(() => (this.loadingSearch = true)),
        switchMap((keyword) => {
          if (keyword === '') {
            this.modelCusSearch.keyword = null;
          } else {
            this.modelCusSearch.keyword = keyword;
          }

          return this.httpCustomer.searchCustomer(this.modelCusSearch);
        })
      )
      .subscribe({
        next: (data) => {
          if ('data' in data) {
            this.customerSearchList = data.data;
          } else {
            this.customerSearchList = [];
          }
          this.loadingSearch = false;
        },
        error: (err) => {
          this.toastr.error(err);
          this.loadingSearch = false;
        },
      });
    this.updateBill$
      .pipe(
        debounceTime(3000),
        switchMap((bills) => {
          return this.httpBill.updateMultipleBills(bills);
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
          } else {
            this.toastr.error(response.message);
          }
        },
        error: (err) => {
          this.toastr.error(err);
        },
      });
  }

  get selects(): FormArray {
    return this.form.get('selects') as FormArray;
  }

  public getServiceAndProduct(type: number) {
    this.type = type;
    this.httpBill.getServiceAndProduct(type).subscribe({
      next: (data) => {
        if (data.success) {
          this.productList = data.data;
        } else this.toastr.error(data.message);
      },
      error: (err) => this.toastr.error(err),
    });
  }

  public selectProduct(id: number) {
    const product = this.productList.find((p) => p.id === id);

    if (!product) return;

    if (this.type !== 2) {
      if (product.unitStock === undefined || product.unitStock <= 0) {
        this.toastr.error('Sản phẩm đã hết hàng');
        return;
      }
    } else {
      this.getStaffByService(id);
    }
    const model = this.productSelects.find((p) => p.id === id);
    if (model) {
      model.unitStock = (model.unitStock ?? 0) + 1;
    } else {
      const clone = { ...product, unitStock: 1 };
      this.productSelects.push(clone);
    }
  }
  public selectProductSearch(id: number) {
    const product = this.ProductSearchList.find((p) => p.id === id);

    if (!product) return;

    if (product.type !== 2) {
      if (product.unitStock === undefined || product.unitStock <= 0) {
        this.toastr.error('Sản phẩm đã hết hàng');
        return;
      }
    }
    const model = this.productSelects.find((p) => p.id === id);
    if (model) {
      model.unitStock = (model.unitStock ?? 0) + 1;
    } else {
      const clone = { ...product, unitStock: 1 };
      this.getStaffByService(id);
      this.productSelects.push(clone);
    }
  }

  public plusUnit(id: number) {
    let product = this.productSelects.find((p) => p.id == id);
    if (product) {
      product.unitStock = (product.unitStock ?? 0) + 1;
    }
  }
  public minusUnit(id: number) {
    let product = this.productSelects.find((p) => p.id == id);
    if (product && (product.unitStock ?? 0) > 0) {
      product.unitStock = (product.unitStock ?? 0) - 1;
    }
  }
  public getStaffByService(id: number) {
    const ids: number[] = [id];

    this.httpStaff.getStaffByServiceId(ids).subscribe({
      next: (data) => {
        if (data.success) {
          this.staffByServiceMap[id] = data.data;
        } else {
          this.toastr.error(data.message);
        }
      },
      error: (err) => this.toastr.error(err),
    });
  }

  public onSearch(name: string) {
    this.searchInput$.next(name);
  }
  public onSearchCustomer(name: string) {
    this.searchCustomerInput$.next(name);
  }

  selectCustomerSearch(id: number) {
    const customer = this.customerSearchList.find((c) => c.customerId === id);
    if (customer) {
      this.selectCustomer = customer;
    }
  }

  getPriceListByIdCustomer(id: number) {
    var rankId = this.selectCustomer.rankId;

    this.httpBill.getPriceListByIdCustomer(rankId || 100).subscribe({
      next: (data) => {
        if (data.success) {
          this.priceList = data.data;
        }
      },
      error: (err) => {},
    });
  }

  selectPriceListDetail() {
    this.productSelects.forEach((ps) => {
      if (this.priceSelect && Array.isArray(this.priceSelect)) {
        const match = this.priceSelect.find((item) => item.productId === ps.id);
        if (match) {
          ps.price = match.sellPrice;
        }
      }
    });
  }

  getTotalPrice() {
    return this.productSelects.reduce((total, item) => {
      const price = item.price ?? 0;
      const unit = item.unitStock ?? 0;
      return total + price * unit;
    }, 0);
  }
  updateOverdueBills() {
    let day = localStorage.getItem('dayUpdateBill');
    let dateUpdate = day ? new Date(day) : null;

    const today = toDateOnly(new Date());
    const savedDay = dateUpdate ? toDateOnly(dateUpdate) : null;

    if (!savedDay || savedDay < today) {
      this.httpBill.updateOverdueBill().subscribe({
        next: (data) => {
          if (data.success) {
            localStorage.setItem('dayUpdateBill', new Date().toISOString());
          }
        },
        error: (err) => {
          console.error('Lỗi cập nhật hóa đơn quá hạn:', err);
        },
      });
    }

    function toDateOnly(date: Date): Date {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
  }

  getPayment() {
    if (this.GetPayment) {
      this.GetPayment.setHidden();
    }
  }

  setKhachLe(id: number) {
    console.log(id);
    const input = document.getElementById('cus') as HTMLInputElement;
    if (input?.checked) {
      this.selectCustomer = {
        birthday: null,
        customerId: 100,
        customerName: 'Khách lẻ',
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

      this.updateCustomerBillLocal(id);
    }
  }

  getBillUnpaid() {
    this.httpBill.getBillUnpaid().subscribe({
      next: (data) => {
        if (data.success) {
          this.billUnpaidList = data.data;
        }
      },
    });
  }

  createNewBill() {
    //tạo 1 hóa đơn ko có dữ liệu
    this.httpBill.createNewBill().subscribe({
      next: (data) => {
        if (data.success) {
          this.billIdForcus = data.data;
          this.getBillUnpaid();
        }
      },
      error: (err) => this.toastr.error(err),
    });
  }

  changeBill(id: number) {
    this.customerSearch = 0;
    this.onSearchCustomer('');
    this.billIdForcus = id;
    const input = document.getElementById('cus') as HTMLInputElement | null;
    if (input) {
      input.checked = false;
    }
    this.selectUnpaidBill = this.billUnpaidList?.find(
      (b) => b.billId === id
    ) ?? {
      billId: 0,
      billSendDetails: [],
      billDate: new Date(),
      customerName: '',
    };
    this.selectCustomer = this.customerSearchList.find(
      (c) => c.customerId === this.selectUnpaidBill.customerId
    ) ?? {
      customerId: 100,
      customerName: 'Khách lẻ',
      birthday: null,
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

    this.productSelects = [];
    for (let item of this.selectUnpaidBill.billSendDetails) {
      let product: CategoryBill = {
        id: item.proAndSerId || 0,
        idWorker: item.serviceStaffId,
        name: item.proAndSerName,
        price: item.unitPrice,
        type: 1,
        unitStock: item.quantity,
        workerId: item.serviceStaffId,
        workTime: '30',
        urlImage: 'no',
      };
      this.productSelects.push(product);
    }
  }

  updateCustomerBillLocal(id: number) {
    const input = document.getElementById('cus') as HTMLInputElement | null;
    if (input?.checked) {
      input.checked = false;
    }
    let item = this.billUnpaidList.find((b) => b.billId === id);
    if (item) {
      item.customerId = this.selectCustomer.customerId || 100;
      item.customerName = this.selectCustomer.customerName || 'Khách lẻ';
      item.numberPhone = this.selectCustomer.numberPhone || '';
      this.updateRange();
    }
  }

  updateProductBillLocal(id: number) {
    let item = this.billUnpaidList.find((b) => b.billId === id);
    if (item) {
      item.billSendDetails = [];
      for (let prod of this.productSelects) {
        let p: BillResponseDetail = {
          proAndSerId: prod.id,
          proAndSerName: prod.name,
          quantity: prod.unitStock,
          serviceStaffId: prod.idWorker,
          serviceStaffName: 'sd',
          unitPrice: prod.price,
          totalMoney: (prod.price ?? 0) * (prod.unitStock ?? 0),
        };
        item.billSendDetails.push(p);
      }
    }

    this.updateRange();
  }

  updateRange() {
    console.log('da vao');
    var newBills: BillSend[] = [];
    for (let item of this.billUnpaidList) {
      let bill: BillSend = {
        billId: item.billId,
        customerId: item.customerId === null ? 100 : item.customerId,
        billDetails: [],
      };
      for (let prod of item.billSendDetails) {
        if (prod.proAndSerId !== null) {
          let p: BillDetailSend = {
            billId: item.billId,
            proAndSerId: prod.proAndSerId,
            quantity: prod.quantity,
            staffId: prod.serviceStaffId,
            unitPrice: prod.unitPrice,
            totalMoney: prod.totalMoney,
          };
          bill.billDetails?.push(p);
        }
      }
      newBills.push(bill);
    }
    this.updateBill$.next(newBills);
  }

  removeProduct(id: number) {
    this.productSelects = this.productSelects.filter((item) => item.id !== id);
  }

  delBill(id: number) {
    console.log('hi', id);
    this.httpBill.delBill(id).subscribe({
      next: (data) => {
        if (data.success) {
          this.toastr.success(data.message);
          this.getBillUnpaid();
        } else {
          this.toastr.error(data.message);
        }
      },
      error: (err) => this.toastr.error(err),
    });
  }
}
