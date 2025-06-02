import { DoanhThuTheoNgay } from './../../../app.type/DoanhThuTheoNgay.type';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { ReportService } from '../../../services/report.service';
import { ToastrService } from 'ngx-toastr';
import { HttpsService } from '../../../services/https.service';
import { VncurrencyPipe } from '../../../pipe/vncurrency.pipe';
import { MonthlyReport } from '../../../app.type/MonthlyReport.type';
import { HeaderComponent } from '../../../header/header.component';

@Component({
  selector: 'app-report-doanhthu',
  standalone: true,
  templateUrl: './report-doanhthu.component.html',
  styleUrl: './report-doanhthu.component.scss',
  imports: [NgxChartsModule, CommonModule, VncurrencyPipe, HeaderComponent],
})
export class ReportDoanhthuComponent implements OnInit {
  doanhThuTheoThang: number = 0;
  reportThang: MonthlyReport = {
    tongDoanhThu: 0,
    tongHoaDon: 0,
    soKhachHang: 0,
    tongSanPhamBanDuoc: 0,
    anhSanPhamBanChayNhat: '',
    tongChietKhau: 0,
    sanPhamBanChayNhat: '',
  };
  baseColors = [
    '#5AA454',
    '#A10A28',
    '#C7B42C',
    '#AAAAAA',
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
    '#FF5733',
    '#33FF57',
    '#3357FF',
    '#FF33A1',
    '#33FFF6',
    '#F6FF33',
    '#FF8633',
    '#33FF86',
  ];

  colorScheme: Color = {
    name: 'myScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: this.shuffleArray(this.baseColors),
  };


  shuffleArray(array: string[]): string[] {
    const result = array.slice(); // copy mảng gốc
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
 todayDoanhThu: number = 0;
  constructor(
    private httpReport: ReportService,
    private toastr: ToastrService,
    private http: HttpsService
  ) {}
  doanhThuTheoNgayChart: any[] = [];
  ngOnInit(): void {
    this.getReport();
  }
  getReport() {
    this.httpReport.getReport().subscribe({
      next: (data) => {
        if (data.success) {
          this.doanhThuTheoNgayChart = data.data.doanhThuTheoNgays.map(
            (item) => ({
              name: item.ngay
                ? new Date(item.ngay).toLocaleDateString('vi-VN')
                : '',
              value:
                item.doanhThuNgay === null || item.doanhThuNgay === 0
                  ? 0.000000001
                  : item.doanhThuNgay,
            })
          );
          console.log(this.doanhThuTheoNgayChart);
          this.doanhThuTheoThang = 0;
          data.data.doanhThuTheoNgays.forEach((d) => {
            this.doanhThuTheoThang += d.doanhThuNgay || 0;
            const today = new Date();
            const dNgay = new Date(d.ngay?.toString() || '');
            if (
              dNgay.getDate() === today.getDate() &&
              dNgay.getMonth() === today.getMonth() &&
              dNgay.getFullYear() === today.getFullYear()
            ) {
              this.todayDoanhThu = d.doanhThuNgay || 0;
            }
          });
          this.reportThang = data.data.monthlyReports[0];
          console.log(data.data.monthlyReports);
        } else this.toastr.error(data.message);
      },
      error: (err) => this.toastr.error(err),
    });
  }
}
