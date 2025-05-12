export interface SearchBill {
  billId?: number | null;
  customerName?: string | null;
  productName?: string | null;
  receiption?: string | null;
  statusBill?: number[] | null;
  payment?: number[] | null;
  fromDate?: Date | null;
  toDate?: Date | null;
}
