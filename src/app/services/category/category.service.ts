import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { BaseHttpService } from '../base-http.service';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  baseClass = new BaseHttpService();
  private base_url = this.baseClass.base_url;


  constructor(private http: HttpClient,private baseService: BaseHttpService) {}

  // Get all categories
  getCategories(): Observable<any> {
    const url = `${this.base_url}/Categories`;
    return this.http
      .get<any>(url, this.baseService.httpOption())
      .pipe(catchError(this.handleError));
  }

  // Get category by ID
  getCategoryById(id: number): Observable<any> {
    const url = `${this.base_url}/Categories/GetById/${id}`;
    return this.http
      .get<any>(url, this.baseService.httpOption())
      .pipe(catchError(this.handleError));
  }

  // Create a new category
  createCategory(category: any): Observable<any> {
    const url = `${this.base_url}/Categories/CreateCategory`;
    return this.http
      .post<any>(url, category, this.baseService.httpOption())
      .pipe(catchError(this.handleError));
  }

  // Update an existing category
  updateCategory(category: any): Observable<any> {
    const url = `${this.base_url}/Categories/UpdateCategory/${category.CategoryId}`;
    return this.http
      .put<any>(url, category, this.baseService.httpOption())
      .pipe(catchError(this.handleError));
  }

  // Delete a category
  deleteCategory(id: number): Observable<any> {
    const url = `${this.base_url}/Categories/DeleteCategory/${id}`;
    return this.http
      .delete<any>(url, this.baseService.httpOption())
      .pipe(catchError(this.handleError));
  }

  // Error handler
  private handleError(error: HttpErrorResponse) {
    let errorMess;
    if (error.error instanceof Error) {
      // Client-side or network error
      errorMess = 'Lỗi phía client hoặc mạng: ' + error.message;
    } else {
      // Backend returned an unsuccessful response code
      errorMess = 'Lỗi phía server: ' + error.status + ': ' + error.message;
    }
    console.error(errorMess);
    return throwError(() => new Error(errorMess));
  }
}
