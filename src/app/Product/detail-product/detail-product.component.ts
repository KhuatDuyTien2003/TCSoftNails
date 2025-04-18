import { product } from './../../app.type/product.type';
import { Component, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product/product.service';
import { EditProductDialogComponent } from '../edit-product-dialog/edit-product-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { EventEmitter } from '@angular/core';

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
    public dialog: MatDialog
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
        if (response.success) {
          this.images = response.data;
          this.bigImage = this.images[0];
          console.log(this.images);
        } else {
          console.error(response.message);
        }
      },
      error: (err) => {
        console.error('Error fetching images:', err);
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
    const dialogRef = this.dialog.open(EditProductDialogComponent, {
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
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.productUpdated.emit();
      } else {
        console.log('Chưa lấy dữ liệu cập nhật mới lên');
      }
    });
  }
}
