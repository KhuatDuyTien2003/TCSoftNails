export interface BillSend {
  billId: number;
  totalMoney?: number;
  totalMoneyAfterDiscount?: number;
  receptionistId?: number;
  customerId?: number;
  points?: number;
  moneyPoint?: number;
  totalDiscount?: number;
  billStatus?: number;
  promotionId?: number;
  paymentId?: boolean;
  isPay?: boolean;
  billDetails?: BillDetailSend[];
}

export interface BillDetailSend {
  billId: number;
  proAndSerId?: number;
  quantity?: number;
  unitPrice?: number;
  staffId?: number;
  totalMoney?: number;
}
