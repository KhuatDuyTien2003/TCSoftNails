import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, throwError } from 'rxjs';
import { FilterCriteria } from '../../app.type/filter-criteria.type';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private base_url = 'http://localhost:5213';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  private firstServiceCompleteSource = new BehaviorSubject<boolean>(false);
  firstServiceComplete$ = this.firstServiceCompleteSource.asObservable();

  notifyFirstServiceComplete() {
    this.firstServiceCompleteSource.next(true);
  }

  constructor(private http: HttpClient) {}

  getProducts(): Observable<Array<any>> {
    const url = `${this.base_url}/Products`;
    return this.http
      .get<Array<any>>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  getProductsByFilter(filter: FilterCriteria): Observable<any[]> {
    const url = `${this.base_url}/Products/GetByFilter`;
    let params = new HttpParams()
      .set('PageNumber', filter.pageNumber)
      .set('PageSize', filter.pageSize);
    if (filter.searchTerm) params = params.set('searchTerm', filter.searchTerm);
    if (filter.productTypes?.length)
      params = params.set('productTypes', filter.productTypes.join(','));
    if (filter.productGroup)
      params = params.set('productGroup', filter.productGroup);
    if (filter.rank) params = params.set('Rank', filter.rank);
    if (filter.status) params = params.set('Status', filter.status);
    if (filter.stock) params = params.set('Stock', filter.stock);
    return this.http
      .get<any[]>(url, { params })
      .pipe(catchError(this.handleError));
  }
  getProductsByProductType(productTypeId: number): Observable<any> {
    const url = `${this.base_url}/Products/GetByProductType/${productTypeId}`;
    return this.http
      .get<any>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  postProduct(product: FormData): Observable<any> {
    const url = `${this.base_url}/Products/PostProduct`;
    // Nếu product là FormData, bạn không cần đặt Content-Type
    const options = { ...this.httpOptions };
    if (product instanceof FormData) {
      // Loại bỏ header Content-Type nếu có
      if (options.headers) {
        options.headers = options.headers.delete('Content-Type');
      }
    }

    return this.http
      .post<any>(url, product, options)
      .pipe(catchError(this.handleError));
  }
  postCombo(product: FormData): Observable<any> {
    const url = `${this.base_url}/Products/PostCombo`;
    // Nếu product là FormData, bạn không cần đặt Content-Type
    const options = { ...this.httpOptions };
    if (product instanceof FormData) {
      // Loại bỏ header Content-Type nếu có
      if (options.headers) {
        options.headers = options.headers.delete('Content-Type');
      }
    }

    return this.http
      .post<any>(url, product, options)
      .pipe(catchError(this.handleError));
  }

  getImagesByProductId(id: number): Observable<any> {
    const url = `${this.base_url}/Products/GetImagesByProductId/${id}`;
    return this.http
      .get<any>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  updateProduct(id: number, product: FormData): Observable<any> {
    const url = `${this.base_url}/Products/PutProduct/${id}`;
    console.log('Updating product:', id);
    // Nếu product là FormData, bạn không cần đặt Content-Type
    const options = { ...this.httpOptions };
    if (product instanceof FormData) {
      // Loại bỏ header Content-Type nếu có
      if (options.headers) {
        options.headers = options.headers.delete('Content-Type');
      }
    }
    // Đảm bảo FormData được cấu hình đúng
    this.logFormData(product);

    return this.http
      .put<any>(url, product, options)
      .pipe(catchError(this.handleError));
  }
  updateCombo(id: number, product: FormData): Observable<any> {
    const url = `${this.base_url}/Products/PutCombo/${id}`;
    console.log('Updating Combo:', id);
    // Nếu product là FormData, bạn không cần đặt Content-Type
    const options = { ...this.httpOptions };
    if (product instanceof FormData) {
      // Loại bỏ header Content-Type nếu có
      if (options.headers) {
        options.headers = options.headers.delete('Content-Type');
      }
    }
    // Đảm bảo FormData được cấu hình đúng
    this.logFormData(product);

    return this.http
      .put<any>(url, product, options)
      .pipe(catchError(this.handleError));
  }

  private logFormData(formData: FormData): void {
    console.log('---- FormData entries ----');
    for (const [key, val] of formData.entries()) {
      if (val instanceof File) {
        console.log(`${key}: File(${(val as File).name})`);
      } else {
        console.log(`${key}:`, val);
      }
    }
  }
  getProductById(id: number): Observable<any> {
    const url = `${this.base_url}/Products/GetById/${id}`;
    return this.http
      .get<any>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  getDetailCombo(id: number): Observable<any> {
    const url = `${this.base_url}/Products/GetDetailCombo/${id}`;
    return this.http
      .get<any>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  getProBySearch(search: string): Observable<any> {
    const url = `${this.base_url}/Products/GetProductsBySearch/${search}`;
    return this.http
      .get<any>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  getOnlyProBySearch(search: string): Observable<any> {
    const url = `${this.base_url}/Products/GetOnlyProductsBySearch/${search}`;
    return this.http
      .get<any>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }
  deleteProduct(id: number): Observable<any> {
    const url = `${this.base_url}/Products/DeleteProduct/${id}`;
    return this.http
      .delete<any>(url, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  deleteMultipleProducts(ids: number[]): Observable<any> {
    const url = `${this.base_url}/Products/DeleteMultipleProducts`;
    return this.http
      .post<any>(url, ids, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
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
