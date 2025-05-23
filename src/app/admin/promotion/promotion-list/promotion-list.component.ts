import * as FileSaver from 'file-saver';
import { Component, OnInit } from '@angular/core';
import { PromotionService } from '../../../services/promotion.service';
import { CommonModule } from '@angular/common';
import { Router, Routes } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import * as XLSX from 'xlsx';

import { NzFormModule } from 'ng-zorro-antd/form';

@Component({
  selector: 'app-promotion-list',
  imports: [CommonModule, NzButtonModule, NzTableModule, NzFormModule],
  templateUrl: './promotion-list.component.html',
  styleUrls: ['./promotion-list.component.css'],
})
export class PromotionListComponent implements OnInit {
  promotions: any[] = [];
  dataFromExcel: any[] = [];

  constructor(
    private promotionService: PromotionService,
    private router: Router
  ) {}
  onAddPromotion() {
    this.router.navigate(['/promotion-add']);
  }
  ngOnInit(): void {
    this.loadPromotions();
  }

  loadPromotions() {
    this.promotionService.getAllPromotions().subscribe(
      (res) => {
        if (res.success) {
          this.promotions = res.data;
        }
      },
      (err) => {
        console.error('Lỗi lấy dữ liệu:', err);
      }
    );
  }
  exportToExcel(): void {
    const fileName = 'PromotionData.xlsx';
    const worksheet = XLSX.utils.json_to_sheet(this.promotions);
    const workbook = { Sheets: { Data: worksheet }, SheetNames: ['Data'] };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const data: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });
    FileSaver.saveAs(data, fileName);
  }

  tableHeaders: string[] = [];

  onFileChange(event: any) {
    const target: DataTransfer = <DataTransfer>event.target;
    if (target.files.length !== 1) {
      console.error('Chỉ chọn 1 file Excel');
      return;
    }

    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      this.dataFromExcel = XLSX.utils.sheet_to_json(ws);

      // Lấy header để render table
      if (this.dataFromExcel.length > 0) {
        this.tableHeaders = Object.keys(this.dataFromExcel[0]);
      }
    };

    reader.readAsBinaryString(target.files[0]);
  }

  saveData() {
    this.promotionService.importExcel(this.dataFromExcel).subscribe({
      next: (res) => {
        console.log('Lưu dữ liệu thành công', res);
      },
      error: (err) => {
        console.error('Lỗi lưu dữ liệu', err);
      },
    });
  }
  onDeletePromotion(id: number) {
    if (confirm('Bạn có chắc muốn xóa?')) {
      this.promotionService.deletePromotion(id).subscribe({
        next: (res) => {
          alert(res.message);
          this.loadPromotions(); // Gọi lại để reload danh sách
        },
        error: (err) => {
          console.error('Lỗi xóa', err);
        },
      });
    }
  }

  // Điều hướng sang trang Edit
  onEditPromotion(id: number) {
    this.router.navigate(['/promotion-edit', id]);
  }
}
