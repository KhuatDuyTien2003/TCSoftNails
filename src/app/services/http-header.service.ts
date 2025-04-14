import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { Header } from '../app.type/Header.typr';
import { ResponseModel } from '../app.type/Response.type';
import { Staff } from '../app.type/Staff.type';
import { BaseHttpService } from './base-http.service';

@Injectable({
  providedIn: 'root',
})
export class HttpHeaderService {

   baseClass = new BaseHttpService
   private base_url = this.baseClass.base_url+"/";
     httpOption = this.baseClass.httpOption

  constructor(private httpHeader: HttpClient) {}

  getAllHeader(): Observable<Header[]> {
    const url = `${this.base_url}Header`;
    return this.httpHeader
      .get<Header[]>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getStaffById(staffId: number): Observable<ResponseModel<Staff>> {
      const url = `${this.base_url}Staff/GetStaffById/${staffId}`;
      return this.httpHeader
        .get<ResponseModel<Staff>>(url, this.httpOption)
        .pipe(catchError((error) => this.handleError(error)));
    }

  public handleError(error: HttpErrorResponse) {
    let errorMess;
    if (error.error instanceof ErrorEvent) {
      errorMess = 'Lỗi phía client ' + error.error.message;
    } else {
      errorMess =
        'Lỗi phía server: ' + error.status + ':  ' + error.error.message;
    }
    return throwError(() => new Error(errorMess));
  }
}
