import { Injectable } from '@angular/core';
import { BaseHttpService } from './base-http.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, throwError } from 'rxjs';
import { ResponseModel } from '../app.type/Response.type';
import { BillResponse } from '../app.type/BillResponse.type';
import { CategoryBill } from '../app.type/CategoryBill.type';
import { PriceList } from '../app.type/PriceList.type';
import { Promotion } from '../app.type/Promotion.type';
import { BillSend } from '../app.type/BillSend.type';
import { SearchBill } from '../app.type/SearchBill.type';

@Injectable({
  providedIn: 'root',
})
export class HttpBillService {
  baseClass = new BaseHttpService();
  private base_url = this.baseClass.base_url + '/';
  httpOption = this.baseClass.httpOption;

  constructor(private httpBill: HttpClient, toastr: ToastrService) {}

  public getAllBill(): Observable<ResponseModel<BillResponse[]>> {
    const url = `${this.base_url}Bill`;
    return this.httpBill
      .get<ResponseModel<BillResponse[]>>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getServiceAndProduct(type: Number) {
    const url = `${this.base_url}Bill/GetProduct/${type}`;
    return this.httpBill
      .get<ResponseModel<CategoryBill[]>>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public searchProduct(name: string) {
    const url = `${this.base_url}Bill/SearchProduct/${name}`;
    return this.httpBill
      .get<ResponseModel<CategoryBill[]>>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getPriceListByIdCustomer(id: number) {
    const url = `${this.base_url}Bill/GetPriceListByIdCustomer/${id}`;
    return this.httpBill
      .get<ResponseModel<PriceList[]>>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }
  public getPromotionByCode(
    code: string
  ): Observable<ResponseModel<Promotion[]>> {
    const url = `${this.base_url}Bill/GetPromotionByCode/${code}`;
    return this.httpBill
      .get<ResponseModel<Promotion[]>>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }
  public createBill(model: BillSend): Observable<ResponseModel<string>> {
    const url = `${this.base_url}Bill/CreateBill/`;
    return this.httpBill
      .post<ResponseModel<string>>(url, model, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }
  public searchBill(
    model: SearchBill
  ): Observable<ResponseModel<BillResponse[]>> {
    const url = `${this.base_url}Bill/FilterBill`;
    return this.httpBill
      .post<ResponseModel<BillResponse[]>>(url, model, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public delBill(id: number) {
    const url = `${this.base_url}Bill/DeleteBill/${id}`;
    return this.httpBill
      .get<ResponseModel<string>>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public handleError(error: HttpErrorResponse) {
    let errorMess: string;
    if (error.error instanceof ErrorEvent) {
      errorMess = 'Lỗi phía client ' + error.error.message;
    } else if (error.status === 401) {
      errorMess = ' Bạn không có quyền truy cập  chức năng này';
    } else {
      errorMess =
        'Lỗi phía server: ' + error.status + ':  ' + error.error.message;
    }
    return throwError(() => new Error(errorMess));
  }
}
