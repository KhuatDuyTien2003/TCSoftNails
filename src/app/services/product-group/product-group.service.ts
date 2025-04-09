import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class ProductGroupService {
  private base_url = 'http://localhost:5213';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http: HttpClient) {}

  getProductGroups(): Observable<any> {
    const url = `${this.base_url}/ProductGroups`;
    return this.http
      .get<any>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  getProductGroupById(id: number): Observable<any> {
    const url = `${this.base_url}/ProductGroups/GetById/${id}`;
    return this.http
      .get<any>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  createProductGroup(productType: any): Observable<any> {
    const url = `${this.base_url}/ProductGroups/PostProductGroup`;
    return this.http
      .post<any>(url, productType, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateProductGroup(productType: any): Observable<any> {
    const url = `${this.base_url}/ProductGroups/UpdateProductGroup/${productType.ProductTypeId}`;
    return this.http
      .put<any>(url, productType, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteProductGroup(id: number): Observable<any> {
    const url = `${this.base_url}/ProductGroups/DeleteProductGroup/${id}`;
    return this.http
      .delete<any>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    debugger;
    let errorMess;
    if (error.error instanceof Error) {
      // Lỗi phía client hoặc mạng
      errorMess = 'Lỗi phía client hoặc mạng: ' + error.message;
    } else {
      // Server trả về mã lỗi không thành công
      errorMess = 'Lỗi phía server: ' + error.status + ': ' + error.message;
    }
    console.error(errorMess);
    return throwError(() => new Error(errorMess));
  }
}
