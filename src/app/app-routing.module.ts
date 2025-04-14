import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountComponent } from './admin/account/account.component';
import { RegisterComponent } from './admin/register/register.component';
import { ForgotPasswordComponent } from './admin/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './admin/reset-password/reset-password.component';

import { CustomerComponent } from './admin/customer/customer.component';
import { StaffComponent } from './admin/staff/staff.component';
import { CalendarStaffComponent } from './admin/calendar/calendar-staff/calendar-staff.component';
import { AddShiftComponent } from './admin/calendar/add-shift/add-shift.component';
import { AppointmentComponent } from './admin/appointment/appointment.component';
import { FormAppointmentComponent } from './admin/form-appointment/form-appointment.component';
import { NotFound502Component } from './not-found502/not-found502.component';

import { ProductComponent } from './Product/product/product.component';


const routes: Routes = [
  { path: 'Login', component: AccountComponent },
  { path: 'Register', component: RegisterComponent },
  { path: '', component: AccountComponent },


  { path: 'form1', component: FormAppointmentComponent },
  { path: 'Forgot-Password', component: ForgotPasswordComponent },
  { path: 'Reset-Password', component: ResetPasswordComponent },
  { path: 'customer', component: CustomerComponent },
  { path: 'staff', component: StaffComponent },
  { path: 'staff/calendar-staff', component: CalendarStaffComponent },
  { path: 'staff/appointment', component: AppointmentComponent },
  { path: 'addShift', component: AddShiftComponent },


  { path: 'Forgot-Password', component: ForgotPasswordComponent },
  { path: 'Reset-Password/:token&:email', component: ResetPasswordComponent },
  { path: 'product', component: ProductComponent },{ path: '**', component: NotFound502Component },
  // { path: ':id', component: ProductComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
