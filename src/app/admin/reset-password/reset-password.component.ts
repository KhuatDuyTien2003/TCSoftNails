import { Component, inject, OnInit } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { HttpsService } from '../../services/https.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    RouterModule,
  ],
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  email: string = '';
  constructor(private router: ActivatedRoute, private http: HttpsService) {}

  ngOnInit(): void {
    this.router.paramMap.subscribe((params) => {
      this.token = params.get('token') || '';
      this.email = params.get('email') || '';
      if (!this.token || !this.email) {
        // Chuyển hướng đến trang lỗi hoặc hiển thị thông báo
        console.error('Thiếu token hoặc email trong URL.');
        // Ví dụ: this.router.navigate(['/error']);
      } else {
        console.log('token: ' + this.token);
        console.log('email: ' + this.email);
      }
    });
  }

  private fb = inject(NonNullableFormBuilder);
  validateForm = this.fb.group({
    password: this.fb.control('', [Validators.required]),
  });

  submitForm(): void {
    var password = this.validateForm.value.password || '';
    this.http
      .resetPassword(this.email, this.token, password)
      .subscribe((data) => {
        console.log('Đã reset');
      });
  }
}
