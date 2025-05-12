import { Component, OnInit, Inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { ProductService } from '../../services/product/product.service';
import { ProductGroupService } from '../../services/product-group/product-group.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { QuillModule } from 'ngx-quill';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AddProductGroupDialogComponent } from '../add-product-group-dialog/add-product-group-dialog.component';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

@Component({
  selector: 'app-edit-product-dialog',
  standalone: true,
  templateUrl: './edit-product-dialog.component.html',
  styleUrls: ['./edit-product-dialog.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule,
    NzIconModule,
    NzDatePickerModule,
    NzInputModule,
    NzSelectModule,
    NzInputNumberModule,
  ],
})
export class EditProductDialogComponent implements OnInit {
  productForm!: FormGroup;
  selectedTab: string = 'info';
  productGroups: any[] = [];
  today: string = '';
  selectedImages: (string | null)[] = Array(10).fill(null);
  selectedFiles: ({ file: File; imageId: number } | null)[] =
    Array(10).fill(null);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditProductDialogComponent>,
    private productService: ProductService,
    private productGroupService: ProductGroupService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      productId: number;
      images: { imageId: number; imageUrl: string }[];
    }
  ) {}
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
  get unitControl() {
    return this.productForm.get('unit') as FormControl;
  }
  ngOnInit(): void {
    this.initForm();
    this.loadProductGroups();
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
      this.loadProductData(this.data.productId);
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
  detailsContent: string = '';

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  initForm() {
    this.productForm = this.fb.group({
      proAndSerName: ['', [Validators.required, Validators.minLength(3)]],
      proAndSerCode: [''],
      proAndSerType: [2],
      inventoryQuantity: [0, [Validators.min(0)]],
      originalPrice: [0, [Validators.min(0)]],
      sellingPrice: [0, [Validators.min(0)]],
      unit: [0],
      productTypeId: [''],
      commission: [0],
      status: ['', Validators.required],
      expiryDate: [null],
      description: [''],
    });
  }

  loadProductGroups() {
    this.productGroupService.getProductGroups().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.productGroups = response.data;
        }
      },
    });
  }

  loadProductData(productId: number) {
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

  onSubmit() {
    if (this.productForm.valid) {
      const formData = new FormData();
      if (this.productForm.value.expiryDate) {
        const expiryDate = this.productForm.value.expiryDate;
        const formattedExpiryDate = this.formatDate(expiryDate);
        formData.append('expiryDate', formattedExpiryDate);
        console.log('expiryDate', formattedExpiryDate);
      }
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
      console.log('sellingPrice', this.productForm.value.sellingPrice);
      // Thêm danh sách ảnh giữ lại để server biết xoá những ảnh khác
      formData.append('keptImageIds', keptImageIds.join(','));

      this.productService
        .updateProduct(this.data.productId, formData)
        .subscribe({
          next: () => {
            this.snackBar.open('Cập nhật sản phẩm thành công!', 'Close', {
              duration: 3000,
            });
            this.dialogRef.close(true);
          },
          error: (err) => console.error(err),
        });
    } else {
      this.productForm.markAllAsTouched();
    }
  }

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

  removeImageFile(index: number): void {
    this.selectedImages[index] = null;
    this.selectedFiles[index] = null;
  }

  openFileDialog(event: Event, index: number): void {
    const input = document.getElementById(
      'productImageFiles' + index
    ) as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  currentIndex: number = 0;

  prevImages(): void {
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
      this.loadProductData(this.data.productId);
    }
  }

  closeDialog() {
    this.dialogRef.close();
  }
}
