import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { RouteReuseStrategy, RouterModule } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
;
import { HttpModule } from '@angular/http';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Network } from '@ionic-native/network/ngx';
import { NetworkerrorComponent } from './networkerror/networkerror.component';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { File } from '@ionic-native/file/ngx';
import { Screenshot } from '@ionic-native/screenshot/ngx';

import { FatimainvoiceprintComponent } from './printpage/fatimainvoiceprint/fatimainvoiceprint.component';
import { GalaxyelectronicsComponent } from './printpage/galaxyelectronics/galaxyelectronics.component';
import { GstpharmaprintTwoComponent } from './printpage/gstpharmaprint-two/gstpharmaprint-two.component';
import { MobileprintmrpComponent } from './printpage/mobileprintmrp/mobileprintmrp.component';
import { PrintmodelOneComponent } from './printpage/printmodel-one/printmodel-one.component';
import { CustomerhelpComponent } from './shared/customerhelp/customerhelp.component';
import { FindlocationComponent } from './shared/findlocation/findlocation.component';
import { LocationListComponent } from './shared/location-list/location-list.component';
import { LocationMapComponent } from './shared/master/location-map/location-map.component';
import { HomePage } from './shared/home/home.page';
import { MasterComponent } from './shared/master/master.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxQRCodeModule } from '@techiediaries/ngx-qrcode';
import { VoucherReceiptComponent } from './shared/voucher-receipt/voucher-receipt.component';
import { PDFGenerator } from '@ionic-native/pdf-generator/ngx';
import { Printer } from '@ionic-native/printer/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { SalesReturnComponent } from './shared/sales-return/sales-return.component';
import { ProductsReturnModalComponent } from './shared/sales-return/products-return-modal/products-return-modal.component';
import { ProductReturnListComponent } from './shared/sales-return/product-return-list/product-return-list.component';
import { SMS } from '@ionic-native/sms/ngx';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { DocShareService } from './printpage/components/print-share-pdf/doc-share.service';
import { TextileEstimateA5Component } from './printpage/textile-estimate-a5/textile-estimate-a5.component';
import { FilterPipePipe } from './pipes/filter-pipe.pipe';
import { DeliveryBoxComponent } from './shared/delivery-box/delivery-box.component';
import { ViewDetailsComponent } from './shared/delivery-box/view-details/view-details.component';
import { PrintmodelHalfComponent } from './printpage/printmodel-half/printmodel-half.component';
import { BluetoothSerial} from '@ionic-native/bluetooth-serial/ngx';
import { BtModalPage, PrintSettingsComponent } from './printpage/print-settings/print-settings.component';
import { AddCustomerComponent } from './dialogue/add-customer/add-customer.component';
import { PosKeybordComponent } from './dialogue/pos-keybord/pos-keybord.component';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { LoadingInterceptor } from './core/interceptors/loading.interceptor';
import { JwtInterceptor } from './core/interceptors/jwt.interceptor';
import { Storage } from '@ionic/storage';
import { ArabicThermalPrintPage } from './printpage/arabic-thermal-print/arabic-thermal-print.page';
import { NetworkProvider } from './providers/network/network';
import { OutstandingModalComponent } from './reports/ledger/outstanding-modal/outstanding-modal.component';
import { ProductsComponent } from './shared/products/products.component';
import { PrintmodelcreditnoteComponent } from './printpage/printmodelcreditnote/printmodelcreditnote.component';


@NgModule({
  imports: [
    CommonModule,
    BrowserModule,
    NgxQRCodeModule,
    IonicModule.forRoot(),
  //  IonicStorageModule.forRoot(),
    AppRoutingModule,
    HttpModule,
    HttpClientModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
    // DatePickerModule,
  ],

  declarations: [
    AppComponent,
    NetworkerrorComponent,
    VoucherReceiptComponent,
    HomePage,
    MasterComponent,
    DeliveryBoxComponent,
    MobileprintmrpComponent,
    PrintmodelOneComponent,
    PrintmodelHalfComponent,
    GalaxyelectronicsComponent,
    GstpharmaprintTwoComponent,
    CustomerhelpComponent,
    FindlocationComponent,
    OutstandingModalComponent,
    FatimainvoiceprintComponent,
    LocationMapComponent,
    TextileEstimateA5Component,
    LocationListComponent,
    SalesReturnComponent,
    ProductsReturnModalComponent,
    ProductReturnListComponent,
    FilterPipePipe,
    ViewDetailsComponent,
    PrintSettingsComponent,
    BtModalPage,
    AddCustomerComponent,
    PosKeybordComponent,
    ArabicThermalPrintPage,
    ProductsComponent,
    PrintmodelcreditnoteComponent
  ],

  entryComponents: [
    BtModalPage,
    MobileprintmrpComponent,
    GalaxyelectronicsComponent,
    GstpharmaprintTwoComponent,
    CustomerhelpComponent,
    FindlocationComponent,
    OutstandingModalComponent,
    PrintmodelHalfComponent,
    PrintmodelOneComponent,
    LocationMapComponent,
    FatimainvoiceprintComponent,
    LocationListComponent,
    ProductsReturnModalComponent,
    ProductReturnListComponent,
    TextileEstimateA5Component,
    ViewDetailsComponent,
    AddCustomerComponent,
    PosKeybordComponent,
    MasterComponent,
    ArabicThermalPrintPage,
    PrintmodelcreditnoteComponent
  ],

  providers: [
    StatusBar,
    SplashScreen,
    Network,
    Storage,
    // NetworkProvider,
    SocialSharing,
    InAppBrowser,
    File,
    SMS,
    Printer,
    FileOpener,
    Geolocation,
    DatePicker,
    Screenshot,
    PDFGenerator,
    DocShareService,
    AndroidPermissions,
    DatePipe,
    // AuthService,
    // ControlService,
    BluetoothSerial,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    // {provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
