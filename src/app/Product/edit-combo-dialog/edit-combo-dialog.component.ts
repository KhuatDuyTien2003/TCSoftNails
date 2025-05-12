import { Component, Inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ProductService } from '../../services/product/product.service';
import { ProductGroupService } from '../../services/product-group/product-group.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { debounceTime, Subject, switchMap } from 'rxjs';
import { product } from '../../app.type/product.type';
import { ProductGroup } from '../../app.type/product-group.type';
import { AddProductGroupDialogComponent } from '../add-product-group-dialog/add-product-group-dialog.component';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

@Component({
  selector: 'app-edit-combo-dialog',
  standalone: true,
  templateUrl: './edit-combo-dialog.component.html',
  styleUrl: './edit-combo-dialog.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule,
    NzIconModule,
    NzSelectModule,
    NzDatePickerModule,
    NzInputModule,
    NzInputNumberModule,
  ],
})
export class EditComboDialogComponent implements OnInit {
  // Mảng lưu trữ preview của 10 ảnh, khởi tạo 10 phần tử null
  selectedImages: (string | null)[] = Array(10).fill(null);

  // Form group for product form
  productForm!: FormGroup;
  selectedFiles: ({ file: File; imageId: number } | null)[] =
    Array(10).fill(null);
  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditComboDialogComponent>,
    private productService: ProductService,
    private productGroupService: ProductGroupService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      productId: number;
      images: { imageId: number; imageUrl: string }[];
    }
  ) {
    this.productForm = this.fb.group({
      selectedProducts: this.fb.array([]),
      proAndSerName: ['', [Validators.required, Validators.minLength(3)]],
      proAndSerCode: [''],
      proAndSerType: [3],
      originalPrice: [0, [Validators.min(0)]],
      sellingPrice: [0, [Validators.min(0)]],
      productTypeId: [''],
      commission: [0],
      unit: [0],
      status: ['', Validators.required],
      expiryDate: [null],
      description: [''],
    });
  }
  disabledDate = (current: Date): boolean => {
    // So sánh ngày hiện tại (dùng getTime để lấy timestamp) với ngày được kiểm tra
    return current && current.getTime() < new Date().setHours(0, 0, 0, 0);
  };
  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0'); // Lấy ngày
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Lấy tháng
    const year = date.getFullYear(); // Lấy năm
    return `${day}/${month}/${year}`; // Trả về ngày theo định dạng dd/MM/yyyy
  }
  searchSubject: Subject<string> = new Subject<string>();
  readonly nzFilterOption = (): boolean => true;
  finalPriceProducts: number = 0;
  proAndSerList: product[] = [];
  selectedProAndSer: product[] = [];
  listOfOption: product[] = [];
  search(value: string): void {
    if (value) {
      this.searchSubject.next(value);
    } else {
      this.listOfOption = [];
    }
  }

  selectedProductId: number | null = null;

  removeProduct(index: number): void {
    const selectedArray = this.productForm.get('selectedProducts') as FormArray;
    this.selectedProAndSer.splice(index, 1);
    selectedArray.removeAt(index);
    this.finalPriceProducts = this.selectedProAndSer.reduce(
      (total, product) => total + product.finalPrice!,
      0
    );
  }
  removeAllProducts(): void {
    const selectedArray = this.productForm.get('selectedProducts') as FormArray;
    this.selectedProAndSer = [];
    selectedArray.clear();
    this.finalPriceProducts = 0;
  }
  onSelectProduct(proAndSerId: number): void {
    console.log('Bạn vừa chọn ID:', proAndSerId);

    const selectedProduct = this.listOfOption.find(
      (p) => p.proAndSerId === proAndSerId
    );

    const selectedArray = this.productForm.get('selectedProducts') as FormArray;

    const alreadyExists = selectedArray.controls.some(
      (product) => product.value.proAndSerId === proAndSerId
    );

    if (selectedProduct && !alreadyExists) {
      selectedProduct.quantity = 1;
      selectedProduct.finalPrice =
        selectedProduct.sellingPrice * selectedProduct.quantity!;
      this.selectedProAndSer.push({ ...selectedProduct });
      const productGroup = this.fb.group({
        proAndSerId: [selectedProduct.proAndSerId],
        quantity: [1, [Validators.min(1)]],
      });

      selectedArray.push(productGroup);
      console.log('chọn thành công:', this.selectedProAndSer);
      this.finalPriceProducts = this.selectedProAndSer.reduce(
        (total, product) => total + product.finalPrice!,
        0
      );
    } else {
      console.warn('Đã tồn tại hoặc không tìm thấy sản phẩm.');
    }
    setTimeout(() => {
      this.selectedProductId = null;
    });
  }

  updateQuantity(index: number, newQty: number): void {
    const selectedArray = this.productForm.get('selectedProducts') as FormArray;

    const control = selectedArray.at(index);
    if (!control) {
      console.error(`Không tìm thấy control tại index ${index}`);
      return;
    }

    // Cập nhật giá trị số lượng
    control.get('quantity')?.setValue(newQty);

    // Cập nhật giá trị trong mảng selectedProAndSer
    if (this.selectedProAndSer[index]) {
      this.selectedProAndSer[index].quantity = newQty;
      this.selectedProAndSer[index].finalPrice =
        this.selectedProAndSer[index].sellingPrice * newQty;

      // Tính lại tổng giá
      this.finalPriceProducts = this.selectedProAndSer.reduce(
        (total, product) => total + product.finalPrice!,
        0
      );
    } else {
      console.error(`Không tìm thấy sản phẩm tại index ${index}`);
    }
  }
  get unitControl() {
    return this.productForm.get('unit') as FormControl;
  }

  ngOnInit(): void {
    this.loadProductGroups();
    this.searchSubject
      .pipe(
        debounceTime(500), // Chờ 500ms (0,5 giây) trước khi thực hiện tìm kiếm
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
    if (this.data?.images) {
      this.data.images.forEach((image, index) => {
        this.selectedFiles[index] = {
          file: null as any,
          imageId: image.imageId,
        };
        this.selectedImages[index] = image.imageUrl;
      });
    }

    if (this.data?.productId) {
      this.loadComboData(this.data.productId);
      this.loadDetailCombo(this.data.productId);
    }
    this.unitControl.valueChanges.subscribe((value) => {
      this.onUnitChange(value);
    });
  }
  onUnitChange(value: number) {
    const commissionControl = this.productForm.get('commission') as FormControl;

    if (value === 1) {
      // Nếu là %
      const currentValue = commissionControl.value;
      if (currentValue > 100) {
        commissionControl.setValue(100);
      }
    } else {
      // Nếu là VND
      if (
        commissionControl.value !== null &&
        commissionControl.value % 1 !== 0
      ) {
        commissionControl.setValue(Math.round(commissionControl.value));
      }
    }
  }
  loadComboData(productId: number) {
    this.productService.getProductById(productId).subscribe({
      next: (product) => {
        // Chuyển đổi expiryDate thành Date nếu nó là chuỗi
        if (product.expiryDate && typeof product.expiryDate === 'string') {
          product.expiryDate = new Date(product.expiryDate);
        }
        this.productForm.patchValue(product);
      },
      error: (err) => console.error(err),
    });
  }

  loadDetailCombo(productId: number) {
    this.productService.getDetailCombo(productId).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.selectedProAndSer = response.data;
          this.selectedProAndSer.forEach((item) => {
            item.finalPrice = item.sellingPrice * (item.quantity ?? 1);
          });
          this.finalPriceProducts = this.selectedProAndSer.reduce(
            (total, product) => total + product.finalPrice!,
            0
          );
          const selectedArray = this.productForm.get(
            'selectedProducts'
          ) as FormArray;
          this.selectedProAndSer.forEach((item) => {
            const productGroup = this.fb.group({
              proAndSerId: [item.proAndSerId],
              quantity: [item.quantity, [Validators.min(1)]],
            });
            selectedArray.push(productGroup);
          });
        } else {
          console.error('Thông báo lỗi từ server:', response.message);
        }
      },
      error: (err) => console.error(err),
    });
  }

  selectedTab: string = 'info';
  detailsContent: string = '';

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  productGroups: ProductGroup[] = [];
  loadProductGroups() {
    this.productGroupService.getProductGroups().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.productGroups = response.data;
          console.log('Danh sách nhóm hàng:', this.productGroups);
        } else {
          console.error('Thông báo lỗi từ server:', response.message);
        }
      },
    });
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formData = new FormData();

      // Chuẩn bị danh sách sản phẩm đã chọn
      const selectedProducts = this.selectedProAndSer.map((product) => ({
        proAndSerId: product.proAndSerId,
        quantity: product.quantity,
      }));
      formData.append('selectedProducts', JSON.stringify(selectedProducts));
      this.productForm.get('originalPrice')?.setValue(this.finalPriceProducts);
      if (this.productForm.value.expiryDate) {
        const expiryDate = this.productForm.value.expiryDate;
        const formattedExpiryDate = this.formatDate(expiryDate);
        formData.append('expiryDate', formattedExpiryDate);
        console.log('expiryDate', formattedExpiryDate);
      }
      console.log(
        'Danh sách sản phẩm đã chọn (trong FormData):',
        formData.get('selectedProducts')
      );
      Object.entries(this.productForm.value).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });
      const keptImageIds: number[] = [];

      this.selectedFiles.forEach((item) => {
        const id = item?.imageId;

        // 1) Ảnh mới
        if (id === 0 && item?.file instanceof File) {
          formData.append('images', item.file);
        }
        // 2) Ảnh cũ
        else if (id && id !== 0) {
          // giữ lại ảnh cũ
          keptImageIds.push(id);
        }
      });

      // Thêm danh sách ảnh giữ lại để server biết xoá những ảnh khác
      formData.append('keptImageIds', keptImageIds.join(','));

      // Gọi API để gửi dữ liệu
      this.productService.updateCombo(this.data.productId, formData).subscribe({
        next: () => {
          this.snackBar.open('Cập nhật Combo thành công!', 'Close', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },

        error: (error) => {
          console.error('Error while adding product:', error);
          this.snackBar.open('Đã xảy ra lỗi khi Cập nhật Combo!', 'Đóng', {
            duration: 3000,
          });
        },
      });
    } else {
      // Đánh dấu tất cả các trường là "touched" để hiển thị lỗi
      this.productForm.markAllAsTouched();
      this.snackBar.open('Vui lòng kiểm tra lại thông tin!', 'Đóng', {
        duration: 3000,
      });
    }
  }
  resetForm() {
    if (this.data?.images) {
      this.data.images.forEach((image, index) => {
        this.selectedFiles[index] = {
          file: null as any,
          imageId: image.imageId,
        };
        this.selectedImages[index] = image.imageUrl;
      });
    }

    if (this.data?.productId) {
      this.loadComboData(this.data.productId);
      this.loadDetailCombo(this.data.productId);
    }
  }
  onCancel(): void {
    this.dialogRef.close();
  }
  closeDialog() {
    this.dialogRef.close();
  }

  // Hàm xử lý khi người dùng chọn file
  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFiles[index] = {
        file: file,
        imageId: this.selectedFiles[index]?.imageId || 0,
      };

      const reader = new FileReader();
      reader.onload = () => {
        this.selectedImages[index] = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  openFileDialog(event: Event, index: number): void {
    const inputElem = document.getElementById(
      'productImageFiles' + index
    ) as HTMLElement;
    if (inputElem) {
      inputElem.click();
    }
  }
  removeImageFile(index: number): void {
    this.selectedImages[index] = null;
    this.selectedFiles[index] = null;
  }
  currentIndex: number = 0;

  prevImages(): void {
    // Nếu currentIndex lớn hơn 0, trừ đi 5 để quay lại nhóm ảnh trước
    if (this.currentIndex > 0) {
      this.currentIndex -= 5;
    }
  }

  nextImages(): void {
    const maxStartIndex = this.selectedImages.length - 5;
    this.currentIndex = Math.min(this.currentIndex + 5, maxStartIndex);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddProductGroupDialogComponent, {
      autoFocus: false,
      height: '90%',
      maxWidth: 'none',
      minHeight: 'none',
    });
    dialogRef.afterClosed().subscribe(() => {
      this.loadProductGroups();
    });
  }
}
