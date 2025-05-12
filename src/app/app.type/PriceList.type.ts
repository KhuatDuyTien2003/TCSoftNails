export interface PriceList {
  priceListId?: number;
  priceListName?: string;
  priceListDetails: PriceListDetail[];
}

export interface PriceListDetail {
  productId?: number;
  sellPrice?: number;
}
