export interface ResponseModel<T> {
  success: boolean;
  message: string;
  data: T;
  totalPage: number;
}
