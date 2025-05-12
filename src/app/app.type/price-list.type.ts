export interface PriceList {
  priceListId: number;
  priceListName: string;
  valuePriceList: number;
  priceListType: boolean;
  rankId?: number;
  startTime?: Date;
  endTime?: Date;
  isDeleted: boolean;
  status: boolean;
}
