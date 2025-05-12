import { Component, OnInit } from '@angular/core';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { HttpHeaderService } from '../services/http-header.service';
import { Header } from '../app.type/Header.typr';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Staff } from '../app.type/Staff.type';
import { Toast, ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  imports: [CommonModule, NzIconModule, NzMenuModule, RouterModule],
})
export class HeaderComponent implements OnInit {
  headerList: Header[] = [];
  staffId: string = '';
  isLogin: boolean = false;
  staff: Staff | null = null;
  isDropdownVisible = false;

  constructor(
    private httpHeader: HttpHeaderService,
    private router: Router,
    private toastr: ToastrService
  ) {}
  ngOnInit(): void {
    this.staffId = localStorage.getItem('staffId') || '';
    if (this.staffId == '') {
      this.isLogin = false;
    } else {
      this.isLogin = true;
      this.getStaffById(Number(this.staffId));
    }
    this.httpHeader.getAllHeader().subscribe((data) => {
      this.headerList = data;
    });
  }

  getStaffById(staffId: number) {
    this.httpHeader.getStaffById(staffId).subscribe((data) => {
      if (data.success) {
        this.staff = data.data;
      } else {
        this.toastr.error(data.message);
      }
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

  editProfile() {}

  logout() {
    this.navigateTo('/Login');
    localStorage.removeItem('token');
    localStorage.removeItem('staffId');
    this.isLogin = false;
  }
}
