import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { Receipt } from '../../../app.type/receipt.type';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BillResponseDetail } from '../../../app.type/BillResponse.type';
import { CategoryBill } from '../../../app.type/CategoryBill.type';

@Component({
  selector: 'app-receipt',
  standalone: true,
  templateUrl: './receipt.component.html',
  styleUrl: './receipt.component.scss',
  imports: [CommonModule, RouterModule],
})
export class ReceiptComponent implements OnInit{
  @Input() model: Receipt = {
    customerName: '',
    numberPhone: '',
    receiption: '',
    receiptDetails: [],
    promotion: 0,
    totalMoney: 0,
    receiptDay: new Date()
  };
  normalizedDetails: {
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  staff: string;
}[] = [];
  constructor(private cdr: ChangeDetectorRef) {}
ngOnInit() {
  this.normalizeDetails(this.model.receiptDetails);
}

normalizeDetails(data: (BillResponseDetail | CategoryBill)[]) {
  this.normalizedDetails = (data || []).map(item => {
    if ('proAndSerName' in item) {
      // Kiểu BillResponseDetail
      const detail = item as BillResponseDetail;
      return {
        name: detail.proAndSerName || '',
        quantity: detail.quantity ?? 1,
        unitPrice: detail.unitPrice ?? 0,
        total: detail.totalMoney ?? (detail.unitPrice ?? 0) * (detail.quantity ?? 1),
        staff: detail.serviceStaffName || '-',
      };
    } else {
      // Kiểu CategoryBill
      const cat = item as CategoryBill;
      return {
        name: cat.name || '',
        quantity: cat.unitStock ?? 1,
        unitPrice: cat.price ?? 0,
        total: (cat.price ?? 0) * (cat.unitStock ?? 1),
        staff: '-', // Không có staff
      };
    }
  });
}
  public in() {
    this.cdr.detectChanges();
    document.getElementById('hidden')?.classList.remove('hidden');
    window.print();
    document.getElementById('hidden')?.classList.add('hidden');
  }
}
