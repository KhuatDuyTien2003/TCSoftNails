import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Filter } from '../../app.type/filter-receipt.type';

@Injectable({
  providedIn: 'root',
})
export class GoodsReceiptService {
  private base_url = 'https://localhost:60786/GoodsReceipts';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  getAllGoodsReceipts(): Observable<any> {
    return this.http
      .get<any>(`${this.base_url}/GetAll`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  getGoodsReceiptsByFilter(filter: Filter): Observable<any> {
    let params = new HttpParams();

    if (filter.receiptCode) {
      params = params.set('receiptCode', filter.receiptCode);
    }
    if (filter.productName) {
      params = params.set('productName', filter.productName);
    }
    if (filter.supplierName) {
      params = params.set('supplierName', filter.supplierName);
    }
    if (filter.accountantName) {
      params = params.set('accountantName', filter.accountantName);
    }
    if (filter.days !== undefined && filter.days !== null) {
      params = params.set('days', filter.days.toString());
    }
    if (filter.timeStart) {
      params = params.set('timeStart', filter.timeStart.toISOString());
    }
    if (filter.timeEnd) {
      params = params.set('timeEnd', filter.timeEnd.toISOString());
    }
    if (filter.status && filter.status.length > 0) {
      filter.status.forEach((s) => {
        params = params.append('status', s.toString());
      });
    }
    if (filter.pageNumber) {
      params = params.set('pageNumber', filter.pageNumber.toString());
    }
    if (filter.pageSize) {
      params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http
      .get<any>(`${this.base_url}/GetByFilter`, { params })
      .pipe(catchError(this.handleError));
  }

  getGoodsReceiptById(id: number): Observable<any> {
    return this.http
      .get<any>(`${this.base_url}/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  createGoodsReceipt(receipt: FormData): Observable<any> {
    const url = `${this.base_url}/Create`;
    const options = { ...this.httpOptions };
    if (receipt instanceof FormData) {
      // Loại bỏ header Content-Type nếu có
      if (options.headers) {
        options.headers = options.headers.delete('Content-Type');
      }
    }
    return this.http
      .post<any>(url, receipt, options)
      .pipe(catchError(this.handleError));
  }

  updateGoodsReceipt(id: number, receipt: any): Observable<any> {
    return this.http
      .put<any>(`${this.base_url}/Update/${id}`, receipt, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateGoodsReceiptDetail(id: number, receipt: any): Observable<any> {
    return this.http
      .put<any>(
        `${this.base_url}/UpdateReceiptDetail/${id}`,
        receipt,
        this.httpOptions
      )
      .pipe(catchError(this.handleError));
  }

  getAllStaff(): Observable<any> {
    return this.http
      .get<any>(`${this.base_url}/GetAllStaff`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    let errorMsg = error?.error?.message || error.statusText || 'Server error';
    return throwError(() => new Error(errorMsg));
  }
}
