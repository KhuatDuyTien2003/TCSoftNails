import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './admin/account/account.component';
import { RegisterComponent } from './admin/register/register.component';
import { ForgotPasswordComponent } from './admin/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './admin/reset-password/reset-password.component';
import { PromotionListComponent } from './admin/promotion/promotion-list/promotion-list.component';
import { PromotionAddComponent } from './admin/promotion/promotion-add/promotion-add.component';
import { PromotionEditComponent } from './admin/promotion/promotion-edit/promotion-edit.component';

const routes: Routes = [
  { path: 'Login', component: AccountComponent },
  { path: 'Register', component: RegisterComponent },
  { path: '', component: AccountComponent },
  //{ path: '**', component: AccountComponent },
  { path: 'Forgot-Password', component: ForgotPasswordComponent },
  { path: 'Reset-Password', component: ResetPasswordComponent },
  { path: 'promotion-list', component: PromotionListComponent },
  { path: 'promotion-add', component: PromotionAddComponent },
  { path: 'promotion-edit/:id', component: PromotionEditComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
