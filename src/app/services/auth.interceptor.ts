  import {
    HttpErrorResponse,
    HttpHandler,
    HttpInterceptor,
    HttpRequest,
  } from '@angular/common/http';
  import { Injectable } from '@angular/core';
  import { HttpsService } from './https.service';
  import { catchError, switchMap, throwError } from 'rxjs';
  import { RefreshTokenRequest } from '../app.type/RefreshToken.type';
  import { ResponseModel } from '../app.type/Response.type';
  import { Token } from '../app.type/Token.type';
  import { ToastrService } from 'ngx-toastr';

  @Injectable()
  export class ErrorInterceptor implements HttpInterceptor {
    constructor(private http: HttpsService, private toastr: ToastrService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
      const refreshToken = localStorage.getItem('refreshToken');
      const staffId = localStorage.getItem('staffId');

      const model: RefreshTokenRequest = {
        idStaff: Number(staffId),
        refreshtoken: refreshToken || '',
      };

      return next.handle(req).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status === 401) {
            return this.http.refreshToken(model).pipe(
              switchMap((response: ResponseModel<Token>) => {
                const tokenData = response?.data;
                if (tokenData?.accessToken) {
                  localStorage.setItem('staffId', String(tokenData.staffId));
                  localStorage.setItem('token', tokenData.accessToken);
                  localStorage.setItem('refreshToken', tokenData.refreshToken);

                  const cloned = req.clone({
                    setHeaders: {
                      Authorization: `Bearer ${tokenData.accessToken}`,
                    },
                  });

                  return next.handle(cloned);
                } else {
                  this.http.logout();
                  return throwError(() => new Error('Invalid token response'));
                }
              }),
              catchError(() => {
                this.http.logout();
                return throwError(() => new Error('Refresh token failed'));
              })
            );
          }


          if (error.status === 403) {
            this.toastr.error(
              'Bạn không có quyền truy cập chức năng này.',
              '403 - Truy cập bị từ chối'
            );
          }

          return throwError(() => error);
        })
      );
    }
  }
