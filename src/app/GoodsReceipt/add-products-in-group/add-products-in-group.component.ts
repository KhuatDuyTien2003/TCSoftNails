import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ProductGroupService } from '../../services/product-group/product-group.service';
import { ProductGroup } from '../../app.type/product-group.type';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-products-in-group',
  standalone: true,
  templateUrl: './add-products-in-group.component.html',
  styleUrl: './add-products-in-group.component.scss',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class AddProductsInGroupComponent implements OnInit {
  productGroupForm!: FormGroup;
  productGroup: ProductGroup[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddProductsInGroupComponent>,
    private productGroupService: ProductGroupService, // Inject ProductGroupService
    private message: NzMessageService
  ) {
    this.productGroupForm = this.fb.group({
      productTypeId: [null, [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.loadProductGroup();
  }
  loadProductGroup(): void {
    this.productGroupService.getProductGroups().subscribe({
      next: (response) => {
        if (response.success) {
          this.productGroup = response.data;
        } else {
          this.productGroup = [];
          this.message.error(
            response.message || 'Không lấy được danh sách nhóm hàng'
          );
        }
      },
      error: (err) => {
        this.productGroup = [];
        this.message.error('Lỗi khi lấy danh sách nhóm hàng');
        console.error(err);
      },
    });
  }
  onSubmit(): void {
    if (this.productGroupForm.invalid) {
      const productTypeIdControl = this.productGroupForm.get('productTypeId');
      if (productTypeIdControl?.hasError('required')) {
        this.message.error('Bắt buộc chọn nhóm hàng.');
      }
      return;
    } else {
      const idProductGroup = this.productGroupForm.get('productTypeId')?.value;
      this.dialogRef.close(idProductGroup);
    }
  }
  onCancel(): void {
    this.dialogRef.close();
  }
}
