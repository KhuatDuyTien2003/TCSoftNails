import { Component, inject } from '@angular/core';
import {
  EmailValidator,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Route, Router, RouterModule } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { HttpsService } from '../../services/https.service';
import { emit } from 'process';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    RouterModule,
    CommonModule,
  ],
})
export class ForgotPasswordComponent {
  constructor(private http: HttpsService, private router: Router) {}
  isHidden: boolean = true;
  messageError: string = '';
  private fb = inject(NonNullableFormBuilder);
  validateForm = this.fb.group({
    emailForgotPassword: this.fb.control('', [
      Validators.required,
      Validators.email,
    ]),
  });

  submitForm(): void {
    var email = this.validateForm.value.emailForgotPassword || '';

    this.http.forgotPassword(email).subscribe((data) => {
      if (data.success === true) {
        this.isHidden = !this.isHidden;
      } else {
        this.messageError = data.message;
      }
    });
  }
}
