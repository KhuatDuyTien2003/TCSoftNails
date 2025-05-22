import { product } from './../../app.type/product.type';
import { GoodsReceiptService } from './../../services/goods-receipt/goods-receipt.service';
import { SupplierService } from './../../services/supplier/supplier.service';
import { CommonModule, NgFor } from '@angular/common';
import { Component } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { ProductService } from '../../services/product/product.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { Supplier } from '../../app.type/supplier.type';
import { MatDialog } from '@angular/material/dialog';
import { AddProductDialogComponent } from '../../Product/add-product-dialog/add-product-dialog.component';
import { AddProductsInGroupComponent } from '../add-products-in-group/add-products-in-group.component';
import { Router } from '@angular/router';

interface Staff {
  staffId: number;
  staffName: string;
}
@Component({
  selector: 'app-add-goods-receipt',
  standalone: true,
  templateUrl: './add-goods-receipt.component.html',
  styleUrl: './add-goods-receipt.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgFor,
    NzSpinModule,
    NzSelectModule,
  ],
})
export class AddGoodsReceiptComponent {
  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private message: NzMessageService,
    private supplierService: SupplierService,
    private goodsReceiptService: GoodsReceiptService,
    public dialog: MatDialog,
    private router: Router
  ) {
    this.receiptForm = this.fb.group({
      selectedProducts: [''],
      supplierId: [null, Validators.required],
      accountantId: [null],
      totalMoney: [0, Validators.min(0)],
      totalQuantity: [0, Validators.min(0)],
      paymentMoney: [0, Validators.min(0)],
      importDate: [new Date(), Validators.required],
      due: [0, Validators.min(0)],
      status: 0,
      comment: [''],
      receiptCode: [],
    });
  }

  get due(): number {
    const due = this.receiptForm.get('due') as FormControl;
    var dueMoney =
      this.totalMoney - this.receiptForm.get('paymentMoney')?.value || 0;
    due.setValue(dueMoney);
    return dueMoney;
  }
  get totalMoney(): number {
    return this.receiptForm.get('totalMoney')?.value || 0;
  }
  get totalQuantity(): number {
    return this.receiptForm.get('totalQuantity')?.value || 0;
  }
  get createTime(): number {
    return this.receiptForm.get('importDate')?.value || null;
  }
  supplierOptions: Supplier[] = [];
  receiptForm!: FormGroup;
  selectedProductId: number | null = null;
  searchSubject: Subject<string> = new Subject<string>();
  readonly nzFilterOption = (): boolean => true;
  listOfOption: product[] = [];
  search(value: string): void {
    const trimmedValue = value.trim();
    if (trimmedValue) {
      this.searchSubject.next(trimmedValue);
    } else {
      this.listOfOption = [];
    }
  }

  ngOnInit(): void {
    this.searchSubject
      .pipe(
        debounceTime(500),
        switchMap((value: string) =>
          this.productService.getOnlyProBySearch(value)
        )
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
    this.getAllSupplier();
    this.getAllStaff();
  }
  getAllSupplier(): void {
    this.supplierService.getAllSuppliers().subscribe({
      next: (response) => {
        if (response.success) {
          this.supplierOptions = response.data;
        } else {
          this.supplierOptions = [];
          this.message.error(
            response.message || 'Không lấy được danh sách nhà cung cấp'
          );
        }
      },
      error: (err) => {
        this.supplierOptions = [];
        this.message.error('Lỗi khi lấy danh sách nhà cung cấp');
        console.error(err);
      },
    });
  }
  staffOptions: Staff[] = [];
  getAllStaff(): void {
    this.goodsReceiptService.getAllStaff().subscribe({
      next: (response) => {
        if (response.success) {
          this.staffOptions = response.data;
        } else {
          this.staffOptions = [];
          this.message.error(
            response.message || 'Không lấy được danh sách nhân viên'
          );
        }
      },
      error: (err) => {
        this.staffOptions = [];
        this.message.error('Lỗi khi lấy danh sách nhân viên');
        console.error(err);
      },
    });
  }
  proAndSerList: product[] = [];
  selectedProAndSer: product[] = [];

  onSelectProduct(proAndSerId: number): void {
    console.log('Bạn vừa chọn ID:', proAndSerId);

    const selectedProduct = this.listOfOption.find(
      (p) => p.proAndSerId === proAndSerId
    );

    const alreadyExists = this.selectedProAndSer.some(
      (product) => product.proAndSerId === proAndSerId
    );

    if (selectedProduct && !alreadyExists) {
      selectedProduct.quantity = 1;
      selectedProduct.finalPrice =
        selectedProduct.sellingPrice * selectedProduct.quantity!;
      this.selectedProAndSer.push({ ...selectedProduct });

      console.log('ĐÃ THÊM THÀNH CÔNG:', this.selectedProAndSer);
      this.updateTotalMoney();
      this.updateTotalQuantity();
    } else {
      console.warn('Đã tồn tại hoặc không tìm thấy sản phẩm.');
    }
    setTimeout(() => {
      this.selectedProductId = null;
    });
  }
  quantity: number = 1;
  updateQuantity(index: number, newQty: number): void {
    if (newQty < 1) {
      return;
    }
    this.selectedProAndSer[index].quantity = newQty;
    this.selectedProAndSer[index].finalPrice =
      this.selectedProAndSer[index].sellingPrice * newQty;
    this.updateTotalMoney();
    this.updateTotalQuantity();
  }
  removeProduct(index: number): void {
    this.selectedProAndSer.splice(index, 1);
    this.updateTotalMoney();
    this.updateTotalQuantity();
  }
  removeAllProducts(): void {
    this.selectedProAndSer = [];
    this.updateTotalMoney();
    this.updateTotalQuantity();
  }
  private updateTotalMoney(): void {
    const total = this.selectedProAndSer.reduce(
      (sum, item) => sum + item.finalPrice!,
      0
    );
    const totalMoneyControl = this.receiptForm.get('totalMoney') as FormControl;
    totalMoneyControl.setValue(total); // tránh gán trực tiếp .value
  }
  private updateTotalQuantity(): void {
    const total = this.selectedProAndSer.reduce(
      (sum, item) => sum + item.quantity!,
      0
    );
    const totalQuantityControl = this.receiptForm.get(
      'totalQuantity'
    ) as FormControl;
    totalQuantityControl.setValue(total); // tránh gán trực tiếp .value
  }

  blockNonNumbers(event: KeyboardEvent): void {
    const allowedKeys = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Home',
      'End',
      'Enter',
    ];

    if (
      (event.key >= '0' && event.key <= '9') ||
      allowedKeys.includes(event.key)
    ) {
      return;
    }

    event.preventDefault();
  }

  AddProductDialog(): void {
    this.dialog.open(AddProductDialogComponent, {
      autoFocus: false,
      width: '65%',
      height: '90%',
      maxWidth: 'none',
      minHeight: 'none',
    });
  }
  AddProductInGroup(): void {
    var dialogRef = this.dialog.open(AddProductsInGroupComponent, {
      autoFocus: false,
      maxWidth: 'none',
      minHeight: 'none',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.findProductByGroup(result);
      }
    });
  }
  productsByGroup: product[] = [];

  findProductByGroup(idProductGroup: number): void {
    this.productService.getProductsByProductType(idProductGroup).subscribe({
      next: (res) => {
        if (res.success) {
          this.productsByGroup = res.data;

          // Thêm từng sản phẩm vào selectedProAndSer nếu chưa có
          this.productsByGroup.forEach((product) => {
            const alreadyExists = this.selectedProAndSer.some(
              (p) => p.proAndSerId === product.proAndSerId
            );
            if (!alreadyExists) {
              product.quantity = 1;
              product.finalPrice = product.sellingPrice * product.quantity!;
              this.selectedProAndSer.push({ ...product });
            }
          });

          this.updateTotalMoney();
          this.updateTotalQuantity();
        } else {
          this.productsByGroup = [];
          this.message.error(res.message);
        }
      },
      error: (err) => {
        this.productsByGroup = [];
        this.message.error('Lỗi khi lấy sản phẩm theo nhóm!');
      },
    });
  }

  private validateReceiptForm(): boolean {
    if (!this.receiptForm.valid) {
      this.message.error('Vui lòng nhập đầy đủ thông tin phiếu nhập!');
      return false;
    }
    if (this.selectedProAndSer.length === 0) {
      this.message.error('Vui lòng chọn ít nhất một sản phẩm!');
      return false;
    }
    if (!this.receiptForm.get('supplierId')?.value) {
      this.message.error('Vui lòng chọn nhà cung cấp!');
      return false;
    }

    if (this.selectedProAndSer.some((p) => !p.quantity || p.quantity < 1)) {
      this.message.error('Số lượng sản phẩm phải lớn hơn 0!');
      return false;
    }
    if (this.totalMoney < 0) {
      this.message.error('Tổng tiền không hợp lệ!');
      return false;
    }
    if (this.due < 0) {
      this.message.error('Trả thừa tiền hàng rồi!');
      return false;
    }
    if (this.totalQuantity < 1) {
      this.message.error('Tổng số lượng sản phẩm phải lớn hơn 0!');
      return false;
    }
    return true;
  }

  submitPayment(): void {
    if (!this.validateReceiptForm()) return;

    const selectedProducts = this.selectedProAndSer.map((product) => ({
      productId: product.proAndSerId,
      quantity: product.quantity,
      importPrice: product.originalPrice,
    }));

    this.receiptForm
      .get('selectedProducts')
      ?.setValue(JSON.stringify(selectedProducts));
    this.receiptForm.get('status')?.setValue(1);

    this.goodsReceiptService
      .createGoodsReceipt(this.receiptForm.value)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.message.success('Tạo phiếu nhập thành công!');
            this.router.navigate(['/goods-receipt']);
          } else {
            this.message.error(response.message || 'Tạo phiếu nhập thất bại!');
          }
        },
        error: (error) => {
          this.message.error('Lỗi khi tạo phiếu nhập!');
          console.error('Error while adding product:', error);
        },
      });
  }

  saveDraftReceipt(): void {
    if (!this.validateReceiptForm()) return;

    const selectedProducts = this.selectedProAndSer.map((product) => ({
      productId: product.proAndSerId,
      quantity: product.quantity,
      importPrice: product.originalPrice,
    }));

    this.receiptForm
      .get('selectedProducts')
      ?.setValue(JSON.stringify(selectedProducts));
    this.receiptForm.get('status')?.setValue(0);

    this.goodsReceiptService
      .createGoodsReceipt(this.receiptForm.value)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.message.success('Lưu phiếu tạm thành công!');
            this.router.navigate(['/goods-receipt']);
          } else {
            this.message.error(response.message || 'Lưu phiếu tạm thất bại!');
          }
        },
        error: (error) => {
          this.message.error('Lỗi khi lưu phiếu tạm!');
          console.error('Error while saving draft receipt:', error);
        },
      });
  }
  back(): void {
    this.router.navigate(['/goods-receipt']);
  }
}
