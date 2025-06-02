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
import { FormAppointmentComponent } from './admin/appointment/form-appointment/form-appointment.component';
import { NotFound502Component } from './not-found502/not-found502.component';

import { ProductComponent } from './Product/product/product.component';

import { CustomerRankComponent } from './admin/customer/customer-rank/customer-rank.component';
import { BillComponent } from './admin/bill/bill.component';
import { AddReceiptComponent } from './admin/bill/add-receipt/add-receipt.component';
import { PermissionComponent } from './admin/permission/permission.component';
import { PriceListComponent } from './PriceList/price-list/price-list.component';
import { GoodsReceiptComponent } from './GoodsReceipt/goods-receipt/goods-receipt.component';
import { AddGoodsReceiptComponent } from './GoodsReceipt/add-goods-receipt/add-goods-receipt.component';
import { ReportDoanhthuComponent } from './admin/report/report-doanhthu/report-doanhthu.component';
import { DropdownParentChildComponent } from './dropdown-parent-child/dropdown-parent-child.component';
import { TestComponent } from './test/test.component';

const routes: Routes = [
  { path: 'Login', component: AccountComponent },
  { path: 'Register', component: RegisterComponent },
  { path: '', component: AccountComponent },
  { path: 'bill', component: BillComponent },
  { path: 'form-add-appointment', component: FormAppointmentComponent },
  { path: 'Forgot-Password', component: ForgotPasswordComponent },
  { path: 'Reset-Password', component: ResetPasswordComponent },
  { path: 'customer', component: CustomerComponent },
  { path: 'staff', component: StaffComponent },
  { path: 'staff/calendar-staff', component: CalendarStaffComponent },
  { path: 'staff/appointment', component: AppointmentComponent },
  { path: 'addShift', component: AddShiftComponent },
  { path: 'Forgot-Password', component: ForgotPasswordComponent },
  { path: 'product', component: ProductComponent },
  { path: 'permission', component: PermissionComponent },
  { path: 'customer-rank', component: CustomerRankComponent },
  { path: 'bill/add-receipt', component: AddReceiptComponent },
  { path: 'report', component: ReportDoanhthuComponent },
  { path: 'forms', component: TestComponent },
  { path: 'price-list', component: PriceListComponent },
  { path: 'goods-receipt', component: GoodsReceiptComponent },
  { path: 'add-goods-receipt', component: AddGoodsReceiptComponent },
  { path: '**', component: NotFound502Component },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
