export interface Promotion {
  promotionId?: number;
  promotionName: string;
  promotionType: boolean;
  startDate: Date;
  endDate: Date;
  quantity: number;
  productTypeId: number;
  isPoints: boolean;
  condition: number;
  rankId: number;
  urlImage: string;
  isDeleted: boolean;
  status: boolean;
  value_data: number;
}
