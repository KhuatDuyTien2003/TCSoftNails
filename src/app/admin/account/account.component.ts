
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { account } from './../../app.type/account.type';
import { Component, inject } from '@angular/core';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { HttpsService } from '../../services/https.service';



@Component({
  selector: 'app-account',
  standalone: true,
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzInputModule,
    RouterModule,
  ],
})
export class AccountComponent {

  messageError: string = '';
  constructor(private http: HttpsService, private router: Router) {}


  private formLogin = inject(NonNullableFormBuilder);
  validateForm = this.formLogin.group({
    username: this.formLogin.control('', [Validators.required]),
    password: this.formLogin.control('', [Validators.required]),
    remember: this.formLogin.control(true),
  });

  submitForm(): void {


    var account: Omit<
      account,
      'staffName' | 'gender' | 'phoneNumber' | 'birthday' | 'Email'
    > = {
      username: this.validateForm.value.username || '',
      password: this.validateForm.value.password || '',
    };
    this.http.Login(account.username, account.password).subscribe((data) => {
      if (data.success) {

        console.log(data.data.token.result);
        localStorage.setItem('token', data.data.token.result);
        localStorage.setItem('staffId', data.data.staffId);
        this.messageError = '';
        this.router.navigate(['/customer']);
      } else {
        this.messageError = data.message;

        console.log(data.message);
      }
    });
  }
}
