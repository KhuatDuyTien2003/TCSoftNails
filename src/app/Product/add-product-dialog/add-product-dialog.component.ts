import { ProductService } from '../../services/product/product.service';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
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
@Component({
  selector: 'app-add-product-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule,
    NzIconModule,
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
      unit: [''],
      productTypeId: [''],
      commission: [''],
      status: ['', Validators.required],
      expiryDate: [''],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadProductGroups();
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
          this.productForm.reset(); // Reset form sau khi thêm sản phẩm thành công
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

  openFileDialog(event: KeyboardEvent, index: number): void {
    // Ví dụ: nếu phím Enter được nhấn, bạn có thể kích hoạt input tương ứng
    if (event.key === 'Enter') {
      const inputElem = document.getElementById(
        'productImageFiles' + index
      ) as HTMLElement;
      if (inputElem) {
        inputElem.click();
      }
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
