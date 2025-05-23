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

  constructor(
    private httpBill: HttpClient,
    toastr: ToastrService,
    private baseService: BaseHttpService
  ) {}

  public getAllBill(
    pageSize: number,
    pageNumber: number
  ): Observable<ResponseModel<BillResponse[]>> {
    const url = `${this.base_url}Bill/GetAll/${pageSize}/${pageNumber}`;
    return this.httpBill
      .get<ResponseModel<BillResponse[]>>(url, this.baseService.httpOption())
      .pipe(catchError((error) => this.handleError(error)));
  }
  public getBillUnpaid(): Observable<ResponseModel<BillResponse[]>> {
    const url = `${this.base_url}Bill/GetBillUnpaid`;
    return this.httpBill
      .get<ResponseModel<BillResponse[]>>(url, this.baseService.httpOption())
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getServiceAndProduct(type: Number) {
    const url = `${this.base_url}Bill/GetProduct/${type}`;
    return this.httpBill
      .get<ResponseModel<CategoryBill[]>>(url, this.baseService.httpOption())
      .pipe(catchError((error) => this.handleError(error)));
  }

  public searchProduct(name: string) {
    const url = `${this.base_url}Bill/SearchProduct/${name}`;
    return this.httpBill
      .get<ResponseModel<CategoryBill[]>>(url, this.baseService.httpOption())
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getPriceListByIdCustomer(id: number) {
    const url = `${this.base_url}Bill/GetPriceListByIdCustomer/${id}`;
    return this.httpBill
      .get<ResponseModel<PriceList[]>>(url, this.baseService.httpOption())
      .pipe(catchError((error) => this.handleError(error)));
  }
  public getPromotionByCode(
    code: string
  ): Observable<ResponseModel<Promotion[]>> {
    const url = `${this.base_url}Bill/GetPromotionByCode/${code}`;
    return this.httpBill
      .get<ResponseModel<Promotion[]>>(url, this.baseService.httpOption())
      .pipe(catchError((error) => this.handleError(error)));
  }
  public updateBill(model: BillSend): Observable<ResponseModel<string>> {
    const url = `${this.base_url}Bill/UpdateBill/`;
    return this.httpBill
      .put<ResponseModel<string>>(url, model, this.baseService.httpOption())
      .pipe(catchError((error) => this.handleError(error)));
  }

  public updateMultipleBills(
    models: BillSend[]
  ): Observable<ResponseModel<any>> {
    const url = `${this.base_url}Bill/UpdateMultipleBills`;
    return this.httpBill
      .post<ResponseModel<any>>(url, models, this.baseService.httpOption())
      .pipe(catchError((error) => this.handleError(error)));
  }

  public searchBill(
    model: SearchBill
  ): Observable<ResponseModel<BillResponse[]>> {
    const url = `${this.base_url}Bill/FilterBill`;
    return this.httpBill
      .post<ResponseModel<BillResponse[]>>(
        url,
        model,
        this.baseService.httpOption()
      )
      .pipe(catchError((error) => this.handleError(error)));
  }

  public delBill(id: number) {
    const url = `${this.base_url}Bill/DeleteReceipt/${id}`;
    return this.httpBill
      .get<ResponseModel<string>>(url, this.baseService.httpOption())
      .pipe(catchError((error) => this.handleError(error)));
  }

  public createNewBill(): Observable<ResponseModel<number>> {
    const url = `${this.base_url}Bill/CreateNewBill`;
    return this.httpBill
      .post<ResponseModel<number>>(url, this.baseService.httpOption())
      .pipe(catchError((error) => this.handleError(error)));
  }
  public updateOverdueBill(): Observable<ResponseModel<string>> {
    const url = `${this.base_url}Bill/UpdateOverdueBills`;
    return this.httpBill
      .post<ResponseModel<string>>(url, this.baseService.httpOption())
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
