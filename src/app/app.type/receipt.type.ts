import { BillResponseDetail } from './BillResponse.type';
import { CategoryBill } from './CategoryBill.type';

export interface Receipt {
  customerName: string;
  numberPhone: string;
  receiption: string;
  receiptDetails: BillResponseDetail[] | CategoryBill[];
  totalMoney: number;
  promotion: number;
  receiptDay: Date;
}
