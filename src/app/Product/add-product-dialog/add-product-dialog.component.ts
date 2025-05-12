import { ProductService } from '../../services/product/product.service';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { ProductGroupService } from '../../services/product-group/product-group.service';
import { ProductGroup } from '../../app.type/product-group.type';
import { AddProductGroupDialogComponent } from '../add-product-group-dialog/add-product-group-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
@Component({
  selector: 'app-add-product-dialog',
  standalone: true,
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
  templateUrl: './add-product-dialog.component.html',
  styleUrls: ['./add-product-dialog.component.scss'],
})
export class AddProductDialogComponent implements OnInit {
  // Mảng lưu trữ preview của 10 ảnh, khởi tạo 10 phần tử null
  selectedImages: (string | null)[] = Array(10).fill(null);

  // Form group for product form
  productForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddProductDialogComponent>,
    private productService: ProductService,
    private productGroupService: ProductGroupService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      proAndSerName: ['', [Validators.required, Validators.minLength(3)]],
      proAndSerCode: [''],
      proAndSerType: [1],
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
    this.loadProductGroups();
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

  onSubmit() {
    if (this.productForm.valid) {
      const formData = new FormData();
      if (this.productForm.value.expiryDate) {
        const expiryDate = this.productForm.value.expiryDate;
        const formattedExpiryDate = this.formatDate(expiryDate);
        formData.append('expiryDate', formattedExpiryDate);
        console.log('expiryDate', formattedExpiryDate);
      }

      // Thêm các trường dữ liệu
      Object.entries(this.productForm.value).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Thêm ảnh (LỌC BỎ NULL)
      this.selectedFiles
        .filter((file) => file !== null)
        .forEach((file) => {
          formData.append('Images', file!); // Dùng '!' để xác định non-null
        });

      // // Debug: Log tất cả entries
      // for (const pair of formData.entries()) {
      //   console.log(pair[0], pair[1]);
      // }

      // Gọi API
      this.productService.postProduct(formData).subscribe({
        next: (response) => {
          console.log('Product added successfully:', response);
          this.resetForm();
          this.snackBar.open('Thêm Sản Phẩm Thành Công!', 'Close', {
            duration: 3000,
          });
        },
        error: (error) => console.error(error),
      });
    } else {
      this.productForm.markAllAsTouched();
    }
  }
  resetForm() {
    this.productForm.reset(); // Reset form
    this.selectedImages.fill(null); // Reset selected images
    this.selectedFiles.fill(null); // Reset selected files
  }
  onCancel(): void {
    this.dialogRef.close();
  }
  closeDialog() {
    this.dialogRef.close();
  }

  selectedFiles: (File | null)[] = Array(10).fill(null);

  // Hàm xử lý khi người dùng chọn file
  onFileSelected(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.selectedFiles[index] = file; // Lưu file gốc

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
  removeImageFile(index: number) {
    this.selectedImages[index] = null; // Xóa ảnh tại vị trí index
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
