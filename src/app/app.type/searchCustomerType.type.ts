export interface searchCustomerType{
  keyword: string | null;
  fromDate: Date | null;
  toDate: Date | null;
  gender: boolean | null;
  rankId: string | null;
  page: number | null;
  pageSize: number | null;
}
