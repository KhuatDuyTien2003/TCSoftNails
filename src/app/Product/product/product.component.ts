import { AddComboDialogComponent } from './../add-combo-dialog/add-combo-dialog.component';
import { AddServiceDialogComponent } from './../add-service-dialog/add-service-dialog.component';
import { ProductGroup } from '../../app.type/product-group.type';
import { product } from '../../app.type/product.type';
import { FilterCriteria } from '../../app.type/filter-criteria.type';
import { CommonModule, NgFor } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ProductGroupService } from '../../services/product-group/product-group.service';
import { ProductService } from '../../services/product/product.service';
import { MatDialog } from '@angular/material/dialog';
import { AddProductDialogComponent } from '../add-product-dialog/add-product-dialog.component';
import { DetailProductComponent } from '../detail-product/detail-product.component';
import * as XLSX from 'xlsx';
import { AddProductGroupDialogComponent } from '../add-product-group-dialog/add-product-group-dialog.component';

@Component({
  selector: 'app-product',
  standalone: true,
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  imports: [CommonModule, FormsModule, NgFor, DetailProductComponent],
})
export class ProductComponent implements OnInit {
  // --- Các trường cho phần lọc ---
  searchTerm: string = '';
  rank: number | null = null;
  status: number | null = null;
  stock: number | null = null;
  productTypes = [
    { id: 1, name: 'Sản Phẩm', selected: false },
    { id: 2, name: 'Dịch Vụ', selected: false },
    { id: 3, name: 'Combo', selected: false },
  ];
  statuses = [
    { id: 0, name: 'Tất cả' },
    { id: 1, name: 'Đang mở bán' },
    { id: 2, name: 'Bị ẩn' },
  ];
  stocks = [
    { id: 0, name: 'Tất cả' },
    { id: 1, name: 'Còn hàng' },
    { id: 2, name: 'Hết hàng' },
  ];
  productGroups: ProductGroup[] = [];
  filteredGroups: ProductGroup[] = [];

  groupSearchTerm: string = '';
  selectedProductGroup: number | null = null;

  private searchSubject = new Subject<void>();
  private groupSearchSubject = new Subject<void>();

  products: product[] = [];
  isLoading: boolean = false;

  // Pagination fields
  currentPage: number = 1;
  pageSize: number = 12;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(
    private productGroupService: ProductGroupService,
    private productService: ProductService,
    public dialog: MatDialog
  ) {
    this.searchSubject
      .pipe(debounceTime(300))
      .subscribe(() => this.applyFilter());

    this.groupSearchSubject
      .pipe(debounceTime(300))
      .subscribe(() => this.filterGroups());
  }

  ngOnInit() {
    this.loadProductGroups();
    this.resetFilter();
  }

  loadProductGroups() {
    this.productGroupService.getProductGroups().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.productGroups = response.data;
          this.filteredGroups = [...this.productGroups];
          // console.log('Danh sách nhóm hàng:', this.productGroups);
        } else {
          console.error('Thông báo lỗi từ server:', response.message);
        }
      },
    });
  }

  get selectedProductTypes() {
    return this.productTypes
      .filter((type) => type.selected)
      .map((type) => type.id);
  }

  applyFilter() {
    this.currentPage = 1; // Reset về trang đầu tiên khi áp dụng bộ lọc mới
    this.loadProducts();
  }

  debounceApplyFilter() {
    this.searchSubject.next();
  }

  resetFilter() {
    this.searchTerm = '';
    this.productTypes.forEach((type) => (type.selected = false));
    this.groupSearchTerm = '';
    this.filteredGroups = [...this.productGroups];
    this.selectedProductGroup = null;
    this.status = 0;
    this.stock = 0;
    this.currentPage = 1; // Reset to first page
    this.applyFilter();
  }

  debounceFilterGroups() {
    this.groupSearchSubject.next();
  }

  filterGroups() {
    const normalizedSearchTerm = this.groupSearchTerm
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();

    this.filteredGroups = this.productGroups.filter((group) => {
      const normalizedName = group.productTypeName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
      return normalizedName.includes(normalizedSearchTerm);
    });
  }

  selectGroup(groupId: number | null) {
    if (this.selectedProductGroup === groupId) {
      this.selectedProductGroup = null;
    } else {
      this.selectedProductGroup = groupId;
    }
    this.applyFilter();
    console.log('Nhóm hàng đã chọn:', this.selectedProductGroup);
  }

  loadProducts() {
    this.isLoading = true;
    this.selectedProductIds.clear();
    this.showActionMenu = false;

    const filterCriteria: FilterCriteria = {
      searchTerm: this.searchTerm ?? '',
      productTypes: this.selectedProductTypes ?? [],
      productGroup: this.selectedProductGroup ?? undefined,
      status: this.status ?? undefined,
      stock: this.stock ?? undefined,
      rank: this.rank ?? undefined,
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
    };

    console.log('Bộ lọc:', filterCriteria);

    this.productService.getProductsByFilter(filterCriteria).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.products = Array.isArray(response.data) ? response.data : [];
          this.totalItems = response.totalItems;
          this.totalPages = response.totalPages;
          this.currentPage = response.currentPage;
        } else {
          this.products = [];
          this.totalItems = 0;
          this.totalPages = 0;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải sản phẩm:', error);
        this.isLoading = false;
        this.products = [];
      },
    });
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProducts();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProducts();
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

  showCheckboxList = false;

  checkboxOptions = [
    { name: 'Option 1', selected: false },
    { name: 'Option 2', selected: false },
    { name: 'Option 3', selected: false },
  ];

  toggleCheckboxList() {
    this.showCheckboxList = !this.showCheckboxList;
  }

  getProductType(productType: number | undefined): string {
    if (productType === undefined) {
      return ''; // Trả về chuỗi rỗng hoặc một giá trị mặc định nếu productType là undefined
    }

    switch (productType) {
      case 1:
        return 'Sản phẩm';
      case 2:
        return 'Dịch Vụ';
      case 3:
        return 'Combo';
      default:
        return '';
    }
  }

  getProductGroupName(productTypeId: number | undefined): string {
    if (productTypeId === undefined) {
      return ''; // Trả về chuỗi rỗng nếu productTypeId là undefined
    }

    const group = this.productGroups.find(
      (group) => group.productTypeId === productTypeId
    );
    return group ? group.productTypeName : '';
  }

  getStatus(status: number | undefined): string {
    if (status === undefined) {
      return ''; // Trả về chuỗi rỗng nếu status là undefined
    }

    switch (status) {
      case 1:
        return 'Mở Bán';
      case 2:
        return 'Bị Ẩn';
      default:
        return '';
    }
  }
  selectedProduct: product | null = null;
  toggleDetail(product: product): void {
    this.selectedProduct = this.selectedProduct === product ? null : product;
  }
  AddProductDialog(): void {
    const dialogRef = this.dialog.open(AddProductDialogComponent, {
      autoFocus: false,
      width: '65%',
      height: '90%',
      maxWidth: 'none',
      minHeight: 'none',
    });
    dialogRef.afterClosed().subscribe(() => {
      this.applyFilter();
    });
  }
  AddServiceDialog(): void {
    const dialogRef = this.dialog.open(AddServiceDialogComponent, {
      autoFocus: false,
      width: '65%',
      height: '90%',
      maxWidth: 'none',
      minHeight: 'none',
    });
    dialogRef.afterClosed().subscribe(() => {
      this.applyFilter();
    });
  }
  AddComboDialog(): void {
    const dialogRef = this.dialog.open(AddComboDialogComponent, {
      autoFocus: false,
      width: '65%',
      height: '90%',
      maxWidth: 'none',
      minHeight: 'none',
    });
    dialogRef.afterClosed().subscribe(() => {
      this.applyFilter();
    });
  }
  isAllSelected(): boolean {
    return (
      this.products.length > 0 &&
      this.selectedProductIds.size === this.products.length
    );
  }

  toggleSelectAll(event: Event): void {
    const checkbox = event.target as HTMLInputElement;

    if (checkbox.checked) {
      // Chọn tất cả
      this.products.forEach((product) => {
        this.selectedProductIds.add(product.proAndSerId);
      });
    } else {
      // Bỏ chọn tất cả
      this.selectedProductIds.clear();
    }

    this.showActionMenu = this.selectedProductIds.size > 0;
    console.log('Selected product IDs:', this.selectedProductIds);
  }

  showActionMenu: boolean = false;
  selectedProductIds: Set<number> = new Set<number>();

  showActions(id: number) {
    if (this.selectedProductIds.has(id)) {
      this.selectedProductIds.delete(id);
    } else {
      this.selectedProductIds.add(id);
    }

    this.showActionMenu = this.selectedProductIds.size > 0;
    console.log('Selected product IDs:', this.selectedProductIds);
  }

  deleteProducts() {
    const idsToDelete = Array.from(this.selectedProductIds);
    this.productService.deleteMultipleProducts(idsToDelete).subscribe({
      next: (response) => {
        if (response.success) {
          console.log('Xóa thành công:', response);
          this.loadProducts();
        } else {
          console.error('Lỗi khi xóa sản phẩm:', response.message);
        }
      },
      error: (err) => {
        console.error('Lỗi khi gọi API xóa nhiều sản phẩm:', err);
      },
    });
  }

  showAddGroupDialog(): void {
    const dialogRef = this.dialog.open(AddProductGroupDialogComponent, {
      autoFocus: false,
      maxWidth: 'none',
      minHeight: 'none',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadProductGroups();
    });
  }
  exportToExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      this.products.map((product) => ({
        Tên: product.proAndSerName,
        Mã: product.proAndSerCode,
        'Thời gian làm': product.workTime,
        'Số lượng tồn kho': product.inventoryQuantity,
        'Giá gốc': product.originalPrice,
        'Giá bán': product.sellingPrice,
        'Đơn vị': product.unit,
        'Nhóm hàng': this.getProductGroupName(product.productTypeId),
        'Hoa hồng': product.commission,
        'Phân Loại': this.getProductType(product.proAndSerType),
        'Trạng thái': this.getStatus(product.status),
        'Hạn sử dụng': product.expiryDate
          ? new Date(product.expiryDate).toLocaleDateString('en-GB') // Định dạng ngày tháng: dd/MM/yyyy
          : '',
      }))
    );

    // Điều chỉnh độ rộng cột sao cho không nhỏ hơn chiều dài tên cột
    const columnNames = [
      'Tên',
      'Mã',
      'Thời gian làm',
      'Số lượng tồn kho',
      'Giá gốc',
      'Giá bán',
      'Đơn vị',
      'Nhóm hàng',
      'Hoa hồng',
      'Phân Loại',
      'Trạng thái',
      'Hạn sử dụng',
    ];

    // Xác định chiều rộng cột tối thiểu (bằng với chiều dài của tên cột)
    const colWidths: number[] = columnNames.map((name) => name.length);

    // Tính toán chiều rộng cột dựa trên dữ liệu
    this.products.forEach((product) => {
      const row = Object.values({
        Tên: product.proAndSerName,
        Mã: product.proAndSerCode,
        'Thời gian làm': product.workTime,
        'Số lượng tồn kho': product.inventoryQuantity,
        'Giá gốc': product.originalPrice,
        'Giá bán': product.sellingPrice,
        'Đơn vị': product.unit,
        'Nhóm hàng': this.getProductGroupName(product.productTypeId),
        'Hoa hồng': product.commission,
        'Phân Loại': this.getProductType(product.proAndSerType),
        'Trạng thái': this.getStatus(product.status),
        'Hạn sử dụng': product.expiryDate
          ? new Date(product.expiryDate).toLocaleDateString('en-GB') // Định dạng ngày tháng: dd/MM/yyyy
          : '',
      });

      row.forEach((value, index) => {
        const valueLength = value ? value.toString().length : 0;
        colWidths[index] = Math.max(colWidths[index], valueLength); // Đảm bảo chiều rộng cột phù hợp với dữ liệu
      });
    });

    // Áp dụng chiều rộng cột, thêm 2 đơn vị vào chiều dài cột để tránh việc cắt chữ
    ws['!cols'] = colWidths.map((width) => ({ wch: width + 2 }));

    // Tạo workbook mới
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sản phẩm');

    // Xuất ra file Excel
    XLSX.writeFile(wb, 'DanhSachSanPham.xlsx');
  }
}
