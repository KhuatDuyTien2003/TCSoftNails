import { product } from './../../app.type/product.type';
import { Component, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product/product.service';
import { EditProductDialogComponent } from '../edit-product-dialog/edit-product-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EditServiceDialogComponent } from '../edit-service-dialog/edit-service-dialog.component';
import { EditComboDialogComponent } from '../edit-combo-dialog/edit-combo-dialog.component';

@Component({
  selector: 'app-detail-product',
  standalone: true,
  templateUrl: './detail-product.component.html',
  styleUrls: ['./detail-product.component.scss'],
  imports: [CommonModule],
})
export class DetailProductComponent implements OnInit {
  @Output() productUpdated = new EventEmitter<void>();
  @Input() product?: product;
  selectedTab: string = 'info';
  images: any[] = [];
  bigImage: any;
  constructor(
    private productService: ProductService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.product?.proAndSerId) {
      this.getImagesByProductId(this.product.proAndSerId);
    } else {
      console.warn('Product is not defined or missing ProAndSerId.');
    }
  }

  selectTab(tab: string) {
    this.selectedTab = tab;
  }

  getImagesByProductId(productId: number): void {
    this.productService.getImagesByProductId(productId).subscribe({
      next: (response) => {
        if (response && response.success) {
          if (response.data) {
            this.images = response.data;
            this.bigImage = this.images[0];
          }
          console.log(this.images);
        } else {
          console.error(
            'Lỗi phản hồi từ server:',
            response?.message || 'Không có message'
          );
        }
      },
      error: (err) => {
        console.error('Lỗi khi gọi API lấy ảnh:', err);
      },
    });
  }

  onThumbnailClick(image: string): void {
    this.bigImage = image;
  }

  editProduct(): void {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }

    let dialogRef; // Khai báo dialogRef bên ngoài các khối if-else

    if (this.product?.proAndSerType == 1) {
      dialogRef = this.dialog.open(EditProductDialogComponent, {
        autoFocus: false,
        width: '65%',
        height: '90%',
        maxWidth: 'none',
        minHeight: 'none',
        data: {
          productId: this.product?.proAndSerId,
          images: this.images,
        },
      });
    } else if (this.product?.proAndSerType == 2) {
      dialogRef = this.dialog.open(EditServiceDialogComponent, {
        autoFocus: false,
        width: '65%',
        height: '90%',
        maxWidth: 'none',
        minHeight: 'none',
        data: {
          productId: this.product?.proAndSerId,
          images: this.images,
        },
      });
    } else {
      dialogRef = this.dialog.open(EditComboDialogComponent, {
        autoFocus: false,
        width: '65%',
        height: '90%',
        maxWidth: 'none',
        minHeight: 'none',
        data: {
          productId: this.product?.proAndSerId,
          images: this.images,
        },
      });
    }

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.productUpdated.emit();
      } else {
        console.log('Chưa lấy dữ liệu cập nhật mới lên');
      }
    });
  }

  deleteProduct(): void {
    if (this.product?.proAndSerId) {
      this.productService.deleteProduct(this.product.proAndSerId).subscribe({
        next: (response) => {
          if (response.success) {
            this.snackBar.open('Xóa thành công!', 'Close', {
              duration: 3000,
            });
            this.productUpdated.emit();
          } else {
            console.error(response.message);
          }
        },
        error: (err) => {
          console.error('Error deleting product:', err);
        },
      });
    } else {
      console.warn('Product ID is not defined for deletion.');
    }
  }
}
