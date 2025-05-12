import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CustomerRankService } from '../../../services/customer-rank/customer-rank.service';
import { CustomerRank } from '../../../app.type/customer-rank.type';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-customer-rank',
  standalone: true,
  templateUrl: './customer-rank.component.html',
  styleUrl: './customer-rank.component.scss',
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
})
export class CustomerRankComponent implements OnInit {
  mocForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private httpRank: CustomerRankService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.mocForm = this.fb.group({
      tenMoc: ['', Validators.required],
      tongTien: [0, [Validators.required, Validators.min(0)]],
      giamGia: [0, [Validators.required, Validators.min(0)]],
      trangThai: [true, Validators.required],
    });
  }

  openFormRank() {
    if (document.getElementById('formRank')?.classList.contains('hidden')) {
      document.getElementById('formRank')?.classList.remove('hidden');
    } else document.getElementById('formRank')?.classList.add('hidden');
  }



  onSubmit(): void {
    if (this.mocForm.valid) {
      const model: CustomerRank = {
        rankName: this.mocForm.value.tenMoc,
        totalMoney: this.mocForm.value.tongTien,
        discountRate: this.mocForm.value.giamGia,
        status: false,
        rankId: 1100,
      };
      this.httpRank.createCustomerRank(model).subscribe({
        next: (data) => {
          if (data.success) {
            this.toastr.success(data.message);
          } else this.toastr.error(data.message);
        },
        error: (err) => {
          this.toastr.error(err);
        },
      });
    }
  }

  onCancel(): void {
    this.mocForm.reset({
      tenMoc: '',
      tongTien: 0,
      giamGia: 0,
      trangThai: true,
    });
  }
}
