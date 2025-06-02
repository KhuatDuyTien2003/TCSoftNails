import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private base_url = 'http://apithuctapnail.tcsoft.vn/Suppliers';
  token = localStorage.getItem('token') || '';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    }),
  };

  constructor(private http: HttpClient) {}

  getAllSuppliers(): Observable<any> {
    return this.http
      .get<any>(`${this.base_url}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  getSupplierById(id: number): Observable<any> {
    return this.http
      .get<any>(`${this.base_url}/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  createSupplier(supplier: any): Observable<any> {
    return this.http
      .post<any>(`${this.base_url}`, supplier, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateSupplier(id: number, supplier: any): Observable<any> {
    return this.http
      .put<any>(`${this.base_url}/${id}`, supplier, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteSupplier(id: number): Observable<any> {
    return this.http
      .delete<any>(`${this.base_url}/${id}`, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any) {
    let errorMsg = error?.error?.message || error.statusText || 'Server error';
    return throwError(() => new Error(errorMsg));
  }
}
