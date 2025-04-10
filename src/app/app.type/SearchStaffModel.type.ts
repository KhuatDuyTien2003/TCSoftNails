export interface SearchStaffModel {
  keyword?: string | null;
  fromDate?: Date | null;
  toDate?: Date | null;
  serviceId?: number | null;
  pageNumber?: number | null;
  pageSize?: number | null;
}
