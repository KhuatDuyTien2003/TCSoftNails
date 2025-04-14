import { Staff } from './../app.type/Staff.type';
import { ErrorType } from './../app.type/ErrorType.type';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';

import { ResponseModel } from '../app.type/Response.type';
import { SearchStaffModel } from '../app.type/SearchStaffModel.type';
import { WorkDate } from '../app.type/WorkDate.type';
import { customer } from '../app.type/customer.type';
import { ResponseWorkDate } from '../app.type/ResponseWorkDate.Type';
import { Appointment } from '../app.type/Appointment.type';
import { Service } from '../app.type/service.type';
import { StaffByServiceId } from '../app.type/StaffByServiceId.type';

@Injectable({
  providedIn: 'root',
})
export class HttpStaffService {
  private base_url = 'http://localhost:5213/';
  token: string = localStorage.getItem('token') || '';
  constructor(private httpStaff: HttpClient) {}
  httpOption = {
    headers: new HttpHeaders({
      'Content-type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    }),
  };
  public getAllStaff(
    page: number,
    pageSize: number
  ): Observable<{ data: Staff[]; count: number } | ErrorType> {
    const url = `${this.base_url}Staff/GetAll?page=${page}&pageSize=${pageSize}`;
    return this.httpStaff
      .get<{ data: Staff[]; count: number } | ErrorType>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getStaffById(staffId: number): Observable<ResponseModel<Staff>> {
    const url = `${this.base_url}Staff/GetStaffById/${staffId}`;
    return this.httpStaff
      .get<ResponseModel<Staff>>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public updateStaff(newStaff: Staff): Observable<ResponseModel<Staff>> {
    const url = `${this.base_url}Staff/UpdateStaff`;
    return this.httpStaff
      .post<ResponseModel<Staff>>(url, newStaff, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public deleteStaff(id: number): Observable<ResponseModel<string>> {
    const url = `${this.base_url}Staff/DeleteStaff/${id}`;
    return this.httpStaff
      .get<ResponseModel<string>>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public stopStartWork(id: number): Observable<ResponseModel<string>> {
    const url = `${this.base_url}Staff/StopStartWork/${id}`;
    return this.httpStaff
      .get<ResponseModel<string>>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public createStaff(model: Staff): Observable<ResponseModel<string>> {
    const url = `${this.base_url}Staff/CreateStaff`;
    return this.httpStaff
      .post<ResponseModel<string>>(url, model, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public exportStaff(): Observable<any> {
    const url = `${this.base_url}Staff/ExportStaff`;
    return this.httpStaff.get(url, this.httpOption);
  }
  public deleteFile(filePath: string): Observable<any> {
    const url = `${this.base_url}Staff/DeleteFile/${filePath}`;
    return this.httpStaff
      .get(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getServices(): Observable<any> {
    const url = `${this.base_url}Staff/GetServices`;
    return this.httpStaff
      .get<any>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public addStaffs(staffs: Staff[]): Observable<ResponseModel<string>> {
    const url = `${this.base_url}Staff/AddStaffs`;
    return this.httpStaff
      .post<ResponseModel<string>>(url, staffs, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public searchStaff(
    model: SearchStaffModel
  ): Observable<ResponseModel<Staff>> {
    const url = `${this.base_url}Staff/SearchStaff`;
    return this.httpStaff
      .post<ResponseModel<Staff>>(url, model, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getWorkDate(): Observable<ResponseModel<ResponseWorkDate[]>> {
    const url = `${this.base_url}Staff/GetWorkDate`;
    return this.httpStaff
      .get<ResponseModel<ResponseWorkDate[]>>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getCustomer(): Observable<
    ResponseModel<
      Omit<
        customer,
        | 'birthday'
        | 'email'
        | 'gender'
        | 'password'
        | 'rankId'
        | 'rankName'
        | 'totalMoney'
        | 'totalPoints'
        | 'urlAvatar'
        | 'userName'
      >[]
    >
  > {
    const url = `${this.base_url}Staff/GetCustomer`;
    return this.httpStaff
      .get<
        ResponseModel<
          Omit<
            customer,
            | 'birthday'
            | 'email'
            | 'gender'
            | 'password'
            | 'rankId'
            | 'rankName'
            | 'totalMoney'
            | 'totalPoints'
            | 'urlAvatar'
            | 'userName'
          >[]
        >
      >(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public createCalendar(model: WorkDate): Observable<ResponseModel<string>> {
    const url = `${this.base_url}Staff/CreateCalendar`;
    return this.httpStaff
      .post<ResponseModel<string>>(url, model, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public deleteWorkDate(id: number) {
    const url = `${this.base_url}Staff/DeleteCalendar/${id}`;
    return this.httpStaff
      .post<ResponseModel<string>>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getAppointment(): Observable<ResponseModel<Appointment[]>> {
    const url = `${this.base_url}Staff/GetAppointment`;
    return this.httpStaff
      .get<ResponseModel<Appointment[]>>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getService(): Observable<ResponseModel<Service[]>> {
    const url = `${this.base_url}Staff/GetService`;
    return this.httpStaff
      .get<ResponseModel<Service[]>>(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getStaffByServiceId(
    serviceIds: number[]
  ): Observable<ResponseModel<StaffByServiceId[]>> {
    const url = `${this.base_url}Staff/GetStaffByServiceIds`;

    const jsonArray = serviceIds.map(id => ({ serviceId: id }));
    return this.httpStaff
      .post<ResponseModel<StaffByServiceId[]>>(url, jsonArray, this.httpOption)
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
