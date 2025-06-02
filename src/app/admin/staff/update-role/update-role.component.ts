import { NzSelectModule } from 'ng-zorro-antd/select';
import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  Input,
  OnInit,
} from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';

import { HttpPermissionService } from '../../../services/http-permission.service';
import { ToastrService } from 'ngx-toastr';
import { Permission } from '../../../app.type/Permission.type';
import { RefreshTokenRequest } from '../../../app.type/RefreshToken.type';
import { HttpsService } from '../../../services/https.service';

@Component({
  selector: 'app-update-role',
  standalone: true,
  templateUrl: './update-role.component.html',
  styleUrl: './update-role.component.scss',
  imports: [
    CommonModule,
    NzFormModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzInputModule,
    NzIconModule,
    NzSelectModule,
  ],
})
export class UpdateRoleComponent implements OnInit {
  Roles: Permission[] = [];
  constructor(
    private httpPermission: HttpPermissionService,
    private toastr: ToastrService,
    private http: HttpsService
  ) {}
  @Input() idUser: number = 31;
  @Input() userName: string = '';
  private fb = inject(NonNullableFormBuilder);
  validateForm = this.fb.group({
    roleName: this.fb.control('', [Validators.required]),
  });

  ngOnInit(): void {
    this.httpPermission.getPermission().subscribe({
      next: (data) => {
        if (data.success) this.Roles = data.data;
      },
    });
  }
  submitForm(): void {
    if (this.validateForm.invalid) {
      this.toastr.warning('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const roleName = this.validateForm.value.roleName?.trim();
    if (!roleName) {
      this.toastr.warning('Tên nhóm quyền không hợp lệ');
      return;
    }

    this.httpPermission
      .updateRoleForUser(this.idUser, this.validateForm.value.roleName || '')

      .subscribe({
        next: (res2) => {
          if (res2.success) {
            this.resetToken();
            this.onExit();
          } else {
            this.toastr.error(res2.message);
          }
        },
        error: (err) => {
          const message = typeof err === 'string' ? err : 'Đã có lỗi xảy ra';
          this.toastr.error(message);
        },
      });
  }

  resetToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    const staffId = localStorage.getItem('staffId');

    const model: RefreshTokenRequest = {
      idStaff: Number(staffId),
      refreshtoken: refreshToken || '',
    };
    this.http.refreshToken(model).subscribe({
      next: (response) => {
        const tokenData = response?.data;
        if (tokenData?.accessToken) {
          localStorage.setItem('staffId', String(tokenData.staffId));
          localStorage.setItem('token', tokenData.accessToken);
          localStorage.setItem('refreshToken', tokenData.refreshToken);
        }
      },
    });
  }
  onExit(): void {
    let input = document.getElementById('hidden');
    if (input?.classList.contains('hidden')) {
      input.classList.remove('hidden');
    } else input?.classList.add('hidden');
  }
}
