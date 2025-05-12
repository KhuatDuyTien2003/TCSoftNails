import { Component } from '@angular/core';
import { PromotionService } from '../../../services/promotion.service';
import { Router } from '@angular/router';
import { Promotion } from '../../../app.type/Promotion.type';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-promotion-add',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './promotion-add.component.html',
  styleUrl: './promotion-add.component.css',
})
export class PromotionAddComponent {
  promotionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private promotionService: PromotionService,
    private router: Router
  ) {
    this.promotionForm = this.fb.group({
      promotionName: ['', Validators.required],
      promotionType: [false],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(0)]],
      productTypeId: [0, Validators.required],
      isPoints: [false],
      condition: [0, Validators.required],
      rankId: [0, Validators.required],
      urlImage: ['', Validators.required],
      isDeleted: [false],
      status: [false],
      value_data: [0, Validators.required],
    });
  }

  goBack() {
    this.router.navigate(['/promotion-list']);
  }

  onSubmit() {
    if (this.promotionForm.invalid) {
      this.promotionForm.markAllAsTouched();
      return;
    }

    this.promotionService.createPromotion(this.promotionForm.value).subscribe({
      next: (res) => {
        if (res.success) {
          alert(res.message);
          this.router.navigate(['/promotion-list']);
        }
      },
      error: (err) => {
        console.error('Lỗi thêm mới:', err);
      },
    });
  }
}
