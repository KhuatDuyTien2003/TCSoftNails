import { filter } from 'rxjs';
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpPermissionService } from '../../services/http-permission.service';
import { ToastrModule, ToastrService } from 'ngx-toastr';
import { Permission } from '../../app.type/Permission.type';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../header/header.component';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AddRoleComponent } from './add-role/add-role.component';
import { HttpsService } from '../../services/https.service';
import { RefreshTokenRequest } from '../../app.type/RefreshToken.type';

@Component({
  selector: 'app-permission',
  standalone: true,
  templateUrl: './permission.component.html',
  styleUrl: './permission.component.scss',
  imports: [CommonModule, HeaderComponent, NzIconModule, AddRoleComponent],
})
export class PermissionComponent implements OnInit {
  showGroups: { [key: string]: boolean } = {
    group1: true,
    group2: true,
    group3: true,
    group4: true,
    group5: true,
  };
  @ViewChild(AddRoleComponent) public addRole!: AddRoleComponent;
  Roles: Permission[] = [];
  currentRole: string = '';
  isActive: string = '';
  role: Permission = {
    id: undefined,
    functions: [],
  };
  constructor(
    private httpPermission: HttpPermissionService,
    private toastr: ToastrService,
    private http: HttpsService
  ) {}

  ngOnInit(): void {
    this.getPermission();
  }
  toggleGroup(groupKey: string) {
    this.showGroups[groupKey] = !this.showGroups[groupKey];
  }

  selectAllPermission(event: Event) {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    const value = input.value;
    console.log(value);
    const isChecked = input.checked;

    const checkboxList = document.querySelectorAll<HTMLInputElement>(
      `.${value}`
    );

    checkboxList.forEach((checkbox) => {
      checkbox.checked = isChecked;
      if (!this.role.functions?.includes(checkbox.value)) {
        this.role.functions?.push(checkbox.value);
      }
    });
    console.log(this.role.functions);
  }

  isGroupShown(groupKey: string): boolean {
    return this.showGroups[groupKey];
  }

  getPermission() {
    this.httpPermission.getPermission().subscribe({
      next: (data) => {
        if (data.success) {
          this.Roles = data.data;
        } else {
          this.toastr.error(data.message);
        }
      },
      error: (err) => this.toastr.error(err),
    });
  }

  selectRole(id: string) {
    const allCheckboxes = document.querySelectorAll(
      'input[type="checkbox"]'
    ) as NodeListOf<HTMLInputElement>;
    allCheckboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    this.role = this.Roles.find((r) => r.id === id) || {};
    this.isActive = id;
    if (this.role.functions) {
      for (let func of this.role.functions) {
        let checkbox = document.getElementById(func) as HTMLInputElement;
        if (checkbox) {
          checkbox.checked = true;
        }
      }
    }
  }

  selectPermission(event: Event) {
    let input = event.currentTarget as HTMLInputElement;

    if (this.role && this.role.functions) {
      if (input.checked) {
        this.role.functions.push(input.value);
      } else {
        this.role.functions = this.role.functions.filter(
          (i) => i !== input.value
        );
      }
    }
    console.log(this.Roles);
  }

  updatePermission() {
    this.httpPermission.updatePermission(this.role).subscribe({
      next: (data) => {
        if (data.success) {
          this.toastr.success(data.message);
          this.getPermission();
          this.resetToken();
        } else this.toastr.error(data.message);
      },
      error: (err) => this.toastr.error(err),
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

  openAddRole() {
    this.addRole.onExit();
  }

  receiveRole(roles: Permission[]) {
    console.log(roles);
    this.Roles = roles;
  }

  delRole(id: string) {
    this.httpPermission.deleteRole(id).subscribe({
      next: (data) => {
        if (data.success) {
          this.toastr.success(data.message);
          this.getPermission();
        } else this.toastr.error(data.message);
      },
      error: (err) => this.toastr.error(err),
    });
  }
}
