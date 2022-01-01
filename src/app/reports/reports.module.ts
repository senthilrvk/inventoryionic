import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';
import { ReportComponent } from './report.component';
import { GodownStockandsaleComponent } from './godown-stockandsale/godown-stockandsale.component';
import { SalesorderReportComponent } from './salesorder-report/salesorder-report.component';
import { SalesmanwisesalesComponent } from './salesmanwisesales/salesmanwisesales.component';
import { StockandsalesComponent } from './stockandsales/stockandsales.component';
import { CustomerremarksComponent } from './customerremarks/customerremarks.component';
import { LedgerComponent } from './ledger/ledger.component';
const routes: Routes = [
  {
    path: "report",
    component: ReportComponent,
  },
  {
    path: "godownwiseStockAndSales",
    component: GodownStockandsaleComponent,
  }, {
    path: "salesOrderReport",
    component: SalesorderReportComponent,
  },
  {
    path: "salesmanwisesales",
    component: SalesmanwisesalesComponent,
  },
  {
    path: "stockandsales",
    component: StockandsalesComponent,
  },
  {
    path: "customerremarks",
    component: CustomerremarksComponent,
  },
  {
    path: "ledger",
    component: LedgerComponent,
  },
]

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,    
    RouterModule.forChild(routes),
    ],
  declarations: [
    ReportComponent,
    GodownStockandsaleComponent,
    SalesorderReportComponent,
    SalesmanwisesalesComponent,
    StockandsalesComponent,
    CustomerremarksComponent,
    LedgerComponent
  ]
})
export class ReportsPageModule {}
