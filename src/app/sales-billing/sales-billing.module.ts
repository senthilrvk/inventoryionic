import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RouterModule, Routes } from '@angular/router';
import { SaleinventoryComponent } from './orderinventory/orderinventory.component';
import { SalesVansalesComponent } from './orderinventory/vansales/vansales.component';
import { AllOrderPage } from './orderdetails/allorder/allorder.page';
import { CartOrderPage } from './orderdetails/cartorder/cartorder.page';
import { ModalPage } from './orderdetails/allorder/modal/modal.page';
import { CategoryOrderPage } from './orderdetails/categoryorder/categoryorder.page';
import { CompanyOrderPage } from './orderdetails/companyorder/companyorder.page';
import { ProductListComponent } from './orderdetails/product-list/product-list.component';
import { ProductModalComponent } from './orderdetails/product-modal/product-modal.component';
import { ModalhistoryComponent } from './orderinventory/modalhistory/modalhistory.component';

import { InventryPosPage, PopoverComponent } from './inventry-pos/inventry-pos.page';
import { InventryPaymentComponent } from '../dialogue/inventry-payment/inventry-payment.component';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { InventryListComponent } from '../dialogue/inventry-list/inventry-list.component';
import { SmspopupModalComponent } from '../shared/smspopup-modal/smspopup-modal.component';
import { OrderFilterModalComponent } from './orderdetails/order-filter-modal/order-filter-modal/order-filter-modal.component';


const routes: Routes = [
  {
    path: 'orderinventory',
    component: SaleinventoryComponent
  },
  {
    path: 'vansales',
    component: SalesVansalesComponent
  },
  {
    path: 'cart',
    component: CartOrderPage
  },

  {
    path: "allorder",
    component: AllOrderPage,
  }, {
    path: "inventrypos",
    component: InventryPosPage,
  }
];


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ],
  declarations: [
    SaleinventoryComponent,
    SalesVansalesComponent,
    ModalPage,
    AllOrderPage,
    CategoryOrderPage,
    CompanyOrderPage,
    ProductListComponent,
    CartOrderPage,
    ProductModalComponent,
    ModalhistoryComponent,
    InventryPosPage,
    InventryPaymentComponent,
    PopoverComponent,
    SmspopupModalComponent,
    InventryListComponent,
    OrderFilterModalComponent
  ],

  entryComponents: [
    ModalhistoryComponent,
    ModalPage,
    SmspopupModalComponent,
    InventryListComponent,
    ProductModalComponent,
    InventryPaymentComponent,
    PopoverComponent,

    OrderFilterModalComponent
  ],
  providers: [BarcodeScanner]
})
export class SalesBillingPageModule { }
