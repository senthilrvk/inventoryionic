import { Component, OnInit, AfterContentInit, ViewChild } from "@angular/core";
import { AppService } from "src/app/app.service";
import { Router, ActivatedRoute } from "@angular/router";
import {
  AlertController,
  ModalController,
} from "@ionic/angular";

import { ModalPage } from "./modal/modal.page";
import { map, takeUntil } from "rxjs/operators";

import { InAppBrowser, InAppBrowserObject, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { PDFGenerator } from '@ionic-native/pdf-generator/ngx';
import { Printer } from '@ionic-native/printer/ngx';
import { ProductModalComponent } from "../product-modal/product-modal.component";
import { AllOrderService } from "./all-order.service";
import { AddCustomerComponent } from "src/app/dialogue/add-customer/add-customer.component";
import { ControlService } from "src/app/core/services/controlservice/control.service";
import { Subject } from "rxjs";
import { SmspopupModalComponent } from "src/app/shared/smspopup-modal/smspopup-modal.component";
import { OutstandingModalComponent } from "src/app/reports/ledger/outstanding-modal/outstanding-modal.component";
declare var cordova: any;

@Component({
  selector: "app-allorder",
  templateUrl: "allorder.page.html",
  styleUrls: ["allorder.page.scss"],
})
export class AllOrderPage implements OnInit, AfterContentInit {
 
  @ViewChild("qty", { static: false }) myQty;
  @ViewChild("product", { static: false }) myProduct;
  
  // tslint:disable-next-line:variable-name
  view_name: boolean;

  baseUrl: any;
  branchId: any;

  ProductGet: any[] = [];
  products = [];
  AmtTotal = 0;
  itemEnter: any;
  SalesOrderID: number;
  SalesorderBillNo: number;
  PriceSelected: any;
  remarks: string;
  SalesId: any;
  ledgerAmount: number = 0;
  pricemenu: any;
  custName: any;
  anchor: boolean;
  fromdate: any;
  Todate: any;
  dataGetList = [];
  loading: boolean;
  // tslint:disable-next-line:variable-name
  create_page: boolean;

  txtproduct: any;
  quantity: any;
  // tslint:disable-next-line:variable-name
  save_button: boolean;

  strMrpInclusiveSales: any;

  public count = [];
  cartUpdate: { productId: number; soldQuantity: number; rate: number };
  public subTotal = [];
  private _unsubscribeAll: Subject<any>;
  strImageSaveFolderName: any;
  smsAlert: any;
  txtPrintFileName: any;
  cartItems: any[] = [];
  btnSave: boolean = false;
  constructor(
    public alertController: AlertController,
    public appService: AppService,
    public router: Router,
    public modalController: ModalController,
    public ctrlService: ControlService,
    private iab: InAppBrowser,
    public allOrderService: AllOrderService,
    private pdf: PDFGenerator,
    private printer: Printer,
  ) {
    appService.CartData.subscribe(data => {
      this.cartItems = data;
    })
  }

  async ngOnInit() {
    this._unsubscribeAll = new Subject();
    this.fromdate = this.getDateddmmyyConvert();
    this.Todate = this.getDateddmmyyConvert();

    this.anchor = true;

    this.ctrlService.get('SessionBranchId').then(result => {
      if (result != null) {
        this.branchId = result;
      }
    });

    this.ctrlService.get('SessionSalesmanId').then(result => {
      if (result != null) {
        this.SalesId = result;
      }
    });

    this.ctrlService.get('sessionsurl').then(result => {
      if (result != null) {
        this.baseUrl = result;
        this.fnSettings();
      }
    });


    this.create_page = false;
    this.itemEnter = [];
    this.SalesOrderID = 0;
    this.SalesorderBillNo = 0;
    this.PriceSelected = "1";

    const date: Date = new Date();
    date.setDate(1);
    this.fromdate = this.DateReverse(date.toISOString());
    const dates: Date = new Date();
    this.Todate = this.DateReverse(dates.toISOString());
    
  }

  ngAfterContentInit() { }
  DateReverse(value) {
    const dateFormat = value.split("T");
    const date = dateFormat[0].split("-").reverse().join("/");
    return date;
  }

  getDateddmmyyConvert() {
    const dateget = new Date();
    const day = dateget.getDate();
    const month = dateget.getMonth() + 1;
    const year = dateget.getFullYear();
    const datenew = day + "/" + month + "/" + year;
    return datenew;
  }
 
  fnSettings() {
    
    const dictArgmts = { ProcName: "Settings_GetValues" };
    const body = JSON.stringify(dictArgmts);
    this.appService.fnApiPost(this.baseUrl + "/Master/fnSettings", body)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise()
      .then((result) => {
        const settings = result;
        settings.forEach((ele) => {
          if (ele.KeyValue === "ProductName") {
            if (ele.Value === "RetailPharma") {
            }
          } else if (ele.KeyValue === "Neethi") {
          } else if (ele.KeyValue === "Customer") {
          } else if (ele.KeyValue === "SRof") {
          } else if (ele.KeyValue === "MRPINCLUSIVESALES") {
            this.strMrpInclusiveSales = ele.Value;
          } else if (ele.KeyValue === "SaleBatch") {
          } else if (ele.KeyValue === "SaleExpiry") {
          } else if (ele.KeyValue === "PrintType") {
          } else if (ele.KeyValue === "PointSystem") {
          } else if (ele.KeyValue === "QtyDecPlace") {
          } else if (ele.KeyValue === "PaymentOption") {
          } else if (ele.KeyValue === "OfferSettings") {
          } else if (ele.KeyValue === "PackCal") {
          } else if (ele.KeyValue === "PreviousHistory") {
          } else if (ele.KeyValue === "PrintFormat") {
          } else if (ele.KeyValue === "NegativeBilling") {
          } else if (ele.KeyValue === "EditDate") {
          } else if (ele.KeyValue === "EditDays") {
          } else if (ele.KeyValue === "SalesOrderPrint") {
            this.txtPrintFileName = ele.Value;
          } else if (ele.KeyValue === "SameItemRepeatCondition") {
          } else if (ele.KeyValue === "SmsAlert") {
            this.smsAlert = ele.Value;
          } else if (ele.KeyValue === "DoctorInSales") {
          } else if (ele.KeyValue === "SalesItemCode") {
          } else if (ele.KeyValue === "SalesFifo") {
          } else if (ele.KeyValue === "WebAddress") {
          } else if (ele.KeyValue === "CFWithTax") {
          } else if (ele.KeyValue === "DecimalPlace") {
          } else if (ele.KeyValue === "OtherAmtTaxCalculation") {
          } else if (ele.KeyValue === "OtherAmtTaxCalculation") {
          } else if (ele.KeyValue === "ImageSaveFolderName") {
            this.strImageSaveFolderName = ele.Value;
          }
        });
      })
      .finally(() => {
        this.fnPriceMenuGets();
      });
  }


 
  doRefresh(event) {
    this.getData();


    setTimeout(() => {
      event.target.complete();
    }, 2000);
  }

  async onBack() {
    if (this.cartItems.length == 0) {
      this.fnClose();
      return;
    }
    const alert = await this.alertController.create({
      header: "Do you want close!",
      message: "Changes you made may<strong>not be saved.</strong>!",
      mode:"ios",
      buttons: [
        {
          text: "Stay",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {
            // console.log('Confirm Cancel: blah');
          },
        },
        {
          text: "Leave",
          handler: async () => {
            this.products = [];
            this.appService.setCartData(this.products);

            this.fnClose();
          },
        },
      ],
    });

    await alert.present();
  }

  fnClose() {
    this.SalesOrderID = 0;
    this.SalesorderBillNo = 0;
    this.create_page = false;
    this.itemEnter = [];
    this.view_name = false;
    this.ledgerAmount = 0;
    this.getData();
  }


  dateFormatReverse(date) {
    const dateFor = date.split("/").reverse().join("/");
    return dateFor;
  }

  async getData() {
    this.loading = true;
    const isFromdate = this.dateFormatReverse(this.fromdate);
    const isTodate = this.dateFormatReverse(this.Todate);

    await this.allOrderService.onGetData(isFromdate, isTodate,this.SalesId, this.baseUrl)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise()
      .then((data) => {
        this.dataGetList = JSON.parse(data);
       
        this.loading = false;
      })
      .finally(() => {
        this.loading = false;
      });
  }

  fnBillwiseOutstandingOnAcId() {
    
    this.allOrderService.onBillwiseOutstandingOnAcId(this.itemEnter[0].AC_Id, this.branchId, this.baseUrl)
    .pipe(takeUntil(this._unsubscribeAll)).toPromise()
      .then(async (data) => {
        let jsonData = JSON.parse(data);
        const modal = await this.modalController.create({
          component: OutstandingModalComponent,
          componentProps: { item: jsonData },
          mode:"ios",
          backdropDismiss: true,
        });
        return await modal.present();
      });
  }

  fnCreate() {
    this.create_page = true;
    this.remarks = "";
    this.custName = "";
    this.products = [];
    this.AmtTotal = 0;
    
    this.appService.setCartData([]);
  }



  anchorClick(item) {
    if (item.SalesOrder_Flag === "Billed") {
      this.flagAlert();
      return;
    }
    this.create_page = true;
    this.SalesOrderID = item.UniqueId;
    this.SalesorderBillNo = item.SalesOrderMain_Id;

    const varArguements = {
      BillNo: this.SalesorderBillNo,
      UniqueNo: this.SalesOrderID,
      BranchId: this.branchId,
    };

    const DictionaryObject = { dictArgmts: {} };
    DictionaryObject.dictArgmts = varArguements;

    const body = JSON.stringify(DictionaryObject);
    this.appService.fnApiPost(this.baseUrl + "/Sales/SalesOrder_CopyPrint", body)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise()
      .then(
        (data) => {
          const Datalist = data;

          const JsonOrderMainInfo = JSON.parse(Datalist.JsonOrderMainInfo);
          const JsonOrderSubInfo = JSON.parse(Datalist.JsonOrderSubInfo);
          JsonOrderMainInfo.forEach((element) => {
            this.custName = element.AC_Name;
            this.remarks = element.SalesOrder_Remarks;
            this.PriceSelected = element.SalesOrderMain_PriceMenuId;
            this.anchor = false;
            let AcId = element.AC_Id;
            this.fnGetLeadgerAmtOnAcId(AcId);
          });
          this.itemEnter = JsonOrderMainInfo;
          this.products = JsonOrderSubInfo;
          this.appService.setCartData(this.products);
          // console.log( this.products);
        },
        (error) => console.error(error)
      );
  }

  async flagAlert() {
    const alert = await this.alertController.create({
      header: "Bill",
      subHeader: "sorry",
      mode:"ios",
      message: "Cannot Edit this Invoice is Billed!",
      buttons: ["OK"],
    });
    await alert.present();
  }

  getDateConvert(value) {
    const splitDate = value.split("-");
    const year = splitDate[0];
    const month = splitDate[1];
    const tempDate = splitDate[2].split("T");
    const DateFormat = year + "/" + month + "/" + tempDate[0];
    return DateFormat;
  }

  onSave() {
    let times: any;
    times = new Date().toLocaleTimeString();

    this.ProductGet = this.cartItems;
    if (this.itemEnter.length === 0) {
      this.saveAlert();
      return;
    }
    if (this.ProductGet == null) {
      this.productAlert();
      return;
    }
    if (this.products.length === 0) {
      this.cartAlert();
      return;
    }

    const SalesOrderUniqueId = this.SalesOrderID;
    const SalesOrderBillNo = this.SalesorderBillNo;
    let AcId = 0;
    AcId = this.itemEnter[0].AC_Id;
    const Customer = this.itemEnter[0].AC_Name;

    const ListOrderItemSalesOrderInfo = [];
    const SalesOrderMainInfo = {
      AcId: 0,
      SalesOrder_From: "",
      SalesOrder_Remarks: "",
      SalesOrder_InvNo: "",
      SalesOrder_OurRef: "",
      SalesOrder_OrderNo: "",
      SalesOrderMain_CustomerName: "",
      SalesOrderMain_Id: 0,
      UniqueId: 0,
      SalesOrderMain_Total: "",
      SalesOrderMain_ATotal: "",
      SalesOrderMain_DisAmt: 0,
      SalesOrderMain_TotTaxAmt: 0,
      SalesOrderMain_DisPers: 0,
      SalesOrderMain_PriceMenuId: 0,
      SalesOrderMain_InclusiveFlag: "",
      BranchId: 0,
      SalesOrder_RepId: 0,
      ListOrderItemSalesOrderInfo: [],
      SalesOrder_Field1: "",
      ListSalesOrderDetailsInfo: [],
    };
    SalesOrderMainInfo.AcId = AcId;
    SalesOrderMainInfo.SalesOrder_From = "Rep";
    SalesOrderMainInfo.SalesOrder_Remarks = this.remarks;
    SalesOrderMainInfo.SalesOrder_InvNo = "";
    SalesOrderMainInfo.SalesOrder_OurRef = "";
    SalesOrderMainInfo.SalesOrder_OrderNo = "";
    SalesOrderMainInfo.SalesOrderMain_CustomerName = Customer;
    SalesOrderMainInfo.SalesOrderMain_Id = SalesOrderBillNo;
    SalesOrderMainInfo.UniqueId = SalesOrderUniqueId;
    SalesOrderMainInfo.SalesOrderMain_Total = this.getTotal();
    SalesOrderMainInfo.SalesOrderMain_ATotal = this.getTotal();
    SalesOrderMainInfo.SalesOrderMain_TotTaxAmt = 0;
    SalesOrderMainInfo.SalesOrderMain_DisPers = 0;
    SalesOrderMainInfo.SalesOrderMain_DisAmt = 0;
    SalesOrderMainInfo.SalesOrderMain_PriceMenuId = Number(this.PriceSelected);
    SalesOrderMainInfo.SalesOrderMain_InclusiveFlag = "False";
    SalesOrderMainInfo.BranchId = Number(this.branchId);
    SalesOrderMainInfo.SalesOrder_RepId = Number(this.SalesId);
    SalesOrderMainInfo.SalesOrder_Field1 = times;

    const ListSalesOrderDetailsInfo = [];
    // console.log(this.ProductItems);

    this.products.forEach((element) => {
      const SalesOrderDetailsInfo = {
        ProductId: 0,
        SalesOrderSub_Qty: 0,
        SalesOrderSub_FreeQty: 0,
        SalesOrderSub_SelRate: 0,
        SalesOrderSub_Amount: 0,
        SalesOrderSub_TaxPers: 0,
        SalesOrderSub_TaxAmt: 0,
        SalesOrderSub_BeforeTax: 0,
        SalesOrderSub_TaxId: 0,
        SalesOrderSub_Field3: "",
      };
      SalesOrderDetailsInfo.ProductId = element.ProductId;
      SalesOrderDetailsInfo.SalesOrderSub_Qty = Number(element.SalesOrderSub_Qty);
      SalesOrderDetailsInfo.SalesOrderSub_FreeQty = Number(element.SalesOrderSub_FreeQty);
      SalesOrderDetailsInfo.SalesOrderSub_SelRate = parseFloat(
        element.SalesOrderSub_SelRate || 0
      );
      SalesOrderDetailsInfo.SalesOrderSub_Amount = parseFloat(
        element.SalesOrderSub_Amount || 0
      );
      SalesOrderDetailsInfo.SalesOrderSub_TaxPers = parseFloat(
        element.SalesOrderSub_TaxPers || 0
      );
      SalesOrderDetailsInfo.SalesOrderSub_TaxAmt = parseFloat(
        element.SalesOrderSub_TaxAmt || 0
      );
      SalesOrderDetailsInfo.SalesOrderSub_BeforeTax = 0;
      SalesOrderDetailsInfo.SalesOrderSub_TaxId = 0;
      SalesOrderDetailsInfo.SalesOrderSub_Field3 = "";
      ListSalesOrderDetailsInfo.push(SalesOrderDetailsInfo);
    });
    SalesOrderMainInfo.ListOrderItemSalesOrderInfo = ListOrderItemSalesOrderInfo;
    SalesOrderMainInfo.ListSalesOrderDetailsInfo = ListSalesOrderDetailsInfo;
    const body = JSON.stringify(SalesOrderMainInfo);
    this.btnSave = true;
    this.appService.fnApiPost(this.baseUrl + "/Sales/SalesOrder_Insert", body)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise()
      .then(
        (data) => {
          const JsonObj = JSON.parse(data);
          this.SalesOrderID = 0;
          this.SalesorderBillNo = 0;
          this.remarks = "";
          this.btnSave = false;
          this.successAlert(JsonObj);
          this.sendSms(JsonObj);
        },
        (error) => {
          console.error(error);
          this.btnSave = false;
        }
      );
  }


  fnProductsearch(keyword) {
    return this.allOrderService.onProductsearch(keyword, this.branchId, this.baseUrl)
      .pipe(takeUntil(this._unsubscribeAll), map((product) => product));
  }



  public increment(product) {
    if (this.count[product.ProductId] < product.StockQty) {
      this.count[product.ProductId]++;
      const obj = {
        productId: product.ProductId,
        soldQuantity: this.count[product.ProductId],
        rate: product.SelRate,
      };
      this.cartUpdate = obj;
      this.subTotal[product.ProductId] =
        product.SelRate * this.count[product.ProductId];
    } else {
      // alert('You can not choose more items than available');
      this.StockAlert(product.StockQty);
      // this.snackBar.open('You can not choose more items than available. In stock ' + this.count + ' items.', '×', { panelClass: 'error', verticalPosition: 'top', duration: 3000 });
    }
  }

  public decrement(product) {
    if (this.count[product.ProductId] > 1) {
      this.count[product.ProductId]--;
      const obj = {
        productId: product.ProductId,
        soldQuantity: this.count[product.ProductId],
        rate: product.SelRate,
      };
      this.cartUpdate = obj;
      this.subTotal[product.ProductId] =
        product.SelRate * this.count[product.ProductId];
    }
  }


  async StockAlert(stock) {
    const alert = await this.alertController.create({
      message: "Avilable Stock Quantity " + stock,
      mode:"ios",
      buttons: ["OK"],
    });
    await alert.present();
  }

  

  fncustomerClick(result) {
   
    this.itemEnter = [];
    this.itemEnter = new Array(result);
    this.custName = this.itemEnter[0].AC_Name;
    this.PriceSelected = result.PriceMenuId;
    this.fnGetLeadgerAmtOnAcId(result.AC_Id);
  }
  
  fnGetLeadgerAmtOnAcId(AcId) {
    
    this.allOrderService.onGetLeadgerAmtOnAcId(AcId, this.branchId, this.baseUrl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise()
      .then((data) => {
        const jsonLedger = JSON.parse(data);
        this.ledgerAmount = jsonLedger[0].LeaderAmt;
        // this.keyparams.ledgerAmt = jsonLedger[0].LeaderAmt;
        // this.IssueInfo.LeaderAmt = jsonLedger[0].LeaderAmt;
      });
  }
  
  fnchangeprice(event) {
    this.PriceSelected = event.detail.value;
  }

  fnPriceMenuGets() {
    const ServiceParams = { strProc: "" };

    ServiceParams.strProc = "PriceMenu_Gets";
    const body = JSON.stringify(ServiceParams);
    this.appService.fnApiPost(this.baseUrl + "/CommonQuery/fnGetDataReportOnlineOrder", body)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise()
      .then((result) => {
        this.pricemenu = JSON.parse(result);
        this.PriceSelected = this.pricemenu[0].PriceMenu_Id;
      })
      .finally(() => {
        this.getData();
      });
  }



  fnProductClick(result) {
    this.ProductGet = [];
    this.ProductGet.push(result);
    // this.myQty.setFocus();
  }
  tblIndex = null;
  onEditClick(product, index) {
    this.tblIndex = index;
    this.cartEditAlert(product);
  }

  onRemoveCart(product) {
    const index: number = this.cartItems.indexOf(product);
    if (index !== -1) {
      this.cartItems.splice(index, 1);
    }
    this.appService.setCartData(this.cartItems);

  }

  async cartEditAlert(product) {

    this.ProductGet = [];
    this.ProductGet.push(product);
    const alert = await this.alertController.create({
      header: "product update",
      subHeader: product.ItemDesc,
      mode:"ios",
      inputs: [
        {
          label: "Rate",
          name: "rate",
          id: "rate-id",
          type: "number",
          value: product.SalesOrderSub_SelRate,
        },
        {
          label: "Quantity",
          name: "quantity",
          id: "quantity-ids",
          type: "number",
          value: product.SalesOrderSub_Qty,
        },
        {
          label: "Free",
          name: "free",
          id: "free-ids",
          type: "number",
          value: product.SalesOrderSub_FreeQty,
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: (data) => {
            // this.dismiss(data, product);
          },
        },
        {
          text: "update",
          handler: (data) => {
            // this.products.shift().SalesOrderSub_SelRate;
            // SalesOrderSub_Qty
            this.onAddcart(data.quantity, data.rate, data.free);
          },
        },
      ],
      backdropDismiss: false,
    });
    await alert.present().then(() => {
      const firstInput: any = document.querySelector("ion-alert #rate-id");
      firstInput.focus();
      firstInput.select();
      firstInput.before("Rate");

      const secondInput: any = document.querySelector("ion-alert #quantity-ids");
      secondInput.before("Quantity");

      const thirdInput: any = document.querySelector("ion-alert #free-ids");
      thirdInput.before("Free");

      return;
    });
  }

  fnCartValidate(item, qty, rate, free) {
       let duplicate = this.cartItems.find((x) => x.ProductId == item.ProductId);
    if (duplicate) {
      this.replaceOrAdd(item, duplicate, qty, rate, free);
      return;
    }
    this.onAddcart(qty, rate, free);
  }

  async replaceOrAdd(value, item, qty, rate, free) {
    const alert = await this.alertController.create({
      header: `${item.ItemDesc}-Already Exit!`,
      mode:"ios",
      message: `Quantity - ${item.SalesOrderSub_Qty} free - ${item.SalesOrderSub_FreeQty}`,
      inputs: [
        {
          label: "New Quantity",
          name: "quantity",
          id: "replace-qty",
          value: qty,
        },

        {
          label: "New Free",
          name: "free",
          id: "replace-free",
          value: free,
        },


      ],
      buttons: [
        {
          text: "Add New",
          role: "cancel",
          cssClass: "secondary",
          handler: (blah) => {
            this.products.push({
              ProductId: item.ProductId,
              SelRate: item.SelRate,
              SalesOrderSub_TaxPers: item.SalesOrderSub_TaxPers,
              MRP: item.MRP,
              TaxOn: item.TaxOn,
              ItemDesc: item.ItemDesc,
              SalesOrderSub_Qty: qty,
              SalesOrderSub_FreeQty: free,
              SalesOrderSub_SelRate: item.SalesOrderSub_SelRate,
              SalesOrderSub_TaxAmt: item.SalesOrderSub_TaxAmt,
              SalesOrderSub_Amount: item.SalesOrderSub_Amount,
              ImageLoc: item.ImageLoc,
            });

            this.save_button = true;
            this.appService.setCartData(this.products);

          },
        },
        {
          text: "Replace",
          handler: async (res) => {
            this.onRemove(value);
            this.onAddcart(res.quantity, rate, free);
          },
        },
      ],
    });

    await alert.present().then(() => {
      const firstInput: any = document.querySelector("ion-alert #replace-qty");
      firstInput.focus();
      firstInput.before("Quantity");

      const secInput: any = document.querySelector("ion-alert #replace-free");
      secInput.before("Free");


    });
  }

  async productAlert() {
    const alert = await this.alertController.create({
      header: "Stock",
      message: "Product Empty Stock !",
      mode:"ios",
      buttons: ["OK"],
    });
    await alert.present();
  }
  async cartAlert() {
    const alert = await this.alertController.create({
      header: "Cart",
      message: "Please Add item!",
      mode:"ios",
      buttons: ["OK"],
    });
    await alert.present();
  }

  async saveAlert() {
    const alert = await this.alertController.create({
      header: "Customer Name",
      message: "Please valid customer !",
      mode:"ios",
      buttons: ["OK"],
    });
    await alert.present();
  }

  async successAlert(no) {
    const alert = await this.alertController.create({
      header: "Order No",
      subHeader: no,
      message: "Saved Successfully!",
      mode:"ios",
      buttons: [
        {
          text: "OK",
          handler: () => {
            this.products = [];
            this.appService.setCartData(this.products);

            this.txtproduct = "";
            this.quantity = "";
            this.itemEnter = [];
            setTimeout(() => {
              this.custName = "";
            }, 100);
          },
        },
      ],
      backdropDismiss: false,
    });
    await alert.present();
  }

  fnUpdateCart(Qty, Rate, free, data) {
    let amount = [];
    const check = true;
    let TaxPers = 0;

    const index: number = this.products.indexOf(data);
    // console.log(this.products);
    const ListProducts = [];
    for (let i = 0; i < this.products.length; i++) {
      if (this.products[i].SalesOrderSub_TaxPers) {
        TaxPers = this.products[i].SalesOrderSub_TaxPers;
      } else if (this.products[i].TaxPercent) {
        TaxPers = this.products[i].TaxPercent;
      }
      let productJson = {};
      if (i === index) {
        amount = this.getAmountcalculation(this.products[i], Qty, free, Rate, TaxPers);
        productJson = {
          ProductId: this.products[i].ProductId,
          SelRate: Rate,
          SalesOrderSub_TaxPers: TaxPers,
          MRP: this.products[i].MRP,
          TaxOn: this.products[i].TaxOn,
          ItemDesc: this.products[i].ItemDesc,
          SalesOrderSub_Qty: Qty,
          SalesOrderSub_FreeQty: free,
          SalesOrderSub_SelRate: Rate,
          SalesOrderSub_TaxAmt: amount[1],
          SalesOrderSub_Amount: amount[0],
          ImageLoc: this.products[i].ImageLoc,
        };
      } else {
        productJson = this.products[i];
      }
      ListProducts.push(productJson);
    }
    this.products = ListProducts;
    this.tblIndex = null;
  }

  onAddcart(Qty, Rate, free) {
    if (this.ProductGet == null) {
      this.productAlert();
      return;
    }

    let amount = [];
    let check = true;
    let TaxPers = 0;

    if (Qty) {
      this.ProductGet.forEach((res, index) => {
        if (res.SalesOrderSub_TaxPers) {
          TaxPers = res.SalesOrderSub_TaxPers;
        } else if (res.TaxPercent) {
          TaxPers = res.TaxPercent;
        }

        let prodItem = this.products.find((x) => x.ProductId == res.ProductId);

        if (prodItem) {
          this.fnUpdateCart(Qty, Rate, free, this.products[this.tblIndex]);
          check = false;
        }

        if (check) {
          amount = this.getAmountcalculation(res, Qty, free, Rate, TaxPers);
          this.products.push({
            ProductId: res.ProductId,
            SelRate: res.SelRate,
            SalesOrderSub_TaxPers: TaxPers,
            MRP: res.MRP,
            TaxOn: res.TaxOn,
            ItemDesc: res.ItemDesc,
            SalesOrderSub_Qty: Qty,
            SalesOrderSub_FreeQty: free,
            SalesOrderSub_SelRate: Rate,
            SalesOrderSub_TaxAmt: amount[1],
            SalesOrderSub_Amount: amount[0],
            ImageLoc: res.ImageLoc,
          });
        }
      });
      this.save_button = true;

      this.appService.setCartData(this.products);

    }
  }

  getAmountcalculation(data, dQty, free, dOriginalRate, TaxPers) {
    let dRate = dOriginalRate;
    const dTax = TaxPers;
    const dMRP = data.MRP;
    let dTaxAmt = 0;
    let dAmount = 0;
    let totQty = dQty;
    const strTaxOn = data.TaxOn;

    if (this.strMrpInclusiveSales === "Yes") {
      if (strTaxOn === "MRP Inclusive") {
        dRate = dOriginalRate - (dMRP * dTax) / (100 + dTax);
      } else {
        dRate = dOriginalRate - (dOriginalRate * dTax) / (100 + dTax);
      }
    }

    if (strTaxOn === "MRP Inclusive") {
      dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
      dTaxAmt = totQty * ((dMRP * dTax) / (100 + dTax));
    } else {
      dTaxAmt = 1 * ((dRate * dTax) / 100);
      dTaxAmt = totQty * ((dRate * dTax) / 100);
    }

    dAmount = dRate * totQty + dTaxAmt;

    return [dAmount, dTaxAmt];
  }

  getTotal() {
    // this.AmtTotal = this.AmtTotal + amount;
    return this.products
      .map((t) => t.SalesOrderSub_Amount)
      .reduce((acc, value) => parseFloat(acc || 0) + parseFloat(value || 0), 0);
  }

  getQtyTotal() {
    return this.products
      .map((t) => t.SalesOrderSub_Qty)
      .reduce((acc, value) => parseFloat(acc || 0) + parseFloat(value || 0), 0);
  }
  getFreeQtyTotal() {
    return this.products.map((t) => t.SalesOrderSub_FreeQty)
      .reduce((acc, value) => parseFloat(acc || 0) + parseFloat(value || 0), 0);
  }

  onRemove(product) {
    const index: number = this.products.indexOf(product);
    if (index !== -1) {
      this.products.splice(index, 1);
    }
    this.appService.setCartData(this.products);
  }

  onView() {
    this.presentModal();
  }

  dateFormat(date) {
    let days = date.getDate();
    let Month = date.getMonth() + 1;
    const Years = date.getFullYear();

    if (days <= 9) {
      days = `0${days}`;
    }
    if (Month <= 9) {
      Month = `0${Month}`;
    }
    const dateFormat = `${days}/${Month}/${Years}`;
    return dateFormat;
  }
  
  async calenderPicker(val) {
    if (val === "from") {
      this.ctrlService.onDatePicker(this.fromdate, val)
        .then(
          (date) => {
            this.fromdate = this.dateFormat(date);
            this.getData();
          },
          (err) => console.error("Error occurred while getting date: ", err)
        );
    } else {
      this.ctrlService.onDatePicker(this.Todate, val)
        .then(
          (date) => {
            this.Todate = this.dateFormat(date);
            this.getData();
          },
          (err) => console.error("Error occurred while getting date: ", err)
        );
    }
  }

  async openProductMadal() {
    const modal = await this.modalController.create({
      component: ProductModalComponent,
      // mode:"ios",
      cssClass: 'product-modal-full',
      componentProps: {
        priceId: this.PriceSelected,
        imgFolder: this.strImageSaveFolderName

      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (!data) {
      return
    }
    let cartData = data.cartitem;
    if (cartData && cartData.length)
      cartData.map(x => {
        this.ProductGet = [];
        this.ProductGet.push(x.product);
        this.fnCartValidate(x.product, x.qty, x.price, x.free);
      });
    
}

  async presentModal() {
    const name = this.itemEnter[0].AC_Name;
    const Addr1 = this.itemEnter[0].Addr1;
    const Addr2 = this.itemEnter[0].Addr2;
    const Addr3 = this.itemEnter[0].Addr3;
    const Phone = this.itemEnter[0].Phone;
    const Mobile = this.itemEnter[0].Mobile;
    const Email = this.itemEnter[0].Email;

    const modal = await this.modalController.create({
      component: ModalPage,
      mode:"ios",
      componentProps: {
        name: name,
        Addr1: Addr1,
        Addr2: Addr2,
        Addr3: Addr3,
        Phone: Phone,
        Mobile: Mobile,
        Email: Email,
      },
    });
    return await modal.present();
  }



  async sendSms(message) {
    const phone = this.itemEnter[0].Phone;
    const sms = `Thank you for shopping order no:${message} generated..`;
    const regExp = /^[0-9]{10}$/;
    if (!regExp.test(phone)) {
      console.log("yes");
      // alert('Invalid MobileNo');
      return;
    }
    if (this.smsAlert === "Yes") {
      const modal = await this.modalController.create({
        component: SmspopupModalComponent,
        mode:"ios",
        componentProps: {
          phoneNo: phone,
          sms: sms,
          id: this.SalesId,
          branchid: this.branchId,
        },
      });
      return await modal.present();
    }
  }

  printExternal(item) {

    const PrintFileName = this.txtPrintFileName;
    const SalesOrderUniqueId = item.UniqueId;
    const SalesOrderBillNo = item.SalesOrderMain_Id;
    const branchId = String(this.branchId)
    // sessionStorage.setItem("SalesOrderUniqueNo", SalesOrderUniqueId);
    // sessionStorage.setItem("SalesOrderBillNo", SalesOrderBillNo);
    // window.open("#/" + PrintFileName, "_blank");
    const url = new URL(this.baseUrl);
    const connect = `${url.origin}/#/${PrintFileName}`;
    let option: InAppBrowserOptions = {
      EnableViewPortScale: 'yes',
      clearcache: 'yes',
      clearsessioncache: 'yes',
      location: 'yes',
      beforeload: 'yes',

    }

    const browser: InAppBrowserObject = this.iab.create(connect, '_blank', option);

    browser.on('loadstart').subscribe((event) => {
      browser.executeScript({
        code: `sessionStorage.setItem('SalesOrderUniqueNo', ${SalesOrderUniqueId});
      sessionStorage.setItem('SalesOrderBillNo', ${SalesOrderBillNo});
      sessionStorage.setItem('SessionLoginBranchId', ${branchId});
      sessionStorage.setItem('SessionBranchName', '');
      `
      });


    });

    browser.on('loadstop').subscribe(event => {
      browser.executeScript({
        code: `(function() { 
          var body = document.querySelector('body');
           var button = document.createElement('div');
            button.innerHTML = 'Done';
             button.classList.add('youtube_done_button');
              button.onclick = function() {
                localStorage.setItem('close', 'true'); 
              };
               body.appendChild(button); 
              });
               ()`
      });
      browser.insertCSS({
        code: `.youtube_done_button { 
          position: fixed; bottom: 0;
           width: 100%; background: rgba(0, 0, 0, 0.8);
            color: #2196F3; padding: 10px; font-size: 20px;
          }`
      });
    });
  }
  
 

  async onAddCustomer() {
    const modal = await this.modalController.create({
      component: AddCustomerComponent,
      componentProps: {
        searchtype: 'salesman'
      },
      cssClass: 'my-custom-class'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {      
      this.fncustomerClick(data)
    }
  }
  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
