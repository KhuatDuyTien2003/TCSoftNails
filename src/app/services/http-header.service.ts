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

@Injectable({
  providedIn: 'root',
})
export class HttpHeaderService {
  private base_url = 'https://localhost:7087/';
  constructor(private httpHeader: HttpClient) {}
  httpOption = {
    headers: new HttpHeaders({
      'Content-type': 'application/json',
    }),
  };
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
