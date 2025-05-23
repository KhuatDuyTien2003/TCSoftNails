import { GoodsReceipt } from './../../app.type/GoodReceipt.type';
import { Supplier } from './../../app.type/supplier.type';
import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { debounceTime, Subject } from 'rxjs';
import * as XLSX from 'xlsx';
import { GoodsReceiptService } from '../../services/goods-receipt/goods-receipt.service';
import { Filter } from '../../app.type/filter-receipt.type';
import { Router } from '@angular/router';

import { SupplierService } from '../../services/supplier/supplier.service';
import { Staff } from '../../app.type/Staff.type';

@Component({
  selector: 'app-goods-receipt',
  templateUrl: './goods-receipt.component.html',
  styleUrls: ['./goods-receipt.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    NgFor,
    NzSelectModule,
    NzSpinModule,
    NzDatePickerModule,
  ],
})
export class GoodsReceiptComponent implements OnInit {
  goodsReceipts: GoodsReceipt[] = [];
  dayOptions = [
    { label: 'Hôm nay', value: 0 },
    { label: 'Hôm qua', value: 1 },
    { label: 'Tuần trước', value: 7 },
    { label: 'Tháng trước', value: 30 },
  ];
  statusOptions = [
    { value: 0, label: 'Phiếu nháp' },
    { value: 1, label: 'Đã nhập hàng' },
  ];

  filterSubject = new Subject<void>();
  searchSubject = new Subject<string>();
  productSearchSubject = new Subject<string>();
  supplierSearchSubject = new Subject<string>();
  accountantSearchSubject = new Subject<string>();

  currentPage = 1;
  pageSize = 10;
  totalPages = 0;
  totalItems = 0;
  isLoading = false;
  filterCriteria: Filter = {
    pageNumber: 1,
    pageSize: 10,
  };
  date: Date[] = [new Date(), new Date()];
  days = 0;

  constructor(
    private goodsReceiptService: GoodsReceiptService,
    private supplierService: SupplierService,
    private router: Router
  ) {}

  ngOnInit() {
    this.setupSearchDebounces();
    this.setupFilterSubscription();
    this.loadReceipts();
    this.supplierService.getAllSuppliers().subscribe((res) => {
      if (res.success) this.suppliers = res.data;
    });
    this.goodsReceiptService.getAllStaff().subscribe((res) => {
      if (res.success) this.staffList = res.data;
    });
  }

  private setupSearchDebounces() {
    // Receipt code search
    this.searchSubject.pipe(debounceTime(300)).subscribe((searchTerm) => {
      this.filterCriteria.receiptCode = searchTerm;
      this.applyFilter();
    });

    // Product name search
    this.productSearchSubject
      .pipe(debounceTime(300))
      .subscribe((searchTerm) => {
        this.filterCriteria.productName = searchTerm;
        this.applyFilter();
      });

    // Supplier name search
    this.supplierSearchSubject
      .pipe(debounceTime(300))
      .subscribe((searchTerm) => {
        this.filterCriteria.supplierName = searchTerm;
        this.applyFilter();
      });

    // Accountant name search
    this.accountantSearchSubject
      .pipe(debounceTime(300))
      .subscribe((searchTerm) => {
        this.filterCriteria.accountantName = searchTerm;
        this.applyFilter();
      });
  }

  private setupFilterSubscription() {
    this.filterSubject.subscribe(() => {
      this.applyFilter();
    });
  }

  applyFilter() {
    this.currentPage = 1; // Reset to first page when filters change
    this.loadReceipts();
  }
  loadReceipts() {
    this.isLoading = true;
    if (this.active === true) {
      this.filterCriteria.days = this.days;
    }
    if (this.date && this.date.length === 2 && !this.active) {
      this.filterCriteria.timeStart = this.date[0];
      this.filterCriteria.timeEnd = this.date[1];
    }

    console.log('loc filter:', this.filterCriteria);
    this.goodsReceiptService
      .getGoodsReceiptsByFilter(this.filterCriteria)
      .subscribe({
        next: (response) => {
          this.goodsReceipts = response.data || response;
          this.totalItems = response.totalCount || this.goodsReceipts.length;
          this.totalPages = Math.ceil(this.totalItems / this.pageSize);
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error filtering receipts:', error);
          this.isLoading = false;
        },
      });
  }
  // UI Event Handlers
  onChange(result: Date[]): void {
    this.date = result;
    this.filterSubject.next();
  }

  onDaysChange(value: number): void {
    this.days = value;
    this.filterSubject.next();
  }

  active: boolean = true;
  onTimeRadioChange(active: boolean): void {
    if (active === true) {
      this.active = true;
      this.filterCriteria.timeStart = undefined;
      this.filterCriteria.timeEnd = undefined;
      this.filterCriteria.days = this.days;
    } else {
      this.active = false;
      this.filterCriteria.days = undefined;
    }
    this.filterSubject.next();
  }

  onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject.next(value);
  }

  onProductSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.productSearchSubject.next(value);
  }

  onSupplierSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.supplierSearchSubject.next(value);
  }

  onAccountantSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.accountantSearchSubject.next(value);
  }

  onStatusChange(status: number) {
    if (!this.filterCriteria.status) {
      this.filterCriteria.status = [];
    }

    if (this.filterCriteria.status.indexOf(status) === -1) {
      this.filterCriteria.status.push(status);
    } else {
      this.filterCriteria.status = this.filterCriteria.status.filter(
        (s) => s !== status
      );
    }
    this.filterSubject.next();
  }

  exportToExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.goodsReceipts);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'GoodsReceipts');
    XLSX.writeFile(wb, 'goods_receipts.xlsx');
  }

  getStatusLabel(status: number): string {
    const statusOption = this.statusOptions.find((opt) => opt.value === status);
    return statusOption ? statusOption.label : '';
  }
  suppliers: Supplier[] = [];
  staffList: Staff[] = [];
  getSupplierName(supplierId: number): string {
    return (
      this.suppliers.find((s) => s.supplierId === supplierId)?.supplierName ||
      ''
    );
  }

  getStaffName(accountantId: number): string {
    return (
      this.staffList.find((s) => s.staffId === accountantId)?.staffName || ''
    );
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.applyFilter();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilter();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilter();
    }
  }

  // Generate array of page numbers for pagination controls
  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than max visible
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      // Calculate range around current page
      const startPage = Math.max(2, this.currentPage - 1);
      const endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

      // Add ellipsis after page 1 if needed
      if (startPage > 2) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Add pages around current page
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      // Add ellipsis before last page if needed
      if (endPage < this.totalPages - 1) {
        pages.push(-1); // -1 represents ellipsis
      }

      // Always show last page
      pages.push(this.totalPages);
    }

    return pages;
  }

  onCreateNewReceipt(): void {
    this.router.navigate(['/add-goods-receipt']);
  }
}
