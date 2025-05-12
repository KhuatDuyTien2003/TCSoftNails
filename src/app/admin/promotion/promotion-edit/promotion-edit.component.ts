import { Component, OnInit } from '@angular/core';
import { Promotion } from '../../../../app/app.type/promotion.type';
import { ActivatedRoute, Router } from '@angular/router';
import { PromotionService } from '../../../services/promotion.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators,  } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-promotion-edit',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './promotion-edit.component.html',
  styleUrl: './promotion-edit.component.css'
})
export class PromotionEditComponent implements OnInit {
  promotionId!: number;
  promotionForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private promotionService: PromotionService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.promotionId = +params['id'];
      this.loadPromotion(this.promotionId);
    });
  }

  goBack() {
    this.router.navigate(['/promotion-list']);
  }

  loadPromotion(id: number) {
    this.promotionService.getPromotionById(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.initForm(res.data);
        }
      },
      error: (err) => {
        console.error('Lỗi lấy Promotion theo id:', err);
      }
    });
  }

  initForm(promotion: any) {
    this.promotionForm = this.fb.group({
      promotionName: [promotion.promotionName, Validators.required],
      promotionType: [promotion.promotionType],
      startDate: [promotion.startDate, Validators.required],
      endDate: [promotion.endDate, Validators.required],
      quantity: [promotion.quantity, [Validators.required, Validators.min(0)]],
      productTypeId: [promotion.productTypeId, Validators.required],
      isPoints: [promotion.isPoints],
      condition: [promotion.condition, Validators.required],
      rankId: [promotion.rankId, Validators.required],
      urlImage: [promotion.urlImage, Validators.required],
      isDeleted: [promotion.isDeleted],
      status: [promotion.status],
      value_data:[promotion.value_data]
    });
  }

  onSubmit() {
    if (this.promotionForm.invalid) {
      this.promotionForm.markAllAsTouched();
      return;
    }

    this.promotionService.updatePromotion(this.promotionId, this.promotionForm.value).subscribe({
      next: (res) => {
        if (res.success) {
          alert(res.message);
          this.router.navigate(['/promotion-list']);
        }
      },
      error: (err) => {
        console.error('Lỗi cập nhật:', err);
      }
    });
  }
}
