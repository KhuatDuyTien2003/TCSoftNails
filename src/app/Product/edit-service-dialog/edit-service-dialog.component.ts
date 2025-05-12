import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
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
import { NzIconModule } from 'ng-zorro-antd/icon';
import { QuillModule } from 'ngx-quill';
import { ProductService } from '../../services/product/product.service';
import { ProductGroupService } from '../../services/product-group/product-group.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AddProductGroupDialogComponent } from '../add-product-group-dialog/add-product-group-dialog.component';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

@Component({
  selector: 'app-edit-service-dialog',
  standalone: true,
  templateUrl: './edit-service-dialog.component.html',
  styleUrl: './edit-service-dialog.component.scss',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    QuillModule,
    NzIconModule,
    NzInputModule,
    NzSelectModule,
    NzInputNumberModule,
  ],
})
export class EditServiceDialogComponent implements OnInit {
  productForm!: FormGroup;
  selectedTab: string = 'info';
  productGroups: any[] = [];

  selectedImages: (string | null)[] = Array(10).fill(null);
  selectedFiles: ({ file: File; imageId: number } | null)[] =
    Array(10).fill(null);

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<EditServiceDialogComponent>,
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
      proAndSerType: [1],
      originalPrice: [0, [Validators.min(0)]],
      sellingPrice: [0, [Validators.min(0)]],
      unit: [0],
      productTypeId: [''],
      commission: [0],
      status: ['', Validators.required],
      workTime: [0, [Validators.min(0)]],
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
        this.productForm.patchValue(product);
      },
      error: (err) => console.error(err),
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formData = new FormData();

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
