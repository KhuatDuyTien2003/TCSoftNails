import { Component, OnInit, inject } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { HttpHeaderService } from '../services/http-header.service';
import { Header } from '../app.type/Header.typr';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Staff } from '../app.type/Staff.type';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  imports: [CommonModule, NzIconModule, NzMenuModule, RouterModule],
})
export class HeaderComponent implements OnInit {
  headerList: Header[] = [];
  staffId: string = '';
  isLogin: boolean = false;
  staff: Staff | null = null;
  isDropdownVisible = false;

  private httpHeader = inject(HttpHeaderService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    if (this.isBrowser()) {
      const storedId = localStorage.getItem('staffId');
      if (storedId) {
        this.staffId = storedId;
        this.isLogin = true;
        this.getStaffById(Number(this.staffId));
      }
    }

    this.httpHeader.getAllHeader().subscribe({
      next: (data) => {
        this.headerList = data;
      },
      error: (err) => {
        this.toastr.error('Lỗi khi lấy header');
      },
    });
  }

  getStaffById(staffId: number) {
    this.httpHeader.getStaffById(staffId).subscribe({
      next: (data) => {
        if (data.success) {
          this.staff = data.data;
        } else {
          this.toastr.error(data.message);
        }
      },
      error: (err) => {
        this.toastr.error('Lỗi khi lấy thông tin nhân viên');
      },
    });
  }

  getSubmenuTitle(): string {
    return `
      <div style="display: flex; align-items: center;">
        <img src="http://apithuctapnail.tcsoft.vn/uploads/${this.staff?.urlAvatar}" alt="avatar" style="width: 30px; height: 30px; border-radius: 50%; margin-right: 8px;" />
        <span>${this.staff?.staffName}</span>
      </div>
    `;
  }

  getHeaderChildList(idParent: string): Header[] {
    return this.headerList.filter((h) => h.parentId === idParent);
  }

  navigateTo(url: string) {
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    this.router.navigateByUrl(url);
  }

  toggleDropdown(state: boolean) {
    this.isDropdownVisible = state;
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.clear();
    }
    this.navigateTo('/Login');
    this.isLogin = false;
  }

  editProfile() {}
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
}
