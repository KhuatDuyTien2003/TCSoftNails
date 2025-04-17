import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { CategoryService } from '../../services/category/category.service';
import { ProductGroupService } from '../../services/product-group/product-group.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category } from '../../app.type/category.type';

@Component({
  selector: 'app-add-product-group-dialog',
  standalone: true,
  templateUrl: './add-product-group-dialog.component.html',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  styleUrls: ['./add-product-group-dialog.component.scss'],
})
export class AddProductGroupDialogComponent implements OnInit {
  productGroupForm!: FormGroup;
  Categories: Category[] = []; // Array to hold category data

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<AddProductGroupDialogComponent>,
    private categoryService: CategoryService, // Inject CategoryService
    private productGroupService: ProductGroupService, // Inject ProductGroupService
    private snackBar: MatSnackBar // Inject MatSnackBar for notifications
  ) {}

  ngOnInit(): void {
    this.productGroupForm = this.fb.group({
      productTypeName: ['', [Validators.required, Validators.minLength(3)]],
      categoryId: [],
      status: [true],
    });

    // Fetch categories from the backend
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (response: any) => {
        this.Categories = response.data;
      },
      error: (error) => {
        console.error('Error loading categories:', error);
      },
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.productGroupForm.invalid) {
      this.productGroupForm.markAllAsTouched();
    } else {
      const productGroupData = this.productGroupForm.value;
      console.log(productGroupData);
      this.productGroupService.createProductGroup(productGroupData).subscribe({
        next: (response) => {
          console.log('Product group added successfully:', response);
          this.dialogRef.close('success'); // Close dialog and pass success
          this.snackBar.open('Product group added successfully!', 'Close', {
            duration: 3000,
          });
        },
        error: (error) => {
          console.error('Error adding product group:', error);
          this.snackBar.open(
            'There was an error adding the product group.',
            'Close',
            { duration: 3000 }
          );
        },
      });
    }
  }
}
