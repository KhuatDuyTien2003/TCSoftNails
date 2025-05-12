export interface Promotion {
  promotionId: number;
  promotionName?: string;
  promotionType?: boolean;
  productTypeId?: number;
  rankId?: number;
  isPoints?: boolean;
  condition?: number;
  value_data?: number;
  quantity?: number;
  urlImage?: string;
}
