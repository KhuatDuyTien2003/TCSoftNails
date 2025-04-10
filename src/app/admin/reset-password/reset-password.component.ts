import { Component, inject, OnInit } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { HttpsService } from '../../services/https.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    RouterModule,
  ],
})
export class ResetPasswordComponent implements OnInit {
  token: string = '';
  email: string = '';
  constructor(private router: ActivatedRoute, private http: HttpsService) {}

  ngOnInit(): void {
    this.router.queryParams.subscribe((params) => {
      this.token = decodeURIComponent(params['token']);
      this.email = params['email'];
      console.log('token: ' + this.token);
      console.log('email: ' + this.email);
    });
  }
  private fb = inject(NonNullableFormBuilder);
  validateForm = this.fb.group({
    password: this.fb.control('', [Validators.required]),
  });

  submitForm(): void {
    var password = this.validateForm.value.password || '';
    this.http
      .resetPassword(this.email, this.token, password)
      .subscribe((data) => {
        console.log('Đã reset');
      });
  }
}
