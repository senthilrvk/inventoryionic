import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PurchasePage } from './purchase-bill/purchase.page';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';


const routes: Routes = [
  {
    path: 'purchaseBill',
    component: PurchasePage
  },
  {
    path: 'purchaselist',
    component: PurchaseListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PurchasePageRoutingModule {}
