import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BaseHttpService } from '../base-http.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerRankService {
  baseClass = new BaseHttpService();
  private base_url = this.baseClass.base_url;


  constructor(private http: HttpClient, private baseService: BaseHttpService) {}

  getCustomerRanks(): Observable<any> {
    const url = `${this.base_url}/CustomerRanks`;
    return this.http
      .get<any>(url, this.baseService.httpOption())
      .pipe(catchError(this.handleError));
  }

  getCustomerRankById(id: number): Observable<any> {
    const url = `${this.base_url}/CustomerRanks/GetById/${id}`;
    return this.http
      .get<any>(url, this.baseService.httpOption())
      .pipe(catchError(this.handleError));
  }

  createCustomerRank(customerRank: any): Observable<any> {
    const url = `${this.base_url}/CustomerRanks/PostCustomerRank`;
    return this.http
      .post<any>(url, customerRank, this.baseService.httpOption())
      .pipe(catchError(this.handleError));
  }

  updateCustomerRank(customerRank: any): Observable<any> {
    const url = `${this.base_url}/CustomerRanks/PutCustomerRank/${customerRank.rankId}`;
    return this.http
      .put<any>(url, customerRank, this.baseService.httpOption())
      .pipe(catchError(this.handleError));
  }

  deleteCustomerRank(id: number): Observable<any> {
    const url = `${this.base_url}/CustomerRanks/DeleteCustomerRank/${id}`;
    return this.http
      .delete<any>(url, this.baseService.httpOption())
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
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
