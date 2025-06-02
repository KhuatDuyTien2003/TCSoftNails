import { Injectable } from '@angular/core';
import { BaseHttpService } from './base-http.service';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { ResponseModel } from '../app.type/Response.type';
import { catchError, Observable, throwError } from 'rxjs';
import { DoanhThuTheoNgay } from '../app.type/DoanhThuTheoNgay.type';
import { ReportResponseModel } from '../app.type/ReportModel.type';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  baseClass = new BaseHttpService();
  private base_url = this.baseClass.base_url + '/Report/';
  constructor(
    private httpReport: HttpClient,
    toastr: ToastrService,
    private baseService: BaseHttpService
  ) {}
  public getReport(): Observable<ResponseModel<ReportResponseModel>> {
    const url = `${this.base_url}GetReport`;
    return this.httpReport
      .get<ResponseModel<ReportResponseModel>>(
        url,
        this.baseService.httpOption()
      )
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
