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
import { RouterModule } from '@angular/router';
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
  constructor(
    private httpBill: HttpBillService,
    private toastr: ToastrService,
    private httpStaff: HttpStaffService,
    private httpCustomer: HttpCustomerService
  ) {}
  ngOnInit(): void {
    this.getServiceAndProduct(1);
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
            return of([]);
          }
          this.modelCusSearch.keyword = keyword;
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
    if (product) {
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
        } else {
          this.toastr.error(data.message);
        }
      },
      error: (err) => this.toastr.error(err),
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

  getPayment() {
    if (this.GetPayment) {
      this.GetPayment.setHidden();
    }
  }
}
