export interface product {
  proAndSerId: number;
  proAndSerName: string;
  proAndSerCode?: string;
  workTime?: number;
  inventoryQuantity: number;
  originalPrice?: number;
  sellingPrice: number;
  unit?: number;
  urlImage?: string;
  productTypeId?: number;
  commission?: number;
  proAndSerType?: number;
  status?: number;
  expiryDate?: Date;
  description?: string;
  quantity?: number;
  finalPrice?: number;
}
