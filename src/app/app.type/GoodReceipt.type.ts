export interface GoodsReceipt {
  receiptId: number;
  receiptCode: string;
  importDate: Date;
  due: number;
  totalMoney: number;
  paymentMoney: number;
  supplierId: number;
  supplierName?: string;
  comment: string;
  accountantId: number;
  status: number;
}
