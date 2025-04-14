import { ErrorType } from './../app.type/ErrorType.type';
import { customer } from './../app.type/customer.type';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { searchCustomerType } from '../app.type/searchCustomerType.type';
import { ToastrService } from 'ngx-toastr';
import { BaseHttpService } from './base-http.service';

@Injectable({
  providedIn: 'root',
})
export class HttpCustomerService {
  baseClass = new BaseHttpService
  private base_url = this.baseClass.base_url+"/";
    httpOption = this.baseClass.httpOption

  constructor(private httpCustomer: HttpClient, toastr: ToastrService) {}



  public addCustomer(
    customer: Omit<
      customer,
      'rankName' | 'customerId' | 'totalMoney' | 'totalPoints'
    >
  ): Observable<any> {
    const url = `${this.base_url}Customer/AddCustomer`;
    return this.httpCustomer
      .post<any>(url, customer, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }
  public addCustomers(customers: customer[]): Observable<any> {
    const url = `${this.base_url}Customer/AddCustomers`;
    var json = JSON.stringify(customers);
    return this.httpCustomer
      .post<any>(url, json, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getCustomer(id: number): Observable<customer> {
    const url = `${this.base_url}Customer/${id}`;
    return this.httpCustomer
      .get<customer>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public editCustomer(
    customer: Omit<customer, 'rankName' | 'totalMoney' | 'totalPoints'>
  ): Observable<any> {
    const url = `${this.base_url}Customer/EditCustomer`;
    return this.httpCustomer
      .post<any>(url, customer, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }


  public deleteMultipleCustomers(listId: string[]): Observable<any> {
    const url = `${this.base_url}Customer/DeleteMultipleCustomers`;
    var json = listId.map((id) => ({ CustomerId: parseInt(id) }));
    return this.httpCustomer.post<any>(url, json, this.httpOption);
  }

  public searchCustomer(
    model: searchCustomerType
  ): Observable<
    | { success: boolean; data: customer[]; count: number }
    | { success: boolean; message: string }
  > {
    const url = `${this.base_url}Customer/SearchCustomer`;
    return this.httpCustomer.post<
      | { success: boolean; data: customer[]; count: number }
      | { success: boolean; message: string }
    >(url, model, this.httpOption);
  }

  public exportCustomer(): Observable<any> {
    const url = `${this.base_url}Customer/ExportCustomer`;
    return this.httpCustomer.get(url, this.httpOption);
  }
  public deleteFile(filePath: string): Observable<any> {
    const url = `${this.base_url}Customer/DeleteFile/${filePath}`;
    return this.httpCustomer.get(url, this.httpOption);
  }

  public deleteCustomer(id: number): Observable<any> {
    var idModel = { CustomerId: id };
    const url = `${this.base_url}Customer/DeleteCustomer`;
    return this.httpCustomer
      .post<any>(url, idModel, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getAllCustomer(
    page: number,
    pageSize: number
  ): Observable<{ data: customer[]; count: number } | ErrorType> {
    const url = `${this.base_url}Customer?page=${page}&pageSize=${pageSize}`;
    return this.httpCustomer
      .get<{ data: customer[]; count: number }>(url, this.httpOption)
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
