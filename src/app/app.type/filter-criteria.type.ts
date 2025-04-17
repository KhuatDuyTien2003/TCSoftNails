export interface FilterCriteria {
  searchTerm?: string;
  productTypes?: number[];
  productGroup?: number;
  status?: number;
  rank?: number;
  pageNumber: number;
  pageSize: number;
}
