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

import { ToastrModule } from 'ngx-toastr';
import { NotFound502Component } from './not-found502/not-found502.component';
import {
  provideHttpClient,
  withFetch,
  HttpClientModule,
  HTTP_INTERCEPTORS,
} from '@angular/common/http';

import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { ErrorInterceptor } from './services/auth.interceptor';
import { DropdownParentChildComponent } from './dropdown-parent-child/dropdown-parent-child.component';
registerLocaleData(vi);

@NgModule({
  declarations: [AppComponent, NotFound502Component],
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
    HeaderComponent,
    DropdownParentChildComponent,
  ],
  providers: [
    provideClientHydration(withEventReplay()),
    provideNzI18n(vi_VN),
    provideAnimationsAsync(),
    provideHttpClient(),
    provideHttpClient(withFetch()),
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
