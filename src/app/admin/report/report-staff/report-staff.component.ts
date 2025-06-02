import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import { StaffreportFilterComponent } from './staffreport-filter/staffreport-filter.component';
import { ReportChartComponent } from "../report-chart/report-chart.component";

// Sửa lỗi undefined
pdfMake.vfs = pdfFonts?.default?.pdfMake?.vfs || pdfFonts.pdfMake?.vfs;

@Component({
  selector: 'app-report-staff',
  standalone: true,
  imports: [CommonModule, StaffreportFilterComponent, ReportChartComponent],
  templateUrl: './report-staff.component.html',
  styleUrl: './report-staff.component.scss',
})
export class ReportStaffComponent implements OnInit {
  generateReport(): void {
    const docDefinition: any = {
      content: [
        { text: '🧾 BÁO CÁO THU NGÂN', style: 'header' },
        {
          text: 'Thời gian: 26/05/2025 - 01/06/2025\nChi nhánh: Trung tâm',
          style: 'subHeader',
        },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*', '*'],
            body: [
              ['Ngày', 'Doanh thu', 'Giá trị trả', 'Doanh thu thuần'],
              ['28/05/2025', '26,654,000', '0', '26,654,000'],
              ['27/05/2025', '19,717,000', '0', '19,717,000'],
            ],
          },
          layout: 'lightHorizontalLines',
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          alignment: 'center',
          margin: [0, 0, 0, 10],
        },
        subHeader: { fontSize: 12, alignment: 'center', margin: [0, 0, 0, 20] },
      },
    };

    pdfMake.createPdf(docDefinition).open();
  }

  ngOnInit(): void {}
}
