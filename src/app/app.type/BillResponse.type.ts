export interface BillResponse {
  billId: number;
  billDate?: Date;
  customerId?: number;
  customerName?: string;
  numberPhone?: string;
  moneyPoint?: number;
  value_data?: number;
  receptionId?: number;
  totalBill?: number;
  totalMoneyAfterDiscount?: number;
  statusBill?: number;
  receptionName?: string;
  isPay?: boolean;
  billSendDetails: BillResponseDetail[];
}

export interface BillResponseDetail {
  proAndSerName?: string;
  quantity?: number;
  unitPrice?: number;
  totalMoney?: number;
  serviceStaffId?: number;
  serviceStaffName?: string;
  proAndSerId?: number;
}
