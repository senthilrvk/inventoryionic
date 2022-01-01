import { NgModule } from "@angular/core";
import { NoPreloading, PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { HomePage } from "./shared/home/home.page";
import { MasterComponent } from "./shared/master/master.component";
import { NetworkerrorComponent } from "./networkerror/networkerror.component";
import { FindlocationComponent } from "./shared/findlocation/findlocation.component";
import { LocationListComponent } from "./shared/location-list/location-list.component";
import { VoucherReceiptComponent } from './shared/voucher-receipt/voucher-receipt.component';
import { SalesReturnComponent } from './shared/sales-return/sales-return.component';
import { DeliveryBoxComponent } from "./shared/delivery-box/delivery-box.component";
import { PrintSettingsComponent } from "./printpage/print-settings/print-settings.component";
import { AuthGuard } from "./core/guards/auth.guard";
import { ProductsComponent } from "./shared/products/products.component";
const routes: Routes = [

  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: "login",
    loadChildren: () =>
      import("./login/login.module").then((m) => m.LoginPageModule),
  },
  {
    path: 'sales',
    loadChildren: () => import('./sales-billing/sales-billing.module').then( m => m.SalesBillingPageModule)
  },
  {
    path: 'reports',
    loadChildren: () => import('./reports/reports.module').then( m => m.ReportsPageModule)
  },
  {
    path: "home",
    component: HomePage,
    canActivate: [AuthGuard]
  },

  {
    path: "salesreturn",
    component: SalesReturnComponent,
  },

  {
    path: "master",
    component: MasterComponent,
  },
  {
    path: "delivery",
    component: DeliveryBoxComponent
  },
  {
    path: "voucherreceipt",
    component: VoucherReceiptComponent,
  },

  {
    path: "location",
    component: FindlocationComponent,
  },
  {
    path: "locationlist",
    component: LocationListComponent,
  },
  {
    path: "network",
    component: NetworkerrorComponent,
  },
  {
    path: 'printsettings',
    component:PrintSettingsComponent
  },{
  path: 'products',
  component:ProductsComponent
},
  {
    path: 'purchase',
    loadChildren: () => import('./purchase/purchase.module').then( m => m.PurchasePageModule)
  }


];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: NoPreloading
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
