import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Promotion } from '../app.type/promotion.type';

@Injectable({
  providedIn: 'root'
})
export class PromotionService {

  private apiUrl = 'https://localhost:7087/Promotion';

  constructor(private http: HttpClient) { }

  getAllPromotions(): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetAllPromotion`);
  }
  // Lấy 1 Promotion theo id
  getPromotionById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/GetPromotionById?id=${id}`);
  }

  // Thêm Promotion
  createPromotion(promotion: Promotion): Observable<any> {
    return this.http.post(`${this.apiUrl}/CreatePromotion`, promotion);
  }

  // Sửa Promotion
  updatePromotion(id: number, promotion: Promotion): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, promotion);
  }

  // Xóa Promotion
  deletePromotion(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/DeletePromotion/${id}`);
  }

  importExcel(data: Promotion[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/import-excel`, data);
  }
}
