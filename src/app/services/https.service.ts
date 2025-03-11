import { account } from './../app.type/account.type';

import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { emit } from 'process';
import { catchError, Observable, ObservedValueOf, throwError } from 'rxjs';

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
  private base_url = 'https://localhost:7087/';
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
      .pipe(catchError((error) => this.handleError(error)));
  }
  public CreateStaff(account: account): Observable<any> {
    const url = `${this.base_url}Staff/CreateStaff`;
    return this.http
      .post<any>(url, account)
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

    // var para = new HttpParams().set('email', email);
    // return this.http
    //   .post<any>(url, email, this.httpOption)
    //   .pipe(catchError((error) => this.handleError(error)));
    return this.http
      .post<any>(url, requestBody)
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
      .post<any>(url, jsonParam)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getAll(): Observable<account[]> {
    const url = `${this.base_url}Account`;
    return this.http
      .get<account[]>(url)
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
