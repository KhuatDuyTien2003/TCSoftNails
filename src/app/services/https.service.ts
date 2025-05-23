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
import { BaseHttpService } from './base-http.service';
import { RefreshTokenRequest } from '../app.type/RefreshToken.type';
import { ResponseModel } from '../app.type/Response.type';
import { Token } from '../app.type/Token.type';
import { Route, Router } from '@angular/router';

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
  constructor(
  private http: HttpClient,
  private router: Router,
  private baseService: BaseHttpService
) {}
  baseClass = new BaseHttpService();
  private base_url = this.baseClass.base_url + '/';



  public Login(Username: string, Password: string): Observable<any> {
    const url = `${this.base_url}Account/Login`;
    return this.http
      .post<any>(url, { Username, Password }, this.baseService.httpOption())
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
      .post<any>(url, account, this.baseService.httpOption())
      .pipe(catchError((error) => this.handleError(error)));
  }

  public forgotPassword(email: string): Observable<any> {
    const url = `${this.base_url}Account/ForgotPassword`;
    const requestBody = { Email: email };

    // var para = new HttpParams().set('email', email);
    // return this.http
    //   .post<any>(url, email, this.baseService.httpOption)
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
    var jsonParam = { Email: email, Token: token, Password: password };
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

  public refreshToken(
    model: RefreshTokenRequest
  ): Observable<ResponseModel<Token>> {
    const url = `${this.base_url}Account/RefreshToken`;
    return this.http
      .post<ResponseModel<Token>>(url, model)
      .pipe(catchError((error) => this.handleError(error)));
  }

  logout() {
    localStorage.clear();
    this.navigateTo('/Login');
  }
  navigateTo(url: string) {
    if (!url.startsWith('/')) {
      url = '/' + url;
    }
    this.router.navigateByUrl(url);
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
