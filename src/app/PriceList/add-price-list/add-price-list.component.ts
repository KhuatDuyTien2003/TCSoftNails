import { Component, OnInit } from '@angular/core';
import { CustomerRank } from '../../app.type/customer-rank.type';
import { CustomerRankService } from '../../services/customer-rank/customer-rank.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
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
  selector: 'app-add-price-list',
  standalone: true,
  templateUrl: './add-price-list.component.html',
  styleUrls: ['./add-price-list.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NzDatePickerModule,
    NzSelectModule,
    NzInputNumberModule,
  ],
})
export class AddPriceListComponent implements OnInit {
  customerRanks: CustomerRank[] = [];
  priceListForm!: FormGroup;
  isSelectDisabled: boolean = true;
  constructor(
    private fb: FormBuilder,
    private customerRankService: CustomerRankService,
    private priceListService: PriceListService,
    public dialog: MatDialog,
    private dialogRef: MatDialogRef<AddPriceListComponent>,
    private message: NzMessageService
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

  onSubmit(): void {
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
    // Gọi service postPriceList
    this.priceListService.postPriceList(priceListData).subscribe({
      next: (response) => {
        if (response.success) {
          this.message.success('Tạo bảng giá thành công!');
          this.dialogRef.close(response.data);
        } else {
          this.message.error(
            response.message || 'Đã xảy ra lỗi khi tạo bảng giá.'
          );
        }
      },
      error: (err) => {
        console.error('Lỗi khi gọi API:', err);
        this.message.error('Đã xảy ra lỗi khi tạo bảng giá.');
      },
    });
  }
}
