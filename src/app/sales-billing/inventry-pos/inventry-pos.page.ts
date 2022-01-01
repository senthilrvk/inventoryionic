import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { BarcodeScanner, BarcodeScannerOptions } from '@ionic-native/barcode-scanner/ngx';
import { ModalController, PopoverController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { SalesPageService } from 'src/app/sales-billing/sales-page.service';
import { AddCustomerComponent } from 'src/app/dialogue/add-customer/add-customer.component';
import { InventryListComponent } from 'src/app/dialogue/inventry-list/inventry-list.component';
import { InventryPaymentComponent } from 'src/app/dialogue/inventry-payment/inventry-payment.component';
import { ModalhistoryComponent } from '../orderinventory/modalhistory/modalhistory.component';

@Component({
  selector: 'app-inventry-pos',
  templateUrl: './inventry-pos.page.html',
  styleUrls: ['./inventry-pos.page.scss'],
})
export class InventryPosPage implements OnInit {
  focusIndexed = 0;
  editFlag = false;
  staffId: string;
  branchId: string;
  apiUrl: string;
  billSeriesData: any = [];
  todays: any = new Date();
  @ViewChild('Divmain', { static: false }) Divmain: ElementRef;
  @ViewChild('DivButton', { static: false }) DivButton: ElementRef;

  private _unsubscribeAll: Subject<any>;
  issueInfo = {
    'Issue_DisPers': 0, 'Issue_DisAmt': 0, 'Issue_RepAmt': 0, 'Issue_Type': 'LOCAL', 'Issue_OtherCharge': 0,
    'Issue_RetValue': 0, 'Issue_PointSaleValue': 0, 'Issue_Freight': 0, 'Issue_CrAmt': 0, 'Issue_ExpiryAmt': 0,
    'Issue_ROF': 0, 'Issue_Total': 0, 'Issue_ATotal': 0, 'AgentSalesVaue': 0, 'Issue_VechileNo': '',
    'Issue_OtherTaxPers': 0, 'Issue_CourierTaxPers': 0, 'BillSerId': 0, 'AgentPers': 0, 'AgentMarginAmt': 0,
    'Issue_SlNo': 0, 'UniqueBillNo': 0, 'SalesExeId': 0, 'Issue_OrderNo': '', 'Issue_OrderDate': this.todays,
    'Issue_BillDate': this.todays, 'Issue_CardExpDate': this.todays, 'AcId': 0, 'Issue_CustName': '', 'Remarks': '',
    'Issue_PayTerms': 'CASH', 'Issue_SaleType': 0, 'Issue_AddCessFlag': false, BranchId: 0, StaffId: 0,
    DirectRBank: '', 'Issue_TCSPers': 0, 'Issue_TCSAmt': 0, ListIssueSubDetailsInfo: [], DictionaryObject: {}, ListIssueTaxInfo: {}
    ,
    billNo: 0
  }

  issueSub = {
    ItemCode: '', ItemDesc: '', Store_BatchSlNo: '', IssueSub_Batch: '', IssueSub_Pack: '',
    IssueSub_ExpDate: '', IssueSub_PurRate: '', IssueSub_PerRate: 0, IssueSub_OriginalRate: '0', IssueSub_Mrp: 0, IssueSub_Qty: '1', IssueSub_FreeQty: 0,
    IssueSub_Amount: 0, IssueSub_TaxPers: 0, IssueSub_TaxAmt: 0, IssueSub_PdodDis: '0', IssueSub_TaxOn: '', IssueSub_TaxOnFree: '',
    IssueSub_GroupName: '', ProductId: '', TaxId: 0, IssueSub_ProdDisAmt: 0, IssueSub_ActualTaxPers: 0, IssueSub_Type: '',
    IssueSub_SGSTTaxPers: '', IssueSub_CGSTTaxPers: '', IssueSub_IGSTTaxPers: '', Field2: '', IssueSub_AddDisPers: 0, AgentPrice: 0,
    Agent_SubAmount: 0, IssueSub_SpRate1: 0, IssueSub_SpRate2: 0, IssueSub_SpRate3: 0, IssueSub_SpRate4: 0, IssueSub_SpRate5: 0,
    IssueSub_RQty: 0, IssueSub_CessPers: 0, IssueSub_CessAmt: 0, BranchId: '', AvilableQTY: 0,
    IssueSub_DistRate: 0, IssueSub_ExtraCessPers: 0, IssueSub_ExtraCessAmt: 0, IssueSub_NoField1: 0,
  }
  codeFlag: boolean;
  qtyFlag: boolean;
  loading: boolean;
  listProducts: any[] = [];
  scanCancel: boolean = true;
  options: BarcodeScannerOptions;
  settings = {
    Softwarename: '', AddOrMinus: '', CustomerForSoftware: '', SRof: '', MrpInclusiveSales: '',
    SettingBatch: '', SettingExpiry: '', ImageSave: '', strInvoiceSmsFormat: '', QtyDecPlace: '',
    PackCal: '', NegativeBilling: '', EditDate: '', smsAlert: '', bTCSInSales: false,
    strCFWithTax: '', RateDecimalPlace: 0, OtherAmtTaxCalculation: '', bCessInclusiveInSales: false,
    bAgentCommisionCalcOnMarginPers: '', bAdditionalCessInclusiveInSales: false,
    bCustomerBillSeriesLinkInSales: false, bSalesBarCodeWgtCondition: false,
  };
  Pricejson: any;
  isItemCode: boolean = false;
  public mainHeight: number = 400;
  public storage = new Storage()

  constructor(
    private modalController: ModalController,
    private toastControl: ToastController,
    private salesService: SalesPageService,
    private barcodeScanner: BarcodeScanner,
    private popoverController: PopoverController,
    ) {
      this.storage.create();
    this.storage.forEach((value, key) => {
      if (key == 'sessionInvenStaffId') {
        this.staffId = value;
      } else if (key == 'sessionInvenBranchId') {
        this.branchId = value;
      } else if (key == 'sessionsurl') {
        this.apiUrl = value;
      }

    }).finally(() => {
      this.fnSettings();
      this.issueSub.BranchId = this.branchId;
    })
  }

  ngOnInit() {
    const today = new Date();
    this.todays = this.dateFormat(today);
    this._unsubscribeAll = new Subject();
    this.issueInfo.Issue_OrderDate = this.todays;
    this.issueInfo.Issue_BillDate = this.todays;
    this.issueInfo.Issue_CardExpDate = this.todays;
    this.issueSub.ItemCode = ''
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.mainHeight = this.Divmain.nativeElement.offsetHeight - (this.DivButton.nativeElement.offsetHeight + 40)
    });
  }
  fnSettings() {
    this.salesService.onSettings(this.apiUrl)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(result => {
        const settings = result;
        settings.forEach(ele => {

          if (ele.KeyValue === 'ProductName') {
            this.settings.Softwarename = ele.Value;
          } else if (ele.KeyValue === 'Neethi') {
            this.settings.AddOrMinus = ele.Value;
          } else if (ele.KeyValue === 'Customer') {
            this.settings.CustomerForSoftware = ele.Value;
          } else if (ele.KeyValue === 'SRof') {
            this.settings.SRof = ele.Value;
          } else if (ele.KeyValue === 'MRPINCLUSIVESALES') {
            this.settings.MrpInclusiveSales = ele.Value;
          } else if (ele.KeyValue === 'SaleBatch') {
            this.settings.SettingBatch = ele.Value;
          } else if (ele.KeyValue === 'SaleExpiry') {
            this.settings.SettingExpiry = ele.Value;
          } else if (ele.KeyValue === 'ImageSave') {
            this.settings.ImageSave = ele.Value;
          } else if (ele.KeyValue === 'InviceSmsFormat') {
            this.settings.strInvoiceSmsFormat = ele.Value;
          } else if (ele.KeyValue === 'QtyDecPlace') {
            this.settings.QtyDecPlace = ele.Value;
          } else if (ele.KeyValue === 'PackCal') {
            this.settings.PackCal = ele.Value;
          } else if (ele.KeyValue === 'NegativeBilling') {
            this.settings.NegativeBilling = ele.Value;
          } else if (ele.KeyValue === 'EditDate') {
            this.settings.EditDate = ele.Value;
          } else if (ele.KeyValue === 'InvoiceSms') {
            this.settings.smsAlert = ele.Value;
          } else if (ele.KeyValue === 'TCSInSales') {
            if (ele.Value == "Yes")
              this.settings.bTCSInSales = true;
          } else if (ele.KeyValue === 'CFWithTax') {
            this.settings.strCFWithTax = ele.Value;
          } else if (ele.KeyValue === 'DecimalPlace') {
            this.settings.RateDecimalPlace = ele.Value;
            if (this.settings.RateDecimalPlace !== 3) {
              this.settings.RateDecimalPlace = 2;
            }
          } else if (ele.KeyValue === 'OtherAmtTaxCalculation') {
            this.settings.OtherAmtTaxCalculation = ele.Value;
          } else if (ele.KeyValue === 'CessInclusiveInSales') {
            if (ele.Value === 'Yes') {
              this.settings.bCessInclusiveInSales = true;
            }
          } else if (ele.KeyValue === 'AgentCommisionCalcOnMarginPers') {
            if (ele.Value === 'Yes') {
              this.settings.bAgentCommisionCalcOnMarginPers = 'Yes';
            }
          } else if (ele.KeyValue === 'AdditionalCessInclusiveInSales') {
            if (ele.Value === 'Yes') {
              this.settings.bAdditionalCessInclusiveInSales = true;
            }
          } else if (ele.KeyValue == 'CustomerBillSeriesLinkInSales') {
            if (ele.Value == "Yes") {
              this.settings.bCustomerBillSeriesLinkInSales = true;
            }
          } else if (ele.KeyValue == 'SalesBarCodeWgtCondition') {
            if (ele.Value == "Yes") {
              this.settings.bSalesBarCodeWgtCondition = true;
            }
          }

        });
        this.fnBillSeries_Gets()
      });
  }

  fnPriceMenuGets() {
    this.salesService.onPriceMenuGets(this.apiUrl)
      .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        this.Pricejson = JSON.parse(data);
        this.issueInfo.Issue_SaleType = this.Pricejson[0].PriceMenu_Id;
        this.getBillNumber()
        // this.IssueInfo.Issue_SaleType = String(this.PriceSelected);
      });
  }

  getBillNumber() {
    this.salesService.onGetMaxBillNo(this.issueInfo.BillSerId, this.branchId, this.apiUrl)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.issueInfo.billNo = res;

      })
  }

  onKeyboard(eve) {

    if (eve == 'backspace') {
      this.onBackSpace();
      return
    }
    if (eve == '+') {
      this.onIncrease();
      return
    }

    if (this.focusIndexed == 0) {
      this.issueSub.ItemCode += eve;
      this.codeFlag = true;
    } else if (this.focusIndexed == 1) {
      if (!this.qtyFlag) {
        this.issueSub.IssueSub_Qty = eve;
        this.qtyFlag = true;
        this.rowTotal();
        return
      }
      this.issueSub.IssueSub_Qty += eve;
      this.rowTotal();
    } else if (this.focusIndexed == 2) {
      if (this.issueSub.IssueSub_PdodDis == '0') {
        this.issueSub.IssueSub_PdodDis = eve;
        this.rowTotal();
        return
      }

      this.issueSub.IssueSub_PdodDis += eve;
      this.rowTotal();
    }
  }

  onIncrease() {
    if (this.focusIndexed == 1) {
      this.qtyFlag = true;
      let oldnumber = this.issueSub.IssueSub_Qty ? parseFloat(this.issueSub.IssueSub_Qty) : 0;
      this.issueSub.IssueSub_Qty = (oldnumber + 1).toString();
      this.rowTotal();
    } else if (this.focusIndexed == 2) {
      let oldnumber = this.issueSub.IssueSub_PdodDis ? parseFloat(this.issueSub.IssueSub_PdodDis) : 0;
      this.issueSub.IssueSub_PdodDis = (oldnumber + 1).toString();
      this.rowTotal();
    }
  }

  onBackSpace() {
    if (this.focusIndexed == 0) {
      const editedText = this.issueSub.ItemCode.slice(0, -1);
      this.issueSub.ItemCode = editedText;
      this.codeFlag = true;
    } else if (this.focusIndexed == 1) {
      const editedText = this.issueSub.IssueSub_Qty.slice(0, -1);
      this.issueSub.IssueSub_Qty = editedText;
      this.rowTotal();
    } else if (this.focusIndexed == 2) {
      const editedText = this.issueSub.IssueSub_PdodDis.slice(0, -1);
      this.issueSub.IssueSub_PdodDis = editedText;
      this.rowTotal();
    }
  }

  rowTotal() {

    let qty: any = this.issueSub.IssueSub_Qty;
    let rate: any = this.issueSub.IssueSub_OriginalRate;
    let disc: any = this.issueSub.IssueSub_PdodDis;
    let taxpers: any = this.issueSub.IssueSub_TaxPers;
    let dTotal: any = parseFloat(qty || 0) * parseFloat(rate || 0);
    let dTaxPers = parseFloat(taxpers || 0);
    let dTaxAmt = 0;

    if (this.settings.MrpInclusiveSales === 'No' && this.settings.Softwarename != 'RetailPharma') {
      dTaxAmt = (dTotal * dTaxPers) / 100;
    }
    let dAmount = dTotal + dTaxAmt;
    dAmount = dAmount - parseFloat(disc || 0);
    this.issueSub.IssueSub_Amount = dAmount.toFixed(2);

  }

  onAddRow() {


    if (this.focusIndexed == 0 && this.scanCancel) {
      this.loading = true;

      if (this.isItemCode) {
        this.fnProductCodeGet().then(res => {
          this.qtyFlag = false;
          this.focusIndexed = 1;
          if (this.scanner)
            this.scan();
        });
      } else {
        this.onBarcodeScan().then(res => {
          this.onGetBarcode();
          if (this.scanner)
            this.scan();
        }).catch((err) => {
          this.onGetBarcode();
        })
      }

    } else this.onrowValidAdd();

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

  onrowValidAdd() {



    if (!this.issueSub.ItemCode || !this.issueSub.ItemDesc) {
      this.toastAlert('Enter Product Code !!');
      return
    }

    if (nConvert(this.issueSub.AvilableQTY) < nConvert(this.issueSub.IssueSub_Qty)) {

      this.toastAlert(`Avilable Stock - ${this.issueSub.AvilableQTY} !!`);
      this.issueSub.IssueSub_Qty = '1';
      return
    }

    this.issueSub.IssueSub_Qty = nConvert(this.issueSub.IssueSub_Qty);
    this.issueSub.IssueSub_PdodDis = nConvert(this.issueSub.IssueSub_PdodDis)
    if (!this.issueSub.IssueSub_Qty || this.issueSub.IssueSub_Qty == '0') {
      this.toastAlert('Enter Valid Quantity !!');
      return
    }
    if (!this.issueSub.IssueSub_OriginalRate || this.issueSub.IssueSub_OriginalRate == '0') {
      this.toastAlert('Product Rate is zero !!');
      return
    }
    if (this.editFlag) {
      this.onClear();
      return
    }

    let flagReplace = true;

    let oldQty = 0;

    this.listProducts.map(x => {
      if (x.ProductId == this.issueSub.ProductId && x.Store_BatchSlNo == this.issueSub.Store_BatchSlNo) {
        oldQty = parseFloat(x.IssueSub_Qty || 0);
        let oldRate = parseFloat(x.IssueSub_OriginalRate || 0)
        x.IssueSub_Qty = oldQty + parseFloat(this.issueSub.IssueSub_Qty);
        x.IssueSub_Amount = (x.IssueSub_Qty * oldRate).toFixed(2);
        flagReplace = false
      }
    });


    if (!flagReplace && (nConvert(this.issueSub.AvilableQTY) - nConvert(oldQty)) < nConvert(this.issueSub.IssueSub_Qty)) {
      this.toastAlert(`Avilable Stock - ${this.issueSub.AvilableQTY} !!`);
      this.listProducts.map(x => {
        if (x.ProductId == this.issueSub.ProductId && x.Store_BatchSlNo == this.issueSub.Store_BatchSlNo) {
          let oldRate = parseFloat(x.IssueSub_OriginalRate || 0)
          x.IssueSub_Qty = oldQty;
          x.IssueSub_Amount = (x.IssueSub_Qty * oldRate).toFixed(2);
        }
      });
      this.onClear();
      return
    }

    if (flagReplace) {
      this.listProducts.push(this.onAddItem(this.listProducts.length));
    }
    // this.listProducts.sort(sortByProperty('id')); //sort according to pId 
    if (this.scanner)
      this.scan();

    this.onClear();
  }

  onAddItem(id) {

    return this.issueSub;
  }

  onSelectionChange(index: number) {
    this.focusIndexed = index;
    if (this.codeFlag) {
      this.loading = true;
      if (this.isItemCode) {
        this.fnProductCodeGet();
      } else {
        this.onBarcodeScan().then(res => {
          this.onGetBarcode();
        }).catch((err) => {
          this.onGetBarcode();
        })
        // this.fnProductCodeGet();
      }
    }
    this.codeFlag = false;

  }

  onClear() {

    this.issueSub = {
      ItemCode: '', ItemDesc: '', Store_BatchSlNo: '', IssueSub_Batch: '', IssueSub_Pack: '',
      IssueSub_ExpDate: '', IssueSub_PurRate: '', IssueSub_PerRate: 0, IssueSub_OriginalRate: '0', IssueSub_Mrp: 0,
      IssueSub_Qty: '1', IssueSub_FreeQty: 0,
      IssueSub_Amount: 0, IssueSub_TaxPers: 0, IssueSub_TaxAmt: 0, IssueSub_PdodDis: '', IssueSub_TaxOn: '', IssueSub_TaxOnFree: '',
      IssueSub_GroupName: '', ProductId: '', TaxId: 0, IssueSub_ProdDisAmt: 0, IssueSub_ActualTaxPers: 0, IssueSub_Type: '',
      IssueSub_SGSTTaxPers: '', IssueSub_CGSTTaxPers: '', IssueSub_IGSTTaxPers: '', Field2: '', IssueSub_AddDisPers: 0, AgentPrice: 0,
      Agent_SubAmount: 0, IssueSub_SpRate1: 0, IssueSub_SpRate2: 0, IssueSub_SpRate3: 0, IssueSub_SpRate4: 0, IssueSub_SpRate5: 0,
      IssueSub_RQty: 0, IssueSub_CessPers: 0, IssueSub_CessAmt: 0, BranchId: '', AvilableQTY: 0,
      IssueSub_DistRate: 0, IssueSub_ExtraCessPers: 0, IssueSub_ExtraCessAmt: 0, IssueSub_NoField1: 0,

    }
    this.scanCancel = true;
    this.editFlag = false;
    this.focusIndexed = 0;
  }

  onDelete() {
    let index = this.listProducts.indexOf(this.issueSub);
    this.listProducts.splice(index, 1);
    this.onClear();
  }

  DateRetExpiryFormat(value) {
    const BillDate = value;
    const BillDate1 = BillDate.split('-');
    const Dates = BillDate1[1] + '/' + BillDate1[0];
    return Dates;
  }

  fnBillSeries_Gets() {
    this.salesService.onBillSeriesGets(this.staffId, this.branchId, this.apiUrl)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.billSeriesData = JSON.parse(res);
        if (this.billSeriesData.length) {
          this.issueInfo.BillSerId = this.billSeriesData[0].BillSerId;
        }
        this.fnPriceMenuGets();
      })
  }

  fnProductCodeGet() {
    let promise = new Promise((resolve, reject) => {
      this.salesService.onProductCodeGet(this.issueSub.ItemCode, this.staffId,
        this.branchId, this.issueInfo.BillSerId, this.apiUrl)
        .pipe(takeUntil(this._unsubscribeAll))
        .toPromise()
        .then(data => {
          const dataJson = JSON.parse(data);

          if (dataJson.length) {
            const dataItems = dataJson.find(x => parseFloat(x.StockQty || 0) > 0);

            if (!dataItems) {
              this.toastAlert('Invalid stock..');
              return;
            }
            if (parseFloat(dataItems.StockQty || 0) == 0) {
              this.loading = false;
              this.issueSub.ItemCode = '';
              this.focusIndexed = 0;
              this.toastAlert('Invalid stock..');
              return;
            }

            if (this.issueSub.ItemCode == dataItems.ItemCode) {
              this.salesService.onProductKeyDown(dataItems.ProductId, this.branchId, this.apiUrl)
                .toPromise()
                .then(res => {
                  const dataHistory = res;
                  if (dataHistory.length == 0) {
                    this.toastAlert('Stock insufficient.');
                    this.issueSub.ItemCode = '';
                    this.focusIndexed = 0;
                    this.loading = false;
                    return;
                  }
                  if (dataHistory.length == 1) {
                    let storeData = dataHistory[0];
                    this.issueSub.ItemCode = dataItems.ItemCode;
                    this.issueSub.ItemDesc = dataItems.ItemDesc;
                    let priceMenu = Number(this.issueInfo.Issue_SaleType);
                    let price: any = this.salesService.onPricemenuRate(priceMenu, storeData);
                    this.issueSub.IssueSub_OriginalRate = price;
                    // this.issueSub.SelRate = storeData.Store_SellRate;

                    this.issueSub.IssueSub_ExpDate = storeData.Store_ExpDate;
                    this.issueSub.IssueSub_Mrp = storeData.Store_MRP;
                    this.issueSub.AvilableQTY = storeData.Store_BalQty;
                    this.issueSub.IssueSub_TaxPers = storeData.Store_ProdTaxPers;
                    this.issueSub.IssueSub_SGSTTaxPers = storeData.Store_SGSTTaxPers;
                    this.issueSub.IssueSub_IGSTTaxPers = storeData.Store_IGSTTaxPers;
                    this.issueSub.IssueSub_CGSTTaxPers = storeData.Store_CGSTTaxPers;
                    this.issueSub.IssueSub_DistRate = storeData.Store_DisributRate;
                    this.issueSub.IssueSub_TaxOn = storeData.Store_TaxOn;
                    this.issueSub.Store_BatchSlNo = storeData.Store_BatchSlNo;
                    // this.issueSub.LandingCost = storeData.LandingCost
                    this.issueSub.IssueSub_Type = storeData.ReceiptMain_Type
                    // this.issueSub.pr = storeData.MultiPricing
                    this.issueSub.IssueSub_CessPers = dataItems.CessPers;
                    this.issueSub.ProductId = dataItems.ProductId;
                    // this.issueSub.TaxId = dataItems.TaxGroupId;
                    this.issueSub.TaxId = dataItems.TaxID;
                    this.issueSub.IssueSub_GroupName = dataItems.TaxName;
                    this.issueSub.IssueSub_PurRate = dataItems.PurRate;

                    this.issueSub.IssueSub_Qty = nConvert(this.issueSub.IssueSub_Qty);
                    this.issueSub.IssueSub_PdodDis = nConvert(this.issueSub.IssueSub_PdodDis)
                    this.issueSub.BranchId = <any>Number(this.branchId)

                    this.rowTotal();
                    this.qtyFlag = false;
                    this.loading = false;
                  } else {
                    this.historyModal(dataHistory)
                    this.qtyFlag = false;
                    this.loading = false;
                  }
                  resolve(res)
                });

            } else {
              this.toastAlert('Enter valid Product code !!');
              this.onClear();
              this.loading = false;
            }
          } else {
            this.toastAlert('Product code is not avilable !!');
            this.onClear();
            this.focusIndexed = 0;
            this.loading = false;
          }

        },
          msg => { // Error
            reject(msg);
            this.loading = false;
          })
    });
    return promise;
  }

  async historyModal(product: any[]) {
    
    if(this.listProducts.length)
    product.map(x => {
      this.listProducts.forEach(y => {
        if(y.ProductId == x.ProductId && y.Store_BatchSlNo == x.Store_BatchSlNo) 
          x.Store_BalQty = nConvert(x.Store_BalQty) - nConvert(y.IssueSub_Qty) 
      })
    })
    const myModal = await this.modalController.create({
      component: ModalhistoryComponent,
      cssClass: 'my-batchModal',
      mode: "ios",
      componentProps: {
        data: product, diffPrice: this.issueInfo.Issue_SaleType, ParamsGodownId: 0, dialogType: 'pos',
        itemName: this.issueSub.ItemDesc, batch: this.settings.SettingBatch,
        expiry: this.settings.SettingExpiry
      }
    });
    myModal.onDidDismiss()
      .then((res) => {
        // console.log(res);
        if (res.data === undefined) {
          return;
        }

        let batchData = res.data[0];
        this.issueSub.ItemDesc = batchData.ItemDesc;
        this.issueSub.Store_BatchSlNo = batchData.Store_BatchSlNo;
        this.issueSub.ProductId = batchData.ProductId;
        this.issueSub.AvilableQTY = batchData.Store_BalQty;
        let priceMenu = Number(this.issueInfo.Issue_SaleType);
        let price: any = this.salesService.onPricemenuRate(priceMenu, batchData);
        this.issueSub.IssueSub_OriginalRate = price;
        // this.issueSub.SelRate = batchData.SelRate;

        this.issueSub.IssueSub_ExpDate = this.DateRetExpiryFormat(batchData.Store_ExpDate);
        this.issueSub.IssueSub_DistRate = batchData.Store_DisributRate;
        this.issueSub.IssueSub_PurRate = batchData.PurRate;
        this.issueSub.IssueSub_Mrp = batchData.Store_MRP;
        this.issueSub.IssueSub_TaxPers = batchData.Store_ProdTaxPers;
        this.issueSub.TaxId = batchData.TaxId;
        this.issueSub.IssueSub_GroupName = batchData.TaxName;
        this.issueSub.IssueSub_TaxOn = batchData.Store_TaxOn;
        this.issueSub.IssueSub_SGSTTaxPers = batchData.SGSTTaxPers;
        this.issueSub.IssueSub_CGSTTaxPers = batchData.CGSTTaxPers;
        this.issueSub.IssueSub_IGSTTaxPers = batchData.IGSTTaxPers;
        this.issueSub.IssueSub_Qty = nConvert(this.issueSub.IssueSub_Qty);
        this.issueSub.IssueSub_PdodDis = nConvert(this.issueSub.IssueSub_PdodDis)
        this.issueSub.BranchId = <any>Number(this.branchId)
        this.focusIndexed = 1;
        this.rowTotal()
      });
    await myModal.present();
  }

  async toastAlert(msg) {
    const toast = await this.toastControl.create({
      position: 'top',
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  onNewBill() {
    this.listProducts = [];

    this.onClear();
    this.fnBillSeries_Gets();
  }

  getTotalAmount() {
    if (!this.listProducts.length) {
      return 0
    }
    return this.listProducts.map(data => parseFloat(data.IssueSub_Amount || 0)).reduce((toal, current) => toal + current);
  }

  scan() {
    this.options = {
      prompt: "Scan your barcode ",
      // preferFrontCamera: false
    }

    this.barcodeScanner.scan(this.options).then((barcodeData) => {

      // cancelled: true
      // format: ""
      // text: ""
      this.issueSub.ItemCode = barcodeData.text;
      this.loading = true;
      if (barcodeData.cancelled) {
        this.loading = false;
        return
      }


      if (this.isItemCode) {
        this.fnProductCodeGet();
      } else {
        this.onBarcodeScan().then(res => {
          this.onGetBarcode();
        }).catch((err) => {
          this.onGetBarcode();
        })
      }
      this.scanCancel = barcodeData.cancelled;
    }, (err) => {
      this.loading = false;
      console.log("Error occured : " + err);
    });
  }

  onBarcodeScan() {
    let promise = new Promise((resolve, reject) => {
      let nBatchNo = '0';
      let dWgtQty: any = '';
      let dTempBatchNo = '';
      nBatchNo = this.issueSub.ItemCode;

      if (this.settings.bSalesBarCodeWgtCondition && nBatchNo.length == 14) {
        let strBarcodestring = nBatchNo;

        if (strBarcodestring.substring(0, 2) == '00') {
          dWgtQty = strBarcodestring.substring(9, 14);
          strBarcodestring = strBarcodestring.replace(/^0+/, ''); // Long.valueOf(strBarcodestring);// strBarcodestring.replace("^0+", "");                    
          dTempBatchNo = strBarcodestring.substring(0, strBarcodestring.length - 5);

          dWgtQty = dWgtQty.replace(/^0+/, '');
          dWgtQty = parseFloat(dWgtQty || 0) / 1000;

          this.salesService.onBracodeWgt(dTempBatchNo, this.branchId, this.apiUrl)
            .pipe(takeUntil(this._unsubscribeAll))
            .toPromise()
            .then(res => {
              let jsonobj = JSON.parse(res);

              if (jsonobj.length > 0) {
                // bBarCodeWgtItemScan = true;
                this.issueSub.ItemCode = dTempBatchNo;
              }
              resolve(res)
            }, msg => {
              resolve(msg)
            });

        } else {
          resolve('error')
        }
      } else {
        reject('error')
      }
    });
    return promise;
  }

  onEdit(item) {
    this.issueSub = item;
    this.issueSub.IssueSub_Qty = String(item.IssueSub_Qty)
    this.editFlag = true;
    this.focusIndexed = 1;
  }

  onGetBarcode() {
    this.salesService.getBarcode(this.issueSub.ItemCode, this.branchId, this.apiUrl)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {

        let jsonobj = JSON.parse(res);

        if (jsonobj.length == 0) {
          this.toastAlert('Enter valid Code !!')
          this.loading = false;
          return
        }
        if (jsonobj.length == 1) {
          let dataItems = jsonobj[0];
          this.issueSub.ItemCode = dataItems.ItemCode;
          this.issueSub.ItemDesc = dataItems.ItemDesc;
          let priceMenu = Number(this.issueInfo.Issue_SaleType);
          let price: any = this.salesService.onPricemenuRate(priceMenu, dataItems);
          this.issueSub.IssueSub_OriginalRate = price;
          // this.issueSub.SelRate = dataItems.Store_SellRate;
          this.issueSub.IssueSub_ExpDate = this.DateRetExpiryFormat(dataItems.Store_ExpDate);
          this.issueSub.IssueSub_Mrp = dataItems.Store_MRP;
          this.issueSub.AvilableQTY = dataItems.Store_BalQty;
          this.issueSub.IssueSub_TaxPers = dataItems.Store_ProdTaxPers;
          this.issueSub.IssueSub_SGSTTaxPers = dataItems.Store_SGSTTaxPers;
          this.issueSub.IssueSub_IGSTTaxPers = dataItems.Store_IGSTTaxPers;
          this.issueSub.IssueSub_CGSTTaxPers = dataItems.Store_CGSTTaxPers;
          this.issueSub.IssueSub_DistRate = dataItems.Store_DisributRate;
          this.issueSub.IssueSub_TaxOn = dataItems.Store_TaxOn;
          this.issueSub.Store_BatchSlNo = dataItems.Store_BatchSlNo;
          // this.issueSub.LandingCost = dataItems.LandingCost
          this.issueSub.IssueSub_Type = dataItems.ReceiptMain_Type
          // this.issueSub.MultiPricing = dataItems.MultiPricing
          this.issueSub.IssueSub_CessPers = dataItems.CessPers;
          this.issueSub.ProductId = dataItems.ProductId;
          // this.issueSub.IssueSub_GroupName = dataItems.TaxGroupId;
          this.issueSub.TaxId = dataItems.TaxID;
          this.issueSub.IssueSub_GroupName = dataItems.TaxName;
          this.issueSub.IssueSub_PurRate = dataItems.PurRate;
          this.issueSub.IssueSub_Qty = <any>Number(this.issueSub.IssueSub_Qty)
          this.issueSub.IssueSub_PdodDis = <any>Number(this.issueSub.IssueSub_PdodDis)
          this.issueSub.BranchId = <any>Number(this.branchId)
          this.rowTotal();
          this.qtyFlag = false;
          this.loading = false;
          this.focusIndexed = 1;
        } else {
          this.historyModal(jsonobj)
          this.qtyFlag = false;
          this.loading = false;
        }
      })
  }

  async paymentModal() {
    this.issueSub.IssueSub_Qty
    this.issueSub.IssueSub_PdodDis
    this.listProducts.map(x => {
      x.IssueSub_Qty = parseFloat(x.IssueSub_Qty || 0);
      x.IssueSub_PdodDis = parseFloat(x.IssueSub_PdodDis || 0);
    })
    const modal = await this.modalController.create({
      component: InventryPaymentComponent,
      mode: "ios",
      componentProps: {
        issueMain: this.issueInfo,
        issueSub: this.listProducts,
        settings: this.settings
      }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.onNewBill()
    }
  }
  scanner: boolean;
  async morePopover(ev: any) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      componentProps: {
        scan: this.isItemCode,
        barcodeDefault: this.scanner
      },
      // mode: "ios",
      cssClass: 'my-custom-class',
      event: ev,
      translucent: false,
      showBackdrop: false,
      animated: false
    });
    await popover.present();
    const { data } = await popover.onDidDismiss();


    if (data == 'list') {
      this.listModal()
    } else if (data == 'customer') {
      this.onAddCustomer();
    } else if (data == 'barcode') {
      this.isItemCode = false;
    } else if (data == 'itemcode') {
      this.isItemCode = true;
    } else if (data == 'scanerOn') {
      this.scanner = true;
    } else if (data == 'scanerOff') {
      this.scanner = false;
    }


  }

  async onAddCustomer() {

    const modal = await this.modalController.create({
      component: AddCustomerComponent,
      mode: "ios",
      componentProps: {
        billSeriesId: this.issueInfo.BillSerId
      },
      cssClass: 'my-custom-class'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.issueInfo.Issue_CustName = data.AC_Name
      this.issueInfo.AcId = data.AC_Id;
      this.issueInfo.Issue_Type = data.PurType
    }
  }
  onReload() {
    location.reload()
  }
  async listModal() {

    const modal = await this.modalController.create({
      component: InventryListComponent,
     
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.listProducts = [];
      const isuemain = data.main;

      this.issueInfo = {
        'Issue_DisPers': isuemain.Issue_DisPers, 'Issue_DisAmt': isuemain.Issue_DisAmt,
        'Issue_RepAmt': isuemain.Issue_RepAmt,
        'Issue_Type': isuemain.Issue_Type, 'Issue_OtherCharge': isuemain.Issue_OtherCharge,
        'Issue_RetValue': isuemain.Issue_RetValue, 'Issue_PointSaleValue': isuemain.Issue_PointSaleValue,
        'Issue_Freight': isuemain.Issue_Freight, 'Issue_CrAmt': isuemain.Issue_CrAmt,
        'Issue_ExpiryAmt': isuemain.Issue_ExpiryAmt, 'Issue_ROF': isuemain.Issue_ROF,
        'Issue_Total': isuemain.Issue_Total, 'Issue_ATotal': isuemain.Issue_ATotal,
        'AgentSalesVaue': isuemain.AgentSalesVaue, 'Issue_VechileNo': isuemain.Issue_VechileNo,
        'Issue_OtherTaxPers': isuemain.Issue_OtherTaxPers, 'Issue_CourierTaxPers': isuemain.Issue_CourierTaxPers,
        'BillSerId': isuemain.BillSerId, 'AgentPers': isuemain.AgentPers, 'AgentMarginAmt': isuemain.AgentMarginAmt,
        'Issue_SlNo': isuemain.Issue_SlNo, 'UniqueBillNo': isuemain.UniqueBillNo,
        'SalesExeId': Number(isuemain.SalesExeId), 'Issue_OrderNo': isuemain.Issue_OrderNo,
        'Issue_OrderDate': this.DateRet(isuemain.Issue_OrderDate), 'Issue_BillDate': this.DateRet(isuemain.Issue_BillDate),
        'Issue_CardExpDate': this.DateRet(isuemain.Issue_CardExpDate), 'AcId': isuemain.AcId,
        'Issue_CustName': isuemain.Issue_CustName, 'Remarks': isuemain.Remarks,
        'Issue_PayTerms': isuemain.Issue_PayTerms,
        'Issue_SaleType': Number(isuemain.Issue_SaleType), 'Issue_AddCessFlag': false, BranchId: 0, StaffId: 0,
        DirectRBank: isuemain.DirectRBank, 'Issue_TCSPers': isuemain.Issue_TCSPers, 'Issue_TCSAmt': isuemain.Issue_TCSAmt,
        ListIssueSubDetailsInfo: [], DictionaryObject: {}, ListIssueTaxInfo: {}, billNo: isuemain.Issue_SlNo
      }

      const subData = data.sub;
      subData.map(x => {
        let issueSub = {
          ItemCode: x.ItemCode, ItemDesc: x.ItemDesc, Store_BatchSlNo: x.Store_BatchSlNo,
          IssueSub_Batch: x.IssueSub_Batch, IssueSub_Pack: x.IssueSub_Pack,
          IssueSub_ExpDate: this.DateRetExpiryFormat(x.IssueSub_ExpDate), IssueSub_PurRate: x.IssueSub_PurRate,
          IssueSub_PerRate: x.IssueSub_PerRate, IssueSub_OriginalRate: Number(x.IssueSub_OriginalRate),
          IssueSub_Mrp: x.IssueSub_Mrp, IssueSub_Qty: parseFloat(x.IssueSub_Qty),
          IssueSub_FreeQty: parseFloat(x.IssueSub_FreeQty || 0), IssueSub_Amount: x.IssueSub_Amount,
          IssueSub_TaxPers: parseFloat(x.IssueSub_TaxPers), IssueSub_TaxAmt: x.IssueSub_TaxAmt,
          IssueSub_PdodDis: x.IssueSub_PdodDis, IssueSub_TaxOn: x.IssueSub_TaxOn,
          IssueSub_TaxOnFree: x.IssueSub_TaxOnFree, IssueSub_GroupName: x.IssueSub_GroupName,
          ProductId: x.ProductId, TaxId: parseFloat(x.TaxId), IssueSub_ProdDisAmt: x.IssueSub_ProdDisAmt,
          IssueSub_ActualTaxPers: parseFloat(x.IssueSub_ActualTaxPers), IssueSub_Type: x.IssueSub_Type,
          IssueSub_SGSTTaxPers: x.IssueSub_SGSTTaxPers, IssueSub_CGSTTaxPers: x.IssueSub_CGSTTaxPers,
          IssueSub_IGSTTaxPers: x.IssueSub_IGSTTaxPers, Field2: x.Field2, IssueSub_AddDisPers: x.IssueSub_AddDisPers,
          AgentPrice: x.AgentPrice, Agent_SubAmount: x.Agent_SubAmount, IssueSub_SpRate1: x.IssueSub_SpRate1,
          IssueSub_SpRate2: x.IssueSub_SpRate2, IssueSub_SpRate3: x.IssueSub_SpRate3, IssueSub_SpRate4: x.IssueSub_SpRate4,
          IssueSub_SpRate5: x.IssueSub_SpRate5, IssueSub_RQty: x.IssueSub_RQty,
          IssueSub_CessPers: parseFloat(x.IssueSub_CessPers), IssueSub_CessAmt: x.IssueSub_CessAmt,
          BranchId: this.branchId, AvilableQTY: x.AvilableQTY, IssueSub_DistRate: x.IssueSub_DistRate, IssueSub_ExtraCessPers: x.IssueSub_ExtraCessPers,
          IssueSub_ExtraCessAmt: x.IssueSub_ExtraCessAmt, IssueSub_NoField1: x.IssueSub_ExtraCessAmt,
        }

        this.listProducts.push(issueSub)
      })


    }
  }

  DateRet(value) {
    const BillDate = value;
    const BillDate1 = BillDate.split('-');
    const Dates = BillDate1[2] + '/' + BillDate1[1] + '/' + BillDate1[0];
    return Dates;
  }
  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}

@Component({
  selector: 'more-popover',
  templateUrl: 'more-popover.html',
})
export class PopoverComponent {
  scanType: string = 'barcode';
  scan: boolean;
  barcodeDefault: boolean;
  constructor(private popoverController: PopoverController) { }

  ngOnInit() {

    if (!this.scan) {
      this.scanType = 'barcode';
    } else {
      this.scanType = 'itemcode';
    }
  }

  onDismiss(value) {
    this.popoverController.dismiss(value)
  }

  onChangeDismiss(eve) {
    this.onDismiss(eve.target.value);
  }

  onScanner(eve) {
    if (eve.target.checked)
      this.onDismiss('scanerOn');
    else
      this.onDismiss('scanerOff');
  }

}

function nConvert(value: string | any): any {
  return parseFloat(value || 0)
}
