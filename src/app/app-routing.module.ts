import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './admin/account/account.component';
import { RegisterComponent } from './admin/register/register.component';
import { ForgotPasswordComponent } from './admin/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './admin/reset-password/reset-password.component';
import { ProductComponent } from './Product/product/product.component';

const routes: Routes = [
  { path: 'Login', component: AccountComponent },
  { path: 'Register', component: RegisterComponent },
  { path: '', component: AccountComponent },
  { path: 'Forgot-Password', component: ForgotPasswordComponent },
  { path: 'Reset-Password/:token&:email', component: ResetPasswordComponent },
  { path: 'product', component: ProductComponent },
  // { path: ':id', component: ProductComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
