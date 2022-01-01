import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PurchasePageRoutingModule } from './purchase-routing.module';
import { PurchasePage } from './purchase-bill/purchase.page';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';
import { PurchaseProductComponent } from './purchase-product/purchase-product.component';
import { PurchaseFormComponent } from './purchase-form/purchase-form.component';
import { PopoverComponent } from './popover/popover.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PurchasePageRoutingModule
  ],
  declarations: [
    PurchasePage,
    PurchaseListComponent,
    PurchaseProductComponent,
    PurchaseFormComponent,
    PopoverComponent],

    entryComponents: [
      PurchaseProductComponent,
      PurchaseFormComponent,
      PopoverComponent
    ]
})
export class PurchasePageModule { }
