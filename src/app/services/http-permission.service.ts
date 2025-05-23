import { Injectable } from '@angular/core';
import { BaseHttpService } from './base-http.service';
import { ToastrService } from 'ngx-toastr';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ResponseModel } from '../app.type/Response.type';
import { Permission } from '../app.type/Permission.type';

@Injectable({
  providedIn: 'root',
})
export class HttpPermissionService {
  baseClass = new BaseHttpService();
  private base_url = this.baseClass.base_url + '/';
  constructor(private httpPermission: HttpClient, toastr: ToastrService,private  baseService: BaseHttpService) {}
  public getPermission(): Observable<ResponseModel<Permission[]>> {
    const url = `${this.base_url}Permission`;
    return this.httpPermission
      .get<ResponseModel<Permission[]>>(url, this.baseService.httpOption())
      .pipe(catchError((error) => this.handleError(error)));
  }

  public createRole(nameRole: string): Observable<ResponseModel<string>> {
    let model: Permission = {
      id: '100',
      roleName: nameRole,
      functions: [],
    };
    const url = `${this.base_url}Permission/CreateRole`;
    return this.httpPermission
      .post<ResponseModel<string>>(url, model, this.baseService.httpOption())
      .pipe(catchError((error) => this.handleError(error)));
  }

  public updatePermission(
    model: Permission
  ): Observable<ResponseModel<string>> {
    const url = `${this.base_url}Permission/UpdateRole`;
    return this.httpPermission
      .put<ResponseModel<string>>(url, model, this.baseService.httpOption())
      .pipe(catchError((error) => this.handleError(error)));
  }

  public deleteRole(id: string): Observable<ResponseModel<string>> {
    const url = `${this.base_url}Permission/DeleteRole/${id}`;
    return this.httpPermission
      .delete<ResponseModel<string>>(url, this.baseService.httpOption())
      .pipe(catchError((error) => this.handleError(error)));
  }

  public updateRoleForUser(
    idUser: number,
    idRole: string
  ): Observable<ResponseModel<string>> {
    const url = `${this.base_url}Permission/UpdateRoleForUser/${idUser}/${idRole}`;
    return this.httpPermission
      .get<ResponseModel<string>>(url, this.baseService.httpOption())
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
