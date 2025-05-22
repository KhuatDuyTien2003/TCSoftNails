import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductComponent } from './Product/product/product.component';
import { PriceListComponent } from './PriceList/price-list/price-list.component';
import { GoodsReceiptComponent } from './GoodsReceipt/goods-receipt/goods-receipt.component';
import { AddGoodsReceiptComponent } from './GoodsReceipt/add-goods-receipt/add-goods-receipt.component';

const routes: Routes = [
  { path: 'product', component: ProductComponent },
  { path: 'price-list', component: PriceListComponent },
  { path: 'goods-receipt', component: GoodsReceiptComponent },
  { path: 'add-goods-receipt', component: AddGoodsReceiptComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
