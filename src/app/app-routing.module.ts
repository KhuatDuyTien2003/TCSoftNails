import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductComponent } from './Product/product/product.component';
import { PriceListComponent } from './PriceList/price-list/price-list.component';

const routes: Routes = [
  { path: 'product', component: ProductComponent },
  { path: 'pricelist', component: PriceListComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
