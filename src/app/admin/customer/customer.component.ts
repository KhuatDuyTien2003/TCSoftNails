import { customer } from './../../app.type/customer.type';
import { Component, OnInit } from '@angular/core';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { HttpCustomerService } from '../../services/http-customer.service';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { RouterModule } from '@angular/router';
import * as XLSX from 'xlsx';
import { CommonModule } from '@angular/common';
import { VncurrencyPipe } from '../../pipe/vncurrency.pipe';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { catchError, EMPTY, filter, map, of, switchMap } from 'rxjs';
import { searchCustomerType } from '../../app.type/searchCustomerType.type';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { HeaderComponent } from '../../header/header.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'app-customer',
  standalone: true,
  templateUrl: './customer.component.html',

  imports: [
    NzDividerModule,
    NzTableModule,
    RouterModule,
    CommonModule,
    VncurrencyPipe,
    NzIconModule,
    ReactiveFormsModule,
    NzPaginationModule,
    HeaderComponent,
    FormsModule,
    NzDatePickerModule,
  ],
  styleUrl: './customer.component.scss',
})
export class CustomerComponent implements OnInit {
  date = null;
  fileName: File | null = null;
  imageBase64: string = '';
  customerList: customer[] = [];
  public isEdit: boolean = false;
  CustomerId: number = 0;
  listCustomerId: string[] = [];
  isSearch: boolean = false;
  isSuccessSearch: boolean = false;
  excelData: customer[] = [];
  pageSize: number = 10;
  page: number = 1;
  countPage: number = 100;
  totalPages: number = 10;
  currentPage: number = 1;
  messageErrore: string = '';
  searchModel: searchCustomerType = {
    keyword: null,
    fromDate: null,
    toDate: null,
    gender: null,
    rankId: null,
    page: 1,
    pageSize: 10,
  };
  constructor(
    private httpCustomer: HttpCustomerService,
    private toastr: ToastrService
  ) {}
  formAdd = new FormGroup({
    customerName: new FormControl('', Validators.required),
    birthday: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    sdt: new FormControl('', [
      Validators.required,
      Validators.maxLength(10),
      Validators.minLength(10),
    ]),
    urlAvatar: new FormControl(),
    gender: new FormControl(''),
  });
  ngOnInit() {
    this.httpCustomer.getAllCustomer(this.page, this.pageSize).subscribe({
      next: (data) => {
        if ('data' in data) {
          this.customerList = data.data;
          this.countPage = data.count;
        } else {
          this.toastr.error(data.message);
        }
        this.totalPages = Math.floor(this.countPage / this.pageSize) + 1;
      },
      error: (err) => {
        this.toastr.error(err.message || 'Đã xảy ra lỗi khi tải khách hàng');
      },
    });
  }

  public onPageChange(page: number): void {
    this.currentPage = page;
    this.searchModel.page = page;
    if (this.isSearch) {
      this.httpCustomer.searchCustomer(this.searchModel).subscribe({
        next: (response) => {
          if (response.success && 'data' in response) {
            this.customerList = response.data;

            this.countPage = response.count;
            this.isSuccessSearch = true;
          } else {
            const errorResponse = response as {
              success: boolean;
              message: string;
            };
            this.toastr.error(errorResponse.message);
            this.isSuccessSearch = errorResponse.success;
            this.customerList = [];
            this.countPage = 0;
          }
        },
        error: (err) => {
          this.toastr.error(err.message || 'Đã xảy ra lỗi khi tải khách hàng');
        },
      });
    } else {
      this.httpCustomer
        .getAllCustomer(page, this.pageSize)
        .subscribe((data) => {
          if ('data' in data) {
            this.customerList = data.data;
          }
        });
    }
  }

  public editCustomer(customerId: number) {
    var newCustomer: Omit<customer, 'rankName' | 'totalMoney' | 'totalPoints'> =
      {
        customerId: customerId,
        customerName: this.formAdd.value.customerName || '',
        birthday: this.formAdd.value.birthday || '',
        email: this.formAdd.value.email || '',
        gender: this.formAdd.value.gender === 'male' ? true : false,
        numberPhone: this.formAdd.value.sdt || '',
        userName: null,
        password: null,
        rankId: 1,
        urlAvatar: this.imageBase64,
      };

    this.httpCustomer
      .editCustomer(newCustomer)
      .pipe(
        map((data) => {
          if (!data.success) {
            this.toastr.error(data.message);
            return null;
          }
          return data;
        }),
        filter((data) => !!data),

        switchMap(() =>
          this.httpCustomer.getAllCustomer(this.page, this.pageSize)
        ),
        catchError((error) => {
          this.toastr.error(
            error.message || 'Đã xảy ra lỗi khi sửa khách hàng'
          );
          return of(null);
        })
      )
      .subscribe((data) => {
        if (data !== null) {
          let message = 'Sửa khách hàng thành công';
          this.onHidden('addCustomer');
          this.toastr.error(message);
          if ('data' in data) {
            this.customerList = data.data;
          }
        }
      });
  }
  handleCustomer(customerId: number) {
    if (this.isEdit) {
      this.editCustomer(customerId);
    } else {
      this.addCustomer();
    }
  }

  public deleteCustomer(id: number) {
    this.httpCustomer
      .deleteCustomer(id)
      .pipe(
        map((data) => {
          if (!data.success) {
            this.toastr.error(data.message);
            return null;
          }
          return data;
        }),
        filter((data) => !!data),
        switchMap(() =>
          this.httpCustomer.getAllCustomer(this.page, this.pageSize)
        )
      )
      .subscribe((data) => {
        if ('data' in data) {
          this.customerList = data.data;
        }
        this.onHidden('formDelete');
      });
  }

  public deleteMultipleCustomers(listCustomerId: string[]) {
    this.httpCustomer
      .deleteMultipleCustomers(listCustomerId)
      .pipe(
        map((data) => {
          if (!data.success) {
            this.toastr.error(data.message);
            return null;
          }
          return data;
        }),
        filter((data) => !!data),
        switchMap(() =>
          this.httpCustomer.getAllCustomer(this.page, this.pageSize)
        )
      )
      .subscribe((data) => {
        if ('data' in data) {
          this.customerList = data.data;
        }
      });
  }

  public getCustomer(id: number) {
    this.CustomerId = id;
    this.httpCustomer.getCustomer(id).subscribe((data) => {
      let btn = document.querySelector('.addCustomer') as HTMLElement;
      btn.classList.remove('hidden');
      this.isEdit = true;
      this.formAdd.patchValue({
        customerName: data.customerName,
        birthday: data.birthday
          ? new Date(data.birthday).toISOString().split('T')[0]
          : '',
        email: data.email,
        gender: data.gender ? 'male' : 'female',
        sdt: data.numberPhone,
        urlAvatar: data.urlAvatar,
      });
    });
  }

  public hiddenDetail(event: Event) {
    let parent = event.currentTarget as HTMLElement;
    let children = parent.nextElementSibling;
    if (children?.classList.contains('hidden')) {
      children.classList.remove('hidden');
    } else {
      children?.classList.add('hidden');
    }
  }
  public onHidden(className: string) {
    let btn = document.querySelector(`.${className}`) as HTMLElement;
    if (btn.classList.contains('hidden')) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  }

  public startDelete(className: string, id: number) {
    debugger;
    this.CustomerId = id;

    this.onHidden(className);
  }
  public HiddenAction(event: Event) {
    event.stopPropagation();

    var checkboxList = document.querySelectorAll('.actionItem');
    var dem = 0;

    checkboxList.forEach((item) => {
      const checkbox = item as HTMLInputElement;
      const value = checkbox.value;
      var index = this.listCustomerId.indexOf(checkbox.value);
      if (checkbox.checked && index === -1) {
        dem++;
        this.listCustomerId.push(value);
      } else if (!checkbox.checked && index !== -1) {
        this.listCustomerId.splice(index, 1);
      }
    });

    if (dem > 0) {
      document.getElementById('action')?.classList.remove('hidden');
    } else {
      document.getElementById('action')?.classList.add('hidden');
    }
  }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileName = file;
      const reader = new FileReader();
      reader.readAsDataURL(this.fileName);
      reader.onload = () => {
        this.imageBase64 = reader.result as string;
      };
    }
  }

  public searchCustomer(event: Event) {
    let input = event.target as HTMLInputElement;
    let keyword = input.value;
    let nameInput = input.name;

    switch (nameInput) {
      case 'idNamePhone':
        this.searchModel.keyword = keyword;
        break;
      case 'birthday':
        let today: Date = new Date();
        if (keyword === 'today') {
          this.searchModel.fromDate = today;
          this.searchModel.toDate = today;
        } else if (keyword === 'ytd') {
          let ytd: Date = new Date();
          ytd.setDate(today.getDate() - 1);
          this.searchModel.fromDate = ytd;
          this.searchModel.toDate = ytd;
        } else if (keyword === 'tomorow') {
          let tomorow: Date = new Date();
          tomorow.setDate(today.getDate() + 1);
          this.searchModel.fromDate = tomorow;
          this.searchModel.toDate = tomorow;
        } else {
          this.searchModel.fromDate = null;
          this.searchModel.toDate = null;
        }
        break;
      case 'Gender':
        if (keyword == 'male') this.searchModel.gender = true;
        else if (keyword == 'female') this.searchModel.gender = false;
        else this.searchModel.gender = null;
        break;
      case 'rankId':
        this.searchModel.rankId = keyword;
    }
    this.isSearch = true;
    this.searchCus(this.searchModel);
  }

  searchCus(model: searchCustomerType) {
    this.httpCustomer.searchCustomer(model).subscribe((response) => {
      if (response.success && 'data' in response) {
        this.customerList = response.data;

        this.countPage = response.count;
        this.isSuccessSearch = true;
      } else {
        const errorResponse = response as { success: boolean; message: string };
        this.isSuccessSearch = errorResponse.success;
        this.customerList = [];
        this.countPage = 0;
      }
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
    this.searchCus(this.searchModel);
  }

  public exportCustomer() {
    this.httpCustomer.exportCustomer().subscribe((data) => {
      var urlDownload = `https://localhost:7087/TempFiles/${data.filePath}`;
      window.open(urlDownload, '_blank');
      setTimeout(() => {
        this.httpCustomer.deleteFile(data.filePath).subscribe(() => {
          console.log('File deleted from server.');
        });
      }, 2000);
    });
  }

  private excelDateToJSDate(serial: number): string {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    return date_info.toISOString().slice(0, 19).replace('T', ' ');
  }

  public readExcel() {
    let fileInput = document.getElementById('file') as HTMLInputElement;
    let file = fileInput.files ? fileInput.files[0] : null;
    if (!file) {
      alert('Vui lòng chọn một file Excel!');
      return;
    }

    const allowedExtensions = /(\.xls|\.xlsx)$/i;
    if (!allowedExtensions.test(file.name)) {
      alert(
        'Định dạng file không hợp lệ! Vui lòng chọn file Excel (.xls, .xlsx)'
      );
      return;
    }
    let fileReader = new FileReader();
    fileReader.readAsBinaryString(file);

    fileReader.onload = (e) => {
      const binaryData = fileReader.result as string;
      const workbook = XLSX.read(binaryData, { type: 'binary' });

      const sheetName = workbook.SheetNames;

      let jsonData = XLSX.utils.sheet_to_json(
        workbook.Sheets[sheetName[0]]
      ) as any[];

      const requiredColumns = [
        'CustomerId',
        'CustomerName',
        'Birthday',
        'Email',
        'Gender',
        'NumberPhone',
        'TotalMoney',
        'TotalPoints',
        'RankName',
      ];

      const firstRowKeys = Object.keys(jsonData[0] || {});
      const missingColumns = requiredColumns.filter(
        (col) => !firstRowKeys.includes(col)
      );

      if (missingColumns.length > 0) {
        alert(
          `File Excel thiếu các cột bắt buộc: ${missingColumns.join(', ')}`
        );
        return;
      }
      jsonData = jsonData.map((row: any) => {
        if (row.Birthday && typeof row.Birthday === 'number') {
          row.Birthday = new Date(
            this.excelDateToJSDate(row.Birthday)
          ).toISOString();
        }
        if (row.NumberPhone) {
          row.NumberPhone = `0${row.NumberPhone}`;
        }
        if (row.Gender && row.Gender === 'Nam') {
          row.Gender = true;
        } else if (row.Gender && row.Gender === 'Nữ') {
          row.Gender = false;
        }
        return row;
      });
      for (const item of jsonData) {
        let newCustomer: customer = {
          customerId: item.CustomerId,
          customerName: item.CustomerName,
          birthday: item.Birthday,
          email: item.Email,
          gender: item.Gender,
          numberPhone: item.NumberPhone,
          password: null,
          rankId: null, // duyệt qua rankList.map để lấy id
          totalMoney: item.TotalMoney,
          totalPoints: item.TotalPoints,
          userName: null,
          urlAvatar: 'avatar.png',
          rankName: item.RankName,
        };
        this.excelData.push(newCustomer);
      }

      this.addCustomers(this.excelData);
    };

    fileReader.onerror = (error) => {
      alert('Có lỗi xảy ra khi đọc file Excel!');
    };
  }

  public addCustomers(customers: customer[]) {
    this.httpCustomer
      .addCustomers(customers)
      .pipe(
        switchMap(() =>
          this.httpCustomer.getAllCustomer(this.page, this.pageSize)
        )
      )
      .subscribe((data) => {
        if ('data' in data) {
          this.customerList = data.data;
        }
      });
  }

  public addCustomer() {
    var newCustomer: Omit<
      customer,
      'rankName' | 'customerId' | 'totalMoney' | 'totalPoints'
    > = {
      customerName: this.formAdd.value.customerName || '',
      birthday: this.formAdd.value.birthday || '',
      email: this.formAdd.value.email || '',
      gender: this.formAdd.value.gender === 'male' ? true : false,
      numberPhone: this.formAdd.value.sdt || '',
      userName: null,
      password: null,
      rankId: 1,
      urlAvatar: this.imageBase64,
    };

    this.httpCustomer
      .addCustomer(newCustomer)
      .pipe(
        switchMap((data) => {
          if (data.success) {
            return this.httpCustomer.getAllCustomer(this.page, this.pageSize);
          } else {
            this.messageErrore = data.message;

            return EMPTY;
          }
        })
      )
      .subscribe((data) => {
        message: 'Thêm khách hàng thành công';
        this.onHidden('addCustomer');
        if ('data' in data) {
          this.customerList = data.data;
        }
        this.formAdd.patchValue({
          customerName: '',
          birthday: '',
          email: '',
          gender: '',
          sdt: '',
          urlAvatar: '',
        });
      });
  }
}
