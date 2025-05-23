import { PriceList } from './../../app.type/price-list.type';
import { Component, Inject, OnInit } from '@angular/core';
import { CustomerRank } from '../../app.type/customer-rank.type';
import { CustomerRankService } from '../../services/customer-rank/customer-rank.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { PriceListService } from '../../services/price-list/price-list.service';

@Component({
  selector: 'app-edit-price-list',
  standalone: true,
  templateUrl: './edit-price-list.component.html',
  styleUrl: './edit-price-list.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzDatePickerModule,
    NzSelectModule,
    NzInputNumberModule,
  ],
})
export class EditPriceListComponent implements OnInit {
  customerRanks: CustomerRank[] = [];
  priceListForm!: FormGroup;
  isSelectDisabled: boolean = true;
  constructor(
    private fb: FormBuilder,
    private customerRankService: CustomerRankService,
    private priceListService: PriceListService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<EditPriceListComponent>,
    private message: NzMessageService,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      priceList: PriceList;
    }
  ) {
    this.priceListForm = this.fb.group({
      priceListName: ['', Validators.required],
      priceListType: [true],
      inputValue: [0],
      valuePriceList: [],
      rankId: [[]],
      startEndTime: [null],
      status: [false, Validators.required],
      applyAll: [true],
      selectedPrefix: [true],
    });

    this.priceListForm.get('inputValue')?.valueChanges.subscribe(() => {
      this.updateSignedValue();
    });

    this.priceListForm.get('selectedPrefix')?.valueChanges.subscribe(() => {
      this.updateSignedValue();
    });
    this.priceListForm.get('priceListType')?.valueChanges.subscribe(() => {
      this.onTypeChange(this.priceListType.value);
    });
  }
  get priceListType() {
    return this.priceListForm.get('priceListType')!;
  }
  onTypeChange(type: boolean): void {
    const inputControl = this.priceListForm.get('inputValue');
    const currentValue = inputControl?.value;

    if (type == false) {
      // %: max 100, precision 2
      if (currentValue > 100) {
        inputControl?.setValue(100);
      }
    } else {
      // VND: làm tròn số nguyên
      if (currentValue != null && currentValue % 1 !== 0) {
        inputControl?.setValue(Math.round(currentValue));
      }
    }
    this.updateSignedValue();
  }

  updateSignedValue(): void {
    const val = this.priceListForm.get('inputValue')?.value || 0;
    const prefix = this.priceListForm.get('selectedPrefix')?.value;
    const signed = prefix ? Math.abs(val) : -Math.abs(val);
    this.priceListForm.get('valuePriceList')?.setValue(signed, {
      emitEvent: false,
    });
  }

  onScopeChange(scope: boolean): void {
    this.isSelectDisabled = scope === true;
    if (this.isSelectDisabled) {
      this.priceListForm.get('rankId')?.setValue([]);
    }
  }
  ngOnInit(): void {
    this.loadCustomerRanks();
    this.onReset();
  }
  loadFormPriceList(priceList: PriceList): void {
    const start = priceList.startTime ? new Date(priceList.startTime) : null;
    const end = priceList.endTime ? new Date(priceList.endTime) : null;

    this.priceListForm.patchValue({
      priceListName: priceList.priceListName,
      valuePriceList: priceList.valuePriceList,
      priceListType: priceList.priceListType,
      startEndTime: start && end ? [start, end] : null,
      status: priceList.status,
      inputValue: Math.abs(priceList.valuePriceList),
      selectedPrefix: priceList.valuePriceList >= 0,
    });
    this.priceListService
      .getPriceListCustomerRank(priceList.priceListId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            console.log('Danh sách bảng giá:', response.data);
            this.priceListForm.patchValue({
              rankId: response.data.map((rank: any) => rank.rankId),
              applyAll: response.data.length === 0,
            });
            this.onScopeChange(this.priceListForm.get('applyAll')?.value);
          } else {
            this.message.error(
              response.message || 'Đã xảy ra lỗi khi lấy danh sách bảng giá.'
            );
          }
        },
        error: (err) => {
          console.error('Lỗi khi gọi API:', err);
          this.message.error('Đã xảy ra lỗi khi lấy danh sách bảng giá.');
        },
      });
  }
  loadCustomerRanks(): void {
    this.customerRankService.getCustomerRanks().subscribe({
      next: (response: any) => {
        if (response.success && Array.isArray(response.data)) {
          this.customerRanks = response.data;
        } else {
          console.error('Thông báo lỗi từ server:', response.message);
        }
      },
      error: (err) => {
        console.error('Lỗi tải dữ liệu:', err);
      },
    });
  }
  onReset(): void {
    if (this.data.priceList) {
      this.loadFormPriceList(this.data.priceList);
    }
  }
  selectedTab: string = 'info';

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  closeDialog() {
    this.dialogRef.close();
  }
  checkValidate(): boolean {
    if (this.priceListForm.invalid) {
      // Xử lý thông báo lỗi cho từng trường
      const priceListNameControl = this.priceListForm.get('priceListName');
      if (priceListNameControl?.hasError('required')) {
        this.message.error('Tên danh sách giá là bắt buộc.');
      }

      const statusControl = this.priceListForm.get('status');
      if (statusControl?.hasError('required')) {
        this.message.error('Trạng thái là bắt buộc.');
      }

      const startEndTimeControl = this.priceListForm.get('startEndTime');
      if (startEndTimeControl?.hasError('required')) {
        this.message.error('Thời gian bắt đầu và kết thúc là bắt buộc.');
      }
      return false;
    }
    return true;
  }
  onSubmit(): void {
    if (this.data.priceList == null) {
      this.message.error('Không có dữ liệu bảng giá để cập nhật.');
      return;
    }
    if (!this.checkValidate()) {
      return;
    }

    // Chuẩn bị dữ liệu từ form
    const formValue = this.priceListForm.value;
    const priceListData = {
      priceListName: formValue.priceListName,
      valuePriceList: formValue.valuePriceList,
      priceListType: formValue.priceListType,
      startTime: formValue.startEndTime
        ? formValue.startEndTime[0].toISOString()
        : null,
      endTime: formValue.startEndTime
        ? formValue.startEndTime[1].toISOString()
        : null,
      applyAll: formValue.applyAll,
      customerRankIds: formValue.rankId,
      status: formValue.status,
    };
    console.log('Dữ liệu bảng giá:', priceListData);
    this.priceListService
      .putPriceList(this.data.priceList.priceListId, priceListData)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.message.success('Cập nhật bảng giá thành công!');
            this.dialogRef.close(response.data);
          } else {
            this.message.error(
              response.message || 'Đã xảy ra lỗi khi cập nhật bảng giá.'
            );
          }
        },
        error: (err) => {
          console.error('Lỗi khi gọi API:', err);
          this.message.error('Đã xảy ra lỗi khi cập nhật bảng giá.');
        },
      });
  }

  onDelete(): void {
    if (this.data.priceList == null) {
      this.message.error('Không có dữ liệu bảng giá để xóa.');
      return;
    }

    this.priceListService
      .deletePriceList(this.data.priceList.priceListId)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.message.success('Xóa bảng giá thành công!');
            this.dialogRef.close(true);
          } else {
            this.message.error(
              response.message || 'Đã xảy ra lỗi khi xóa bảng giá.'
            );
          }
        },
        error: (err) => {
          console.error('Lỗi khi gọi API:', err);
          this.message.error('Đã xảy ra lỗi khi xóa bảng giá.');
        },
      });
  }
}
