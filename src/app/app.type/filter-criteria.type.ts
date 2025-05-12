export interface FilterCriteria {
  searchTerm?: string;
  productTypes?: number[];
  productGroup?: number;
  status?: number;

  stock?: number;

  rank?: number;
  pageNumber: number;
  pageSize: number;
  priceListId?: number;
}
