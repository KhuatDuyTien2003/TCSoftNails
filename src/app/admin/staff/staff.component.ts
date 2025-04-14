import { Staff } from './../../app.type/Staff.type';
import { Component, OnInit } from '@angular/core';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTableModule } from 'ng-zorro-antd/table';
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

import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { HeaderComponent } from '../../header/header.component';
import { HttpStaffService } from '../../services/http-staff.service';
import { ToastrService } from 'ngx-toastr';
import { SearchStaffModel } from '../../app.type/SearchStaffModel.type';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
@Component({
  selector: 'app-staff',
  standalone: true,
  templateUrl: './staff.component.html',
  styleUrl: './staff.component.scss',
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
})
export class StaffComponent implements OnInit {
  date = null;
  fileName: File | null = null;
  imageBase64: string = '';
  staffList: Staff[] = [];
  public isEdit: boolean = false;
  staffId: number = 0;
  liststaffId: string[] = [];
  isSearch: boolean = false;
  isSuccessSearch: boolean = false;
  excelData: Staff[] = [];
  listService: any[] = [];
  pageSize: number = 10;
  page: number = 1;
  countPage: number = 100;
  totalPages: number = 10;
  currentPage: number = 1;
  messageErrore: string = '';
  searchModel: SearchStaffModel = {
    keyword: '',
    fromDate: null,
    serviceId: null,
    pageNumber: 1,
    pageSize: 10,
  };
  formAdd = new FormGroup({
    staffName: new FormControl('', Validators.required),
    birthday: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    sdt: new FormControl('', [
      Validators.required,
      Validators.maxLength(10),
      Validators.minLength(10),
    ]),
    services: new FormControl<string[]>([]),
    urlAvatar: new FormControl(),
    gender: new FormControl(''),
  });
  constructor(
    private httpStaff: HttpStaffService,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.httpStaff.getAllStaff(this.page, this.pageSize).subscribe((data) => {
      if ('data' in data) {
        this.staffList = data.data;
        this.countPage = data.count;
      }
    });
    this.httpStaff.getServices().subscribe((data) => {
      this.listService = data.data;
    });
  }
  public onCheckboxChange(event: Event, id: number) {
    const servicesControl = this.formAdd.get('services') as FormControl<
      string[]
    >;
    let selectedServices = servicesControl.value || [];

    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      selectedServices = [...selectedServices, id.toString()];
    } else {
      selectedServices = selectedServices.filter(
        (serviceId) => serviceId !== id.toString()
      );
    }

    servicesControl.setValue(selectedServices);

    console.log(this.formAdd.value.services);
  }

  public onHidden(className: string) {
    let btn = document.querySelector(`.${className}`) as HTMLElement;
    if (btn.classList.contains('hidden')) {
      btn.classList.remove('hidden');
    } else {
      btn.classList.add('hidden');
    }
  }

  public getStaff(id: number) {
    this.staffId = id;
    this.httpStaff.getStaffById(id).subscribe((data) => {
      if (data.success == true) {
        this.onHidden('addStaff');
        this.isEdit = true;
        let serviceIds: string[] = data.data.serviceId
          ? data.data.serviceId.split(',')
          : [];
        console.log(serviceIds);

        this.formAdd.patchValue({
          staffName: data.data.staffName,
          birthday: data.data.birthday
            ? new Date(data.data.birthday).toISOString().split('T')[0]
            : '',
          email: data.data.email,
          gender: data.data.gender ? 'male' : 'female',
          sdt: data.data.numberPhone,
          urlAvatar: data.data.urlAvatar,
          services: serviceIds || [],
        });
        console.log(this.formAdd);
      } else {
        this.messageErrore = data.message;
        this.toastr.error(this.messageErrore);
      }
    });
  }

  handleStaff(staffId: number) {
    if (this.isEdit) {
      this.editStaff(staffId);
    } else {
      this.createStaff();
    }
  }

  createStaff() {
    let model: Staff = {
      staffName: this.formAdd.value.staffName || '',
      birthday: this.formAdd.value.birthday || '',
      email: this.formAdd.value.email || '',
      gender: this.formAdd.value.gender === ' male' ? true : false,
      joinDate: this.formAdd.value.birthday || '',
      numberPhone: this.formAdd.value.sdt || '',
      totalStar: 0,
      urlAvatar: this.imageBase64,
      status: true,
      staffId: 0,
      serviceId: this.formAdd.value.services?.join(','),
      serviceName: '',
    };
    this.httpStaff.createStaff(model).subscribe((data) => {
      if (data.success) {
        this.toastr.success(data.message, 'Thông báo');
        this.onHidden('addStaff');
        this.httpStaff
          .getAllStaff(this.page, this.pageSize)
          .subscribe((data) => {
            if ('data' in data) this.staffList = data.data;
          });
      } else {
        this.toastr.error(data.message, 'Thông báo');
      }
    });
  }

  public editStaff(staffId: number) {
    let newStaff: Staff = {
      staffId: staffId,
      staffName: this.formAdd.value.staffName || '',
      birthday: this.formAdd.value.birthday
        ? new Date(this.formAdd.value.birthday).toISOString().split('T')[0]
        : '',
      email: this.formAdd.value.email || '',
      gender: this.formAdd.value.gender === 'male' ? true : false,
      joinDate: this.formAdd.value.birthday
        ? new Date(this.formAdd.value.birthday).toISOString().split('T')[0]
        : '',
      numberPhone: this.formAdd.value.sdt || '',
      urlAvatar: this.imageBase64,
      totalStar: 0,
      serviceId: this.formAdd.value.services?.join(','),
      serviceName: '',
    };

    this.httpStaff
      .updateStaff(newStaff)
      // .pipe(
      //   map((response) => {
      //     debugger;
      //     if (!response.success) {
      //       console.log('1' + response);
      //       this.messageErrore = response.message;
      //       return false;
      //     }
      //     console.log('2' + response);
      //     this.onHidden('addStaff');
      //     return true;
      //   }),
      //   filter((data) => data === true),
      //   switchMap(() => this.httpStaff.getAllStaff())
      // )
      .subscribe((response) => {
        console.log(response);
        if (response.success) {
          this.toastr.success(response.message, 'Thông báo');
          this.onHidden('addStaff');
          this.httpStaff
            .getAllStaff(this.page, this.pageSize)
            .subscribe((data) => {
              if (data && 'data' in data) {
                this.staffList = data.data;
                this.countPage = data.count;
                console.log(this.staffList);
              }
            });
        } else this.toastr.error(response.message, 'Thông báo');
      });
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

  public hiddenDetail(event: Event) {
    let parent = event.currentTarget as HTMLElement;
    let children = parent.nextElementSibling;
    if (children?.classList.contains('hidden')) {
      children.classList.remove('hidden');
    } else {
      children?.classList.add('hidden');
    }
  }

  startDeleteStaff(id: number) {
    debugger;
    this.staffId = id;
    console.log(this.staffId);
    this.onHidden('formDelete');
  }

  deleteStaff(staffId: number) {
    this.httpStaff.deleteStaff(staffId).subscribe((response) => {
      console.log(response);
      if (response.success) {
        this.toastr.success(response.message, 'Thông báo');
        this.onHidden('formDelete');
        this.httpStaff
          .getAllStaff(this.page, this.pageSize)
          .subscribe((data) => {
            if (data && 'data' in data) {
              this.staffList = data.data;
              this.countPage = data.count;
              console.log(this.staffList);
            }
          });
      } else {
        this.toastr.error(response.message, 'Thông báo');

        this.onHidden('formDelete');
      }
    });
  }

  stopStartStaff(staffId: number) {
    this.httpStaff.stopStartWork(staffId).subscribe((response) => {
      console.log(response);
      if (response.success) {
        this.toastr.success(response.message, 'Thông báo');
        this.httpStaff
          .getAllStaff(this.page, this.pageSize)
          .subscribe((data) => {
            if (data && 'data' in data) {
              this.staffList = data.data;
              this.countPage = data.count;
              console.log(this.staffList);
            }
          });
      } else {
        this.toastr.error(response.message, 'Thông báo');
      }
    });
  }

  public exportStaff() {
    this.httpStaff.exportStaff().subscribe((data) => {
      var urlDownload = `http://localhost:5213/TempFiles/${data.filePath}`;
      window.open(urlDownload, '_blank');
      setTimeout(() => {
        this.httpStaff.deleteFile(data.filePath).subscribe(() => {
          console.log('File deleted from server.');
        });
      }, 2000);
    });
  }

  public onPageChange(page: number): void {
    this.currentPage = page;
    //this.searchModel.page = page;
    // if (this.isSearch) {
    //   this.httpStaff
    //     .searchStaff(this.searchModel)
    //     .subscribe((response) => {
    //       if (response.success && 'data' in response) {
    //         this.StaffList = response.data;

    //         this.countPage = response.count;
    //         this.isSuccessSearch = true;
    //       } else {
    //         const errorResponse = response as {
    //           success: boolean;
    //           message: string;
    //         };
    //         this.isSuccessSearch = errorResponse.success;
    //         this.staffList = [];
    //         this.countPage = 0;
    //         console.log(this.isSuccessSearch);
    //       }
    //     });
    // } else {
    this.httpStaff.getAllStaff(page, this.pageSize).subscribe((data) => {
      if ('data' in data) {
        this.staffList = data.data;
      }
    });
  }

  private excelDateToJSDate(serial: number): string {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    return date_info.toISOString().slice(0, 19).replace('T', ' ');
  }

  public readExcel(): void {
    const fileInput = document.getElementById('file') as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file) {
      alert('Vui lòng chọn một file Excel!');
      return;
    }

    if (!/(\.xls|\.xlsx)$/i.test(file.name)) {
      alert(
        'Định dạng file không hợp lệ! Vui lòng chọn file Excel (.xls, .xlsx)'
      );
      return;
    }

    const fileReader = new FileReader();
    fileReader.readAsBinaryString(file);

    fileReader.onload = () => {
      try {
        const binaryData = fileReader.result as string;
        const workbook = XLSX.read(binaryData, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const jsonData: any[] = XLSX.utils.sheet_to_json(
          workbook.Sheets[sheetName]
        );

        const requiredColumns = [
          'StaffId',
          'StaffName',
          'NumberPhone',
          'Email',
          'Birthday',
          'Gender',
          'JoinDate',
          'TotalStar',
          'Status',
          'UrlAvatar',
          'ServiceIds',
          'ServiceNames',
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

        this.excelData = jsonData.map((item) => ({
          staffId: item.StaffId ?? null,
          staffName: item.StaffName ?? null,
          numberPhone: item.NumberPhone ? `0${item.NumberPhone}` : null,
          email: item.Email ?? null,
          birthday: this.parseExcelDate(item.Birthday),
          gender: this.parseGender(item.Gender),
          joinDate: this.parseExcelDate(item.JoinDate),
          totalStar: item.TotalStar ?? null,
          status: this.parseStatus(item.Status),
          urlAvatar: item.UrlAvatar ?? 'avatar.png',
          serviceId: item.ServiceIds ?? null,
          serviceName: item.ServiceNames ?? null,
        }));

        console.log('Dữ liệu từ Excel:', this.excelData);
        this.httpStaff.addStaffs(this.excelData).subscribe((data) => {
          if (data.success) {
            this.toastr.success(data.message);
            this.httpStaff
              .getAllStaff(this.page, this.pageSize)
              .subscribe((data) => {
                if ('data' in data) {
                  this.staffList = data.data;
                  this.countPage = data.count;
                }
              });
            this.httpStaff.getServices().subscribe((data) => {
              this.listService = data.data;
              console.log(this.listService);
            });
          } else {
            this.toastr.error(data.message);
          }
        });
      } catch (error) {
        console.error('Lỗi khi xử lý file:', error);
        alert('Có lỗi xảy ra khi xử lý file Excel!');
      }
    };

    fileReader.onerror = () => {
      alert('Có lỗi xảy ra khi đọc file Excel!');
    };
  }

  private parseExcelDate(value: any): string | null {
    return typeof value === 'number'
      ? new Date(this.excelDateToJSDate(value)).toISOString()
      : value ?? null;
  }

  private parseGender(value: string): boolean | null {
    return value === 'Nam' ? true : value === 'Nữ' ? false : null;
  }

  private parseStatus(value: string): boolean | null {
    return value === 'Hoạt động'
      ? true
      : value === 'Ngưng hoạt động'
      ? false
      : null;
  }

  searchStaff(event: Event) {
    var input = event.target as HTMLInputElement;
    switch (input.name) {
      case 'idNamePhone':
        this.searchModel.keyword = input.value;

        break;
      case 'brithday':
        var keyword = input.value;

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
      case 'serviceId':
        this.searchModel.serviceId = Number(input.value);
    }
    this.getSearchStaff(this.searchModel);
  }
  onChangeDate(dates: Date[]) {
    if (dates && dates.length === 2) {
      this.searchModel.fromDate = new Date(dates[0]);
      this.searchModel.toDate = new Date(dates[1]);
      console.log(this.searchModel);
    } else {
      this.searchModel.fromDate = null;
      this.searchModel.toDate = null;
    }
    this.getSearchStaff(this.searchModel);
  }

  getSearchStaff(model: SearchStaffModel) {
    this.httpStaff.searchStaff(this.searchModel).subscribe((data) => {
      if (Array.isArray(data.data)) {
        this.staffList = data.data;
        this.countPage = data.data.length;
        console.log(this.staffList);
      } else {
        this.staffList = [];
        this.countPage = 0;
      }
    });
  }
}
