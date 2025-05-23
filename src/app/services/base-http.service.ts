import { HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class BaseHttpService {
  // base_url = 'http://apithuctapnail.tcsoft.vn';
  base_url = 'http://localhost:5213';

   httpOption() {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      }),
    };
  }
}
