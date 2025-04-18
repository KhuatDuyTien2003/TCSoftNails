import { account } from './../../app.type/account.type';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule, NzFormTooltipIcon } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import {
  catchError,
  filter,


  of,


  Subject,
  switchMap,
  takeUntil,
  tap,
  throwError,
} from 'rxjs';
import { HttpsService, NewAccount } from '../../services/https.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
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
export class RegisterComponent implements OnInit, OnDestroy {


  messageError: string = '';

  private fb = inject(NonNullableFormBuilder);
  private destroy$ = new Subject<void>();
  constructor(private http: HttpsService) {}
  validateForm = this.fb.group({
    StaffName: this.fb.control('', [Validators.required]),
    Gender: this.fb.control('', [Validators.required]),
    NumberPhone: this.fb.control('', [Validators.required]),
    Birthday: this.fb.control('', [Validators.required]),
    Username: this.fb.control('', [Validators.required]),
    Password: this.fb.control('', [Validators.required]),
    Email: this.fb.control('', [Validators.required, Validators.email]),
  });
  // captchaTooltipIcon: NzFormTooltipIcon = {
  //   type: 'info-circle',
  //   theme: 'twotone',
  // };

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submitForm(): void {
    var gt = true;
    if (this.validateForm.controls.Gender.value === 'Male') {
      gt = true;
    } else {
      gt = false;
    }
    var account: account = {
      birthday:
        new Date(this.validateForm.controls.Birthday.value) || new Date(),
      Email: this.validateForm.controls.Email.value || '',
      phoneNumber: this.validateForm.controls.NumberPhone.value || '',
      gender: gt,
      staffName: this.validateForm.controls.StaffName.value || '',
      username: this.validateForm.controls.Username.value || '',
      password: this.validateForm.controls.Password.value || '',
    };
    this.http
      .CreateStaff(account)
      .pipe(


        tap((data) => console.log('CreateStaff response:', data.data?.staffId)), // Kiểm tra null safety

        switchMap((data) => {
          if (!data.success) {
            this.messageError = data.message;
            return of(null); // Tránh undefined
          } else {
            console.log(data.data.staffId);
            const newAccount: NewAccount = {
              staffId: data.data.staffId,
              userName: account.username,
              password: account.password,
              email: account.Email,
            };
            return this.http.Register(newAccount);
          }
        }),
        catchError((error) => {
          console.error('Lỗi khi tạo tài khoản:', error);
          return of(null); // Trả về Observable hợp lệ
        })
      )
      .subscribe({
        next: (data) => {
          if (data) {
            console.log('Thêm thành công', data);
          }
        },


        error: (err) => console.error('Đăng ký thất bại:', err),
      });
  }
}
