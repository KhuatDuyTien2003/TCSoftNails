export interface Filter {
  receiptCode?: string;
  productName?: string;
  supplierName?: string;
  accountantName?: string;
  days?: number;
  timeStart?: Date;
  timeEnd?: Date;
  status?: number[];
  pageNumber: number;
  pageSize: number;
}
