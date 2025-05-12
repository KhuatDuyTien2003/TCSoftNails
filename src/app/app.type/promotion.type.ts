export interface Promotion {
  promotionId?: number;
  promotionName?: string;
  promotionType?: boolean;
  quantity?: number;
  productTypeId?: number;
  isPoints: boolean;
  condition?: number;
  rankId?: number;
  urlImage?: string;
  value_data?: number;
}
