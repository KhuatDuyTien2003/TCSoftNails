import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
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
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-add-role',
  standalone: true,
  templateUrl: './add-role.component.html',
  styleUrl: './add-role.component.scss',
  imports: [
    CommonModule,
    NzFormModule,
    ReactiveFormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzInputModule,
    NzIconModule,
  ],
})
export class AddRoleComponent {
  @Output() sendRole = new EventEmitter();
  constructor(
    private httpPermission: HttpPermissionService,
    private toastr: ToastrService
  ) {}
  private fb = inject(NonNullableFormBuilder);
  validateForm = this.fb.group({
    roleName: this.fb.control('', [Validators.required]),
  });

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
      .createRole(roleName)
      .pipe(
        switchMap((res1) => {
          this.toastr.success(res1.message);
          return this.httpPermission.getPermission();
        })
      )
      .subscribe({
        next: (res2) => {
          if (res2.success) {
            this.sendRole.emit(res2.data);
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

  onExit(): void {
    let input = document.getElementById('hidden');
    if (input?.classList.contains('hidden')) {
      input.classList.remove('hidden');
    } else input?.classList.add('hidden');
  }
}
