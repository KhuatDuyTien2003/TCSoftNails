import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { FilterCriteria } from '../../app.type/filter-criteria.type';

@Injectable({
  providedIn: 'root',
})
export class PriceListService {
  private base_url = 'http://localhost:5213/PriceLists';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };
  constructor(private http: HttpClient) {}
  GetPriceList(): Observable<any> {
    const url = `${this.base_url}/GetPriceList`;
    return this.http
      .get<any>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  getByFilter(filter: FilterCriteria): Observable<any[]> {
    const url = `${this.base_url}/GetByFilter`;
    let params = new HttpParams()
      .set('PageNumber', filter.pageNumber)
      .set('PageSize', filter.pageSize);
    if (filter.productGroup)
      params = params.set('productGroup', filter.productGroup);
    if (filter.priceListId)
      params = params.set('priceListId', filter.priceListId);
    return this.http
      .get<any[]>(url, { params })
      .pipe(catchError(this.handleError));
  }

  AddGroupProToList(idGroupPro: number, priceListId: number): Observable<any> {
    const url = `${this.base_url}/AddGroupProToList`;
    const body = {
      priceListId: priceListId,
      idGroupPro: idGroupPro,
    };
    return this.http
      .post<any>(url, body, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  UpdateSellingPrice(
    priceListId: number,
    productId: number,
    sellPrice: number
  ): Observable<any> {
    const url = `${this.base_url}/UpdateSellingPrice`;
    const request = {
      priceListId: priceListId,
      productId: productId,
      sellPrice: sellPrice,
    };
    return this.http
      .put<any>(url, request, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  removeAllProducts(priceListId: number, listId: number[]): Observable<any> {
    const url = `${this.base_url}/RemoveAllProducts`;
    const body = {
      priceListId: priceListId,
      listId: listId,
    };
    return this.http
      .post<any>(url, body, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  removeProduct(priceListId: number, productId: number): Observable<any> {
    const url = `${this.base_url}/RemoveProduct`;
    const body = {
      priceListId: priceListId,
      productId: productId,
    };
    return this.http
      .post<any>(url, body, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    debugger;
    let errorMess;
    if (error.error instanceof Error) {
      // Lỗi phía client hoặc mạng
      errorMess = 'Lỗi phía client hoặc mạng: ' + error.message;
    } else {
      // Server trả về mã lỗi không thành công
      errorMess = 'Lỗi phía server: ' + error.status + ': ' + error.message;
    }
    console.log(errorMess);
    return throwError(() => new Error(errorMess));
  }
}
