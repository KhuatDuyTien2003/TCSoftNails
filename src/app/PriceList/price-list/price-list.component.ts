import { Component } from '@angular/core';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { ProductGroupService } from '../../services/product-group/product-group.service';
import { ProductService } from '../../services/product/product.service';
import { MatDialog } from '@angular/material/dialog';
import { ProductGroup } from '../../app.type/product-group.type';
import { AddPriceListComponent } from '../add-price-list/add-price-list.component';
import { CommonModule, NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PriceListService } from '../../services/price-list/price-list.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { FilterCriteria } from '../../app.type/filter-criteria.type';
import { PriceList } from '../../app.type/price-list.type';
import { product } from '../../app.type/product.type';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditPriceListComponent } from '../edit-price-list/edit-price-list.component';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-price-list',
  standalone: true,
  templateUrl: './price-list.component.html',
  styleUrl: './price-list.component.scss',
  imports: [CommonModule, FormsModule, NgFor, NzSpinModule, NzSelectModule],
})
export class PriceListComponent {
  groupSearchTerm: string = '';
  private groupSearchSubject = new Subject<void>();
  private productSearchSubject = new Subject<void>();
  filteredGroups: ProductGroup[] = [];
  productGroups: ProductGroup[] = [];
  selectedProductGroup: number | null = null;
  productSearchTerm: string = '';

  constructor(
    private productGroupService: ProductGroupService,
    private priceListService: PriceListService,
    private productService: ProductService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private message: NzMessageService
  ) {
    this.groupSearchSubject
      .pipe(debounceTime(300))
      .subscribe(() => this.filterGroups());
    this.productSearchSubject
      .pipe(debounceTime(300))
      .subscribe(() => this.applyFilter());
  }
  priceList: PriceList[] = [];
  products: product[] = [];
  selectedPriceList: number | null = null;
  isLoading = false;
  currentPage: number = 1;
  pageSize: number = 12;
  totalItems: number = 0;
  totalPages: number = 0;
  loadPriceList(): void {
    this.isLoading = true;
    this.priceList = [];
    this.priceListService.GetPriceList().subscribe((data) => {
      this.isLoading = false;
      this.priceList = [...this.priceList, ...data];
      this.resetFilter();
    });
  }

  ngOnInit() {
    this.loadProductGroups();
    this.loadPriceList();

    this.searchSubject
      .pipe(
        debounceTime(500),
        switchMap((value: string) => this.productService.getProBySearch(value))
      )
      .subscribe({
        next: (response: any) => {
          if (response.success == true) {
            this.listOfOption = response.data.length > 0 ? response.data : [];
          } else {
            this.listOfOption = [];
            console.log('No products found or error in response.');
          }
        },
        error: (err) => {
          console.error('Error during search:', err);
          this.listOfOption = [];
        },
      });
  }
  resetFilter() {
    this.filteredGroups = [...this.productGroups];
    if (this.priceList && this.priceList.length > 0) {
      this.selectedPriceList = this.priceList[0].priceListId;
    } else {
      this.selectedPriceList = null;
    }
    this.selectedProductGroup = null;
    this.currentPage = 1;
    this.applyFilter();
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
  debounceFilterGroups() {
    this.groupSearchSubject.next();
  }
  debounceApplyFilter() {
    this.productSearchSubject.next();
  }
  selectGroup(groupId: number | null) {
    if (this.selectedProductGroup === groupId) {
      this.selectedProductGroup = null;
    } else {
      this.selectedProductGroup = groupId;
    }
    this.applyFilter();
  }
  applyFilter() {
    this.currentPage = 1;
    this.loadProducts();
  }
  loadProducts() {
    this.isLoading = true;
    const filterCriteria: FilterCriteria = {
      productGroup: this.selectedProductGroup ?? undefined,
      searchTerm: this.productSearchTerm,
      pageNumber: this.currentPage,
      pageSize: this.pageSize,
      priceListId: this.selectedPriceList
        ? Number(this.selectedPriceList)
        : undefined,
    };

    console.log('Bộ lọc:', filterCriteria);

    this.priceListService.getByFilter(filterCriteria).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.products = Array.isArray(response.data) ? response.data : [];
          this.totalItems = response.totalItems;
          this.totalPages = response.totalPages;
          this.currentPage = response.currentPage;
          console.log('Thông điệp', response.message);
        } else {
          this.products = [];
          this.totalItems = 0;
          this.totalPages = 0;
          console.log('Thông báo lỗi từ server:', response.message);
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
  getProductGroupName(productTypeId: number | undefined): string {
    if (productTypeId === undefined) {
      return ''; // Trả về chuỗi rỗng nếu productTypeId là undefined
    }

    const group = this.productGroups.find(
      (group) => group.productTypeId === productTypeId
    );
    return group ? group.productTypeName : '';
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

  showAddPriceList(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    const dialogRef = this.dialog.open(AddPriceListComponent, {
      autoFocus: false,
      maxWidth: 'none',
      minHeight: 'none',
    });

    dialogRef.afterClosed().subscribe(() => {
      this.loadPriceList();
    });
  }
  showEditPriceList(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    if (this.selectedPriceList) {
      const priceList = this.priceList.find(
        (list) => list.priceListId === this.selectedPriceList
      );
      if (priceList) {
        const dialogRef = this.dialog.open(EditPriceListComponent, {
          autoFocus: false,
          maxWidth: 'none',
          minHeight: 'none',
          data: { priceList: priceList },
        });
        dialogRef.afterClosed().subscribe(() => {
          this.loadPriceList();
        });
      }
    }
  }
  addGroupProToList(idGroupPro: number) {
    if (this.selectedPriceList) {
      console.log('ID nhóm hàng:', idGroupPro);
      this.priceListService
        .AddGroupProToList(idGroupPro, this.selectedPriceList)
        .subscribe({
          next: (response) => {
            if (response.success) {
              console.log('Thêm nhóm hàng thành công:', response.data);
              this.applyFilter();
            } else {
              console.error('Lỗi khi thêm nhóm hàng:', response.message);
            }
          },
          error: (error) => {
            console.error('Lỗi khi thêm nhóm hàng:', error);
          },
        });
    }
  }
  updateSellingPrice(productId: number) {
    if (this.selectedPriceList) {
      const product = this.products.find(
        (item) => item.proAndSerId === productId
      );
      if (product) {
        const sellPrice = product.sellingPrice;
        this.priceListService
          .UpdateSellingPrice(
            this.selectedPriceList,
            productId,
            Number(sellPrice)
          )
          .subscribe({
            next: (response) => {
              if (response.success) {
                this.snackBar.open(response.message, 'Đóng', {
                  duration: 3000,
                });
                this.loadProducts();
              } else {
                console.error('Lỗi khi cập nhật giá bán:', response.message);
              }
            },
            error: (error) => {
              console.error('Lỗi khi cập nhật giá bán:', error);
            },
          });
      }
    }
  }
  listId: number[] = [];
  removeAllProducts() {
    if (this.selectedPriceList) {
      this.listId = this.products.map((item) => item.proAndSerId);
      if (this.listId.length === 0) {
        this.snackBar.open('Không có sản phẩm nào để xóa', 'Đóng', {
          duration: 3000,
        });
        return;
      }
      this.priceListService
        .removeAllProducts(this.selectedPriceList, this.listId)
        .subscribe({
          next: (response) => {
            if (response.success == true) {
              this.snackBar.open(response.message, 'Đóng', {
                duration: 3000,
              });
              this.loadProducts();
            } else {
              console.error('Lỗi khi xóa tất cả sản phẩm:', response.message);
            }
          },
          error: (error) => {
            console.error('Lỗi khi xóa tất cả sản phẩm:', error);
          },
        });
    }
  }
  removeProduct(productId: number) {
    if (this.selectedPriceList) {
      this.priceListService
        .removeProduct(this.selectedPriceList, productId)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open(response.message, 'Đóng', {
                duration: 3000,
              });
              this.loadProducts();
            } else {
              console.error('Lỗi khi xóa sản phẩm:', response.message);
            }
          },
          error: (error) => {
            console.error('Lỗi khi xóa sản phẩm:', error);
          },
        });
    }
  }
  getPriceListName() {
    if (this.selectedPriceList === null) {
      return '';
    }

    const priceList = this.priceList.find(
      (list) => list.priceListId === this.selectedPriceList
    );
    return priceList ? priceList.priceListName : '';
  }

  selectedProductId: number | null = null;
  searchSubject: Subject<string> = new Subject<string>();
  readonly nzFilterOption = (): boolean => true;
  listOfOption: product[] = [];
  search(value: string): void {
    if (value) {
      this.searchSubject.next(value);
    } else {
      this.listOfOption = [];
    }
  }
  onSelectProduct(proAndSerId: number): void {
    console.log('Bạn vừa chọn ID:', proAndSerId);
    //bảng giá
    console.log('ID bảng giá hiện tại:', this.selectedPriceList);
    const alreadyExists = this.products.some(
      (product) => product.proAndSerId === proAndSerId
    );
    if (this.selectedPriceList === null) {
      this.message.warning('Vui lòng chọn bảng giá trước khi thêm sản phẩm.');
      return;
    }
    if (!alreadyExists) {
      this.priceListService
        .addProductToList(this.selectedPriceList, proAndSerId)
        .subscribe({
          next: (response) => {
            if (response.success) {
              this.message.success(response.message);
              this.loadProducts();
            } else {
              this.message.warning(response.message);
            }
          },
          error: (err) => {
            console.error('Lỗi khi thêm sản phẩm:', err);
            this.message.error('Thêm sản phẩm thất bại.');
          },
        });
    } else {
      this.message.error('Sản phẩm đã có trong bảng giá.');
    }
    setTimeout(() => {
      this.selectedProductId = null;
    });
  }
}
