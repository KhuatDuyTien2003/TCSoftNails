import { NgModule } from '@angular/core';
import {
  BrowserModule,
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideNzI18n } from 'ng-zorro-antd/i18n';
import { vi_VN } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import vi from '@angular/common/locales/vi';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

import {
  HttpClientModule,
  provideHttpClient,
  withFetch,
} from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { ToastrModule } from 'ngx-toastr';

import { NotFound502Component } from './not-found502/not-found502.component';

import { AddProductGroupDialogComponent } from './Product/add-product-group-dialog/add-product-group-dialog.component';
import { DetailProductComponent } from './Product/detail-product/detail-product.component';
import { FormUpdateComponent } from './admin/appointment/form-update/form-update.component';

registerLocaleData(vi);

@NgModule({
  declarations: [AppComponent, NotFound502Component, DetailProductComponent],

  imports: [
    BrowserModule,
    RouterModule,
    AppRoutingModule,
    FormsModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,

    BrowserAnimationsModule,
    ToastrModule.forRoot(),

    HttpClientModule,
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideNzI18n(vi_VN),
    provideAnimationsAsync(),

    provideHttpClient(),

    provideHttpClient(withFetch()),
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
