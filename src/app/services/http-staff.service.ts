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
import {
  Appointment,
  AppointmentCustomerModel,
} from '../app.type/Appointment.type';
import { format } from 'date-fns';
import { StaffByServiceId } from '../app.type/StaffByServiceId.type';
import { BaseHttpService } from './base-http.service';
import { Service } from '../app.type/service.type';
import { AppointmentSent } from '../app.type/AppointmentSent.type';

@Injectable({
  providedIn: 'root',
})
export class HttpStaffService {
  baseClass = new BaseHttpService();
  private base_url = this.baseClass.base_url + '/';
  httpOption = this.baseClass.httpOption;

  token: string = localStorage.getItem('token') || '';
  constructor(private httpStaff: HttpClient) {}

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

    const jsonArray = serviceIds.map((id) => ({ serviceId: id }));
    return this.httpStaff
      .post<ResponseModel<StaffByServiceId[]>>(url, jsonArray, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public addAppointment(
    model: AppointmentSent
  ): Observable<ResponseModel<string>> {
    const url = `${this.base_url}Staff/AddAppointment`;

    let json = {
      idAppointment: 100,
      idStaff: model.idStaff,
      name: model.customerName,
      email: model.email,
      numberPhone: model.numberPhone,
      startTime: format(model.startTime, "yyyy-MM-dd'T'HH:mm:ss"),
      endTime: format(model.endTime, "yyyy-MM-dd'T'HH:mm:ss"),
      desciption: model.description,
      seviceDetail: model.listOfSevice.map((s) => ({
        idAppointment: 100,
        serviceId: Number(s),
      })),
    };
    return this.httpStaff
      .post<ResponseModel<string>>(url, json, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }
  public updateAppointment(
    idAppointment: number,
    model: AppointmentSent
  ): Observable<ResponseModel<string>> {
    const url = `${this.base_url}Staff/UpdateAppointment`;
    console.log(model.description);
    let json = {
      idAppointment: idAppointment,
      idStaff: model.idStaff,
      name: model.customerName,
      email: model.email,
      gender: model.gender,
      status: model.status,
      numberPhone: model.numberPhone,
      startTime: format(model.startTime, "yyyy-MM-dd'T'HH:mm:ss"),
      endTime: format(model.endTime, "yyyy-MM-dd'T'HH:mm:ss"),
      description: model.description,
      seviceDetail: model.listOfSevice.map((s) => ({
        idAppointment: idAppointment,
        serviceId: Number(s),
      })),
    };
    return this.httpStaff
      .post<ResponseModel<string>>(url, json, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public getTimeAppointment(): Observable<
    ResponseModel<
      Omit<
        AppointmentCustomerModel,
        | 'idCustomer'
        | 'customerName'
        | 'email'
        | 'numberPhone'
        | 'note'
        | 'appointmentDetails'
      >[]
    >
  > {
    const url = `${this.base_url}Staff/GetTimeAppointment`;
    return this.httpStaff
      .get<
        ResponseModel<
          Omit<
            AppointmentCustomerModel,
            | 'idCustomer'
            | 'customerName'
            | 'email'
            | 'numberPhone'
            | 'note'
            | 'appointmentDetails'
          >[]
        >
      >(url, this.httpOption)
      .pipe(catchError((error) => this.handleError(error)));
  }

  public deleteAppointment(id: Number): Observable<ResponseModel<string>> {
    const url = `${this.base_url}Staff/DeleteAppointment/${id}`;
    return this.httpStaff
      .get<ResponseModel<string>>(url, this.httpOption)
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
