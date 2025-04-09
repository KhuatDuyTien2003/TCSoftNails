import { account } from './../app.type/account.type';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface NewAccount {
  staffId: string;
  userName: string;
  password: string;
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class HttpsService {
  private base_url = 'http://localhost:5213/';
  private tokenKey = 'authToken'; // Ensure tokenKey is defined

  constructor(private http: HttpClient) {}

  httpOption = {
    headers: new HttpHeaders({
      'Content-type': 'application/json',
    }),
  };

  public Login(Username: string, Password: string): Observable<any> {
    const url = `${this.base_url}Account/Login`;

    return this.http
      .post<any>(url, { Username, Password }, this.httpOption)
      .pipe(
        catchError((error) => {
          // Xử lý lỗi tại đây
          console.error('Đã xảy ra lỗi:', error);
          return throwError(() => new Error(error.message || 'Server error'));
        })
      );
  }

  public CreateStaff(account: account): Observable<any> {
    const url = `${this.base_url}Staff/CreateStaff`;
    return this.http
      .post<any>(url, account, this.httpOption) // Ensure httpOption is used
      .pipe(catchError((error) => this.handleError(error)));
  }

  public Register(account: NewAccount): Observable<any> {
    const url = `${this.base_url}Account/register`;
    return this.http
      .post<any>(url, account, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public forgotPassword(email: string): Observable<any> {
    const url = `${this.base_url}Account/ForgotPassword`;
    const requestBody = { Email: email };
    return this.http
      .post<any>(url, requestBody, this.httpOption) // Ensure httpOption is used
      .pipe(catchError((error) => this.handleError(error)));
  }

  public resetPassword(
    email: string,
    token: string,
    password: string
  ): Observable<any> {
    const url = `${this.base_url}Account/ResetPassword`;
    var jsonParam = { Email: email, token: token, Password: password };
    return this.http
      .post<any>(url, jsonParam, this.httpOption) // Ensure httpOption is used
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getAll(): Observable<account[]> {
    const url = `${this.base_url}Account`;
    return this.http
      .get<account[]>(url, this.httpOption) // Ensure httpOption is used
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
