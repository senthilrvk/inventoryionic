
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { ModalhistoryComponent } from '../modalhistory/modalhistory.component';
import { MobileprintmrpComponent } from 'src/app/printpage/mobileprintmrp/mobileprintmrp.component';
import { GalaxyelectronicsComponent } from 'src/app/printpage/galaxyelectronics/galaxyelectronics.component';
import { GstpharmaprintTwoComponent } from 'src/app/printpage/gstpharmaprint-two/gstpharmaprint-two.component';
import { FatimainvoiceprintComponent } from 'src/app/printpage/fatimainvoiceprint/fatimainvoiceprint.component';
import { PrintmodelOneComponent } from 'src/app/printpage/printmodel-one/printmodel-one.component';
import { TextileEstimateA5Component } from 'src/app/printpage/textile-estimate-a5/textile-estimate-a5.component';
import { AppService } from 'src/app/app.service';
import { PrintmodelHalfComponent } from 'src/app/printpage/printmodel-half/printmodel-half.component';
import { PrinterService } from 'src/app/printpage/printer.service';
import { AddCustomerComponent } from 'src/app/dialogue/add-customer/add-customer.component';
import { SalesPageService } from 'src/app/sales-billing/sales-page.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrintSettings } from 'src/app/printpage/print-settings/print-settings.model';
import { SmspopupModalComponent } from 'src/app/shared/smspopup-modal/smspopup-modal.component';
import { OutstandingModalComponent } from 'src/app/reports/ledger/outstanding-modal/outstanding-modal.component';

@Component({
  selector: 'app-vansales',
  templateUrl: './vansales.component.html',
  styleUrls: ['./vansales.component.scss']

})
export class SalesVansalesComponent implements OnInit {
  @ViewChild('search', { static: false }) private searchFocus;

  staffId: any; BranchId: any; Apiurl: any;
  BillSeriesSelected: any; BillSeriesJson: any; Pricejson: any; billNo: any; todays: any = new Date();
  PaytermsSelected: any; PriceSelected: any; Salesmanjson: any; SalesManSelectedId: any;
  shownNext: boolean;
  bAdditionalCessInclusiveInSales = false; view_product: boolean; AcId: any = 0; Address: any;
  ProductData: any; productload: boolean; ProductAddcart = []; Softwarename: any;
  divshow: boolean; SettingBatch: any; SettingExpiry: any; NegativeBilling: any; displaycolumn = [];
  QtyDecPlace: any; product_show: boolean; CustomerForSoftware: any; AddOrMinus: any;
  MrpInclusiveSales: any; SRof: any; PackCal: any; RateDecimalPlace: any; OtherAmtTaxCalculation: any;
  EditDate: any; bSaveFlag: any; AcName: any; custPhone: any;
  customerGet: any; jsonTaxGet: any; UniqeuNo: any; showSearch: boolean; ListIssueSubDetailsInfo = [];
  ledgerAmount: number = 0;
  IssueInfo = {
    'Issue_DisPers': 0, 'Issue_DisAmt': 0, 'Issue_RepAmt': 0, 'Issue_Type': 'LOCAL', 'Issue_OtherCharge': 0,
    'Issue_RetValue': 0, 'Issue_PointSaleValue': 0, 'Issue_Freight': 0, 'Issue_CrAmt': 0, 'Issue_ExpiryAmt': 0,
    'Issue_ROF': 0, 'Issue_Total': 0, 'Issue_ATotal': 0, 'AgentSalesVaue': 0,
    'Issue_OtherTaxPers': 0, 'Issue_CourierTaxPers': 0, 'BillSerId': 0, 'AgentPers': 0, 'AgentMarginAmt': 0, 'Issue_SlNo': 0, 'UniqueBillNo': 0,
    'SalesExeId': 0, 'Issue_OrderNo': '', 'Issue_OrderDate': this.todays, 'Issue_BillDate': this.todays, 'Issue_CardExpDate': this.todays,
    'AcId': 0, 'Issue_CustName': '', 'Remarks': '', 'GodownId': 0, 'Issue_PayTerms': 'CASH', 'Issue_SaleType': '0', 'Issue_AddCessFlag': false, DirectRBank: '',
    'Issue_TCSPers': 0, 'Issue_TCSAmt': 0,"Issue_GSTinNo": "","Issue_ShippingTransporter": 'version 28042021', BranchId: 0, StaffId: 0, ListIssueSubDetailsInfo: [], ListIssueTaxInfo: [], DictionaryObject: {}
  };
  strCFWithTax: any;
  bCessInclusiveInSales = false; strTaxIncluded = 'No';
  ListIssueTaxInfo = []; bAgentCommisionCalcOnMarginPers = 'No'; loading = false; dataGetList = [];
  productPop: boolean; bBillListShow: boolean; today = new Date().toISOString();
  fromdate: any;
  Todate: any;
  searchQuery: any;
  dCopyBillSerId: any;
  isDisabled: boolean;
  Remarks: string;
  printdata: any[];
  cessValue = 'No'
  username: string;
  password: any;
  loginpop: boolean;
  dTempGodownId = 0;
  jsonItems: any;
  times: any;
  IssueSubDetailsInfo: any;
  smsAlert: any;
  searchkeyword: string = '';
  printFileName: any = GstpharmaprintTwoComponent;
  bCustomerBillSeriesLinkInSales: boolean;
  bCompoundTaxInSales: boolean;
  strBillSeriesAddTax: string;
  paytermsData: any;
  bTCSInSales: boolean;
  branchName: string = '';
  strInvoiceSmsFormat: string = '';
  ImageSave: string = '';
  thermalPrinter: boolean;
  thermalPrintOption: PrintSettings;
  disSave: boolean;
  editFlag: boolean = true;
  private _unsubscribeAll: Subject<any>;
  ctrlDisc: boolean;
  bSalesmanFixedInSales: boolean;
  bSessionLoginSalesmanFlag: string = '';

  constructor(public alertController: AlertController,
    public modalController: ModalController,
    private appserVice: AppService,
    public ctrlService: ControlService,
    public toastCtrl: ToastController,
    private thermalPrint: PrinterService,
    public salesService: SalesPageService
  ) {
    // this.printer.isAvailable().then(onSuccess, onError);
  }


  ngOnInit() {

    this.thermalPrint.onPrinterGet().subscribe(res => {
      this.thermalPrintOption = res;
    });

    this._unsubscribeAll = new Subject();
    this.username = '';
    this.password = '';
    this.times = new Date().toLocaleTimeString();
    this.ctrlService.get('printer').then(res => {
      if (res) {
        this.thermalPrintOption = res;
        if (res.defaultPrint)
          this.thermalPrinter = true;
      }

    })
    this.ctrlService.get('sessionInvenStaffId').then(result => {
      if (result != null) {
        this.staffId = result;
      }
    });
    this.ctrlService.get('GodownId').then(result => {
      if (result != null) {
        this.dTempGodownId = result;
      }
    });
    this.ctrlService.get('sessionInvenBranchId').then(result => {
      if (result != null) {
        this.BranchId = result;
      }
    });

    this.ctrlService.get('sessionBranchName').then(result => {
      if (result != null) {
        this.branchName = result;
      }
    });

    this.ctrlService.get('SessionLoginSalesmanFlag').then(result => {
      if (result != null) {
        this.bSessionLoginSalesmanFlag = result
      }
    });

    this.ctrlService.get('sessionsurl').then(result => {
      if (result != null) {
        this.Apiurl = result;
        this.fnSettings();
        this.bBillListShow = false;
        if (this.dTempGodownId) {
          this.loginpop = false;
        } else {
          this.loginpop = true;
        }

      }
    });

    const date: Date = new Date();
    date.setDate(1);

    this.fromdate = this.DateReverse(date.toISOString());

    const dates: Date = new Date();
    this.Todate = this.DateReverse(dates.toISOString());

  }

  totalGross(index) {
    return this.ListIssueSubDetailsInfo[index].IssueSub_OriginalRate * (parseFloat(this.ListIssueSubDetailsInfo[index].IssueSub_Qty))
  }
  fnProductBack() {
    this.product_show = false;
    this.showSearch = false
    // setTimeout(() => {
    //   this.myInput.setFocus();
    // }, 200);
  }

  logOut() {
    this.ctrlService.remove('GodownId');
    this.dTempGodownId = 0;
    this.loginpop = true;
  }

  DateReverse(value) {
    const dateFormat = value.split('T');
    const date = dateFormat[0].split('-').reverse().join('/');
    return date;
  }

  calenderPicker(val) {
    if (val === 'from') {
      this.ctrlService.onDatePicker(this.fromdate, val).then(
        date => {
          this.fromdate = this.dateFormat(date);
          this.fnBillGets('');
        },
        err => console.log('Error occurred while getting date: ', err)
      );
    } else {
      this.ctrlService.onDatePicker(this.Todate, val).then(
        date => {
          this.Todate = this.dateFormat(date);
          this.fnBillGets('');
        },
        err => console.log('Error occurred while getting date: ', err)
      );

    }
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



  async fnPrintTable() {
    let components: any;
    switch (this.printFileName) {
      case 'FatimainvoiceprintComponent':
        components = FatimainvoiceprintComponent;
        break;
      case 'GstpharmaprintTwoComponent':
        components = GstpharmaprintTwoComponent;
        break;
      case 'MobileprintmrpComponent':
        components = MobileprintmrpComponent;
        break;
      case 'GalaxyelectronicsComponent':
        components = GalaxyelectronicsComponent;
        break;
      case 'PrintmodelOneComponent':
        components = PrintmodelOneComponent;
        break;
      case 'PrintmodelHalfComponent':
        components = PrintmodelHalfComponent;
        break;
      case 'TextileEstimateA5Component':
        components = TextileEstimateA5Component;
        break;
      default:
        components = MobileprintmrpComponent
        break;
    }
    if (this.thermalPrinter) {
      this.thermalPrint.invoicePRint(this.IssueInfo, this.BranchId, this.Apiurl, this.thermalPrintOption);
      // this.fnClear();
      return
    }
    const myModal = await this.modalController.create({
      component: components,
      mode: "ios",
      componentProps: {
        BillNo: this.IssueInfo.Issue_SlNo, BillserId: this.IssueInfo.BillSerId,
        UniqueNo: this.IssueInfo.UniqueBillNo, ImageSave: this.ImageSave
      }

    });
    await myModal.present();
    const { data } = await myModal.onWillDismiss();
    this.fnClear()

  }

  fnLogin() {
    if (this.username === '') {
      this.Alert('Customer Name is Empty!');
      return;
    }

    if (this.password === '') {
      this.Alert('Password is Empty!');
      return;
    }

    const GodownInfo = { UserName: '', Pwd: '', BranchId: '' };
    GodownInfo.UserName = this.username;
    GodownInfo.Pwd = this.password;
    GodownInfo.BranchId = this.BranchId;

    const body = JSON.stringify(GodownInfo);
    this.appserVice.fnApiPost(this.Apiurl + '/Login/GodownLogin', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        const logindata = data;
        if (logindata.length === 0) {
          this.Alert('Enter Valid User Name and Pwd');
          return;
        } else {
          this.dTempGodownId = parseFloat(logindata[0].GodownId);
          this.ctrlService.set('GodownId', this.dTempGodownId)
          this.loginpop = false;
        }
      });


  }

  async Alert(value) {
    const alert = await this.alertController.create({
      message: value,
      mode: "ios",
      buttons: ['OK']
    });
    await alert.present();
  }


  fnSearch(event) {
    const keyword = event.target.value;
    this.searchkeyword = keyword;
    if (this.product_show) {
      this.fnProductGets(keyword);
    } else {
      this.fnBillGets(keyword);
    }
  }



  fnSettings() {
    this.ctrlService.onLoading('Loading...');
    this.salesService.onSettings(this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise().then(result => {
        const settings = result;
        settings.forEach(ele => {
          if (ele.KeyValue === 'ProductName') {
            this.Softwarename = ele.Value;
            if (ele.Value === 'RetailPharma') {

            }
          } else if (ele.KeyValue === 'Neethi') {
            this.AddOrMinus = ele.Value;
          } else if (ele.KeyValue === 'Customer') {
            this.CustomerForSoftware = ele.Value;
          } else if (ele.KeyValue === 'SRof') {
            this.SRof = ele.Value;
          } else if (ele.KeyValue === 'MRPINCLUSIVESALES') {
            this.MrpInclusiveSales = ele.Value;
          } else if (ele.KeyValue === 'SaleBatch') {
            this.SettingBatch = ele.Value;
          } else if (ele.KeyValue === 'SaleExpiry') {
            this.SettingExpiry = ele.Value;
          } else if (ele.KeyValue === 'ImageSave') {
            this.ImageSave = ele.Value;
          } else if (ele.KeyValue === 'PrintType') {

          } else if (ele.KeyValue === 'InviceSmsFormat') {
            this.strInvoiceSmsFormat = ele.Value;
          } else if (ele.KeyValue === 'QtyDecPlace') {
            this.QtyDecPlace = ele.Value;
          } else if (ele.KeyValue === 'PaymentOption') {

          } else if (ele.KeyValue === 'OfferSettings') {

          } else if (ele.KeyValue === 'PackCal') {
            this.PackCal = ele.Value;
          } else if (ele.KeyValue === 'TCSInSales') {
            if (ele.Value == "Yes")
              this.bTCSInSales = true;
          } else if (ele.KeyValue === 'PrintFormat') {

          } else if (ele.KeyValue === 'NegativeBilling') {
            this.NegativeBilling = ele.Value;
          } else if (ele.KeyValue === 'EditDate') {
            this.EditDate = ele.Value;
          } else if (ele.KeyValue === 'EditDays') {

          } else if (ele.KeyValue === 'AgentInSales') {
            if (ele.Value === 'Yes') {

              const bAgentInSales = true;
            }
          } else if (ele.KeyValue === 'SameItemRepeatCondition') {

          } else if (ele.KeyValue === 'InvoiceSms') {
            this.smsAlert = ele.Value;
          } else if (ele.KeyValue === 'DoctorInSales') {

          } else if (ele.KeyValue === 'SalesItemCode') {

          } else if (ele.KeyValue === 'SalesFifo') {

          } else if (ele.KeyValue === 'WebAddress') {

          } else if (ele.KeyValue === 'CFWithTax') {
            this.strCFWithTax = ele.Value;
          } else if (ele.KeyValue === 'DecimalPlace') {
            this.RateDecimalPlace = ele.Value;
            if (this.RateDecimalPlace !== 3) {
              this.RateDecimalPlace = 2;
            }
          } else if (ele.KeyValue === 'OtherAmtTaxCalculation') {
            this.OtherAmtTaxCalculation = ele.Value;
          } else if (ele.KeyValue === 'CessInclusiveInSales') {
            if (ele.Value === 'Yes') {
              this.bCessInclusiveInSales = true;
            }
          } else if (ele.KeyValue === 'AgentCommisionCalcOnMarginPers') {
            if (ele.Value === 'Yes') {
              this.bAgentCommisionCalcOnMarginPers = 'Yes';
            }
          } else if (ele.KeyValue === 'AdditionalCessInclusiveInSales') {
            if (ele.Value === 'Yes') {
              this.bAdditionalCessInclusiveInSales = true;
            }
          } else if (ele.KeyValue == 'CustomerBillSeriesLinkInSales') {

            if (ele.Value == "Yes") {
              this.bCustomerBillSeriesLinkInSales = true;
            }
          } else if (ele.KeyValue == 'SalesmanFixedInSales') {
            if (ele.Value == "Yes" && String(this.bSessionLoginSalesmanFlag).toUpperCase() == 'TRUE') {
              this.bSalesmanFixedInSales = true;
            }

          }

        });
       }).finally(() => {
        this.fnBranchSettings();
      })

  }

  fnBranchSettings() {
    this.salesService.onBranchSettings(this.BranchId, this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(result => {
        let json: any = result;

        let jsonobj = JSON.parse(json.JsonDetails[0]);

        for (var i = 0; i < jsonobj.length; i++) {
          if (jsonobj[i].SettingName == 'CompoundTaxInSales') {

            if (jsonobj[i].Value == "Yes") {
              this.bCompoundTaxInSales = true;
            }

          } else if (jsonobj[i].SettingName == 'CessAddOnGst') {
            this.cessValue = jsonobj[i].Value;
            if (this.cessValue == "Yes") {
              this.IssueInfo.Issue_AddCessFlag = true;
            } else {
              this.IssueInfo.Issue_AddCessFlag = false;
            }
          }
        }
      }).finally(() => {

        this.fnGetUserPrevilage();
      })
  }

  async fnBackToList() {
    if (this.ListIssueSubDetailsInfo.length === 0) {
      this.fnClose();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Do you want close!',
      message: 'Changes you made may<strong>not be saved.</strong>!',
      mode: "ios",
      buttons: [
        {
          text: 'Stay',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Leave',
          handler: async () => {
            this.fnClose();
          }
        }
      ]
    });

    await alert.present();

  }

  async fnClose() {

    // this.fnClear();

    this.productPop = true;
    this.divshow = true;
    this.bBillListShow = true;
    setTimeout(() => {
      this.fnBillGets('');
      // this.searchFocus.setFocus();
    }, 800);

  }

  async fnCreate() {

    this.fnClear();

    this.product_show = false;
    this.productPop = false;
    this.divshow = false;
    this.bBillListShow = false;

  }



  fnBillGets(val) {
    this.loading = true;
    const isFromdate = this.fromdate;
    const isTodate = this.Todate;
    const StaffId = this.staffId;
    const nBillSerId = this.dCopyBillSerId;
    const search = val;

    let varArguements = {};
    varArguements = { BillNo: search, BillSerId: nBillSerId, FromDate: isFromdate, ToDate: isTodate, BranchId: this.BranchId };

    this.salesService.onBillGets(varArguements, this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        let listItem = JSON.parse(data);
        this.dataGetList = listItem.filter(x => x.GodownId == this.dTempGodownId)

        this.loading = false;
      }, err => {
        this.fnBillGets('');
      });
  }

  fnClear() {
    this.ctrlService.onLoading('Loading...');
    this.disSave = false;
    this.AcId = 0;
    // this.billNo = 0;
    this.UniqeuNo = 0;
    this.Remarks = '';
    this.AcName = '';
    this.Address = '';
    this.ledgerAmount = 0
    const today = new Date();
    this.todays = this.dateFormat(today);

    this.isDisabled = false;
    this.ListIssueSubDetailsInfo = [];
    this.IssueSubDetailsInfo = {};
    this.IssueInfo = {
      'Issue_DisPers': 0, 'Issue_DisAmt': 0, 'Issue_RepAmt': 0, 'Issue_Type': 'LOCAL', 'Issue_OtherCharge': 0,
      'Issue_RetValue': 0, 'Issue_PointSaleValue': 0, 'Issue_Freight': 0, 'Issue_CrAmt': 0, 'Issue_ExpiryAmt': 0,
      'Issue_ROF': 0, 'Issue_Total': 0, 'Issue_ATotal': 0, 'AgentSalesVaue': 0,
      'Issue_OtherTaxPers': 0, 'Issue_CourierTaxPers': 0, 'BillSerId': 0, 'AgentPers': 0,
      'AgentMarginAmt': 0, 'Issue_SlNo': 0, 'UniqueBillNo': 0, 'SalesExeId': 0, 'Issue_OrderNo': '', 'Issue_OrderDate': this.todays,
      'Issue_BillDate': this.todays, 'Issue_CardExpDate': this.todays, 'AcId': 0, 'Issue_CustName': '', 'Remarks': '', 'GodownId': this.dTempGodownId
      , 'Issue_PayTerms': 'CASH', 'Issue_SaleType': '0', 'Issue_AddCessFlag': false,
      'Issue_TCSPers': 0, 'Issue_TCSAmt': 0,"Issue_GSTinNo": "", DirectRBank: this.times,"Issue_ShippingTransporter": 'version 28042021',
      BranchId: 0, StaffId: 0, ListIssueSubDetailsInfo: [], ListIssueTaxInfo: [], DictionaryObject: {}
    };

    this.PaytermsSelected = this.IssueInfo.Issue_PayTerms;
    this.ListIssueTaxInfo = [];

    this.fnSalesManGets();

  }

  fnHistorycolumn(name) {

    this.displaycolumn = [];
    this.displaycolumn.push('BatchSlNo');
    let ewrate = 'WRate';

    let PQty = 'PurQty';
    let PurFree = 'PurFree';
    let SalQty = 'SalQty';
    let SalFre = 'SalFre';
    let SalPeriod = 'SalPeriod';
    if (this.PriceSelected === 2) {
      this.displaycolumn.push('WRate');
      ewrate = '';
    }
    if (this.Softwarename === 'WholeSalePharma') {
      this.displaycolumn.push('PurQty', 'PurFree', 'SalQty', 'SalFre', 'SalPeriod');
      PQty = PurFree = SalQty = SalFre = SalPeriod = '';

    }

    if (this.SettingBatch === 'Yes') {
      this.displaycolumn.push('Batch');
    }
    if (this.SettingExpiry === 'Yes') {
      this.displaycolumn.push('ExpDate');
    }
    if (this.Softwarename === 'RetailPharma') {
      this.displaycolumn.push('Stock', 'PurRate', 'LCost', 'SellRate', 'MRP', 'PurNo', 'Pack', 'SupplierName');
    } else {
      this.displaycolumn.push('Stock', 'PurRate', 'LCost', 'SellRate', 'MRP', ewrate, name, 'PurNo', PQty, PurFree, SalQty, SalFre,
        SalPeriod, 'SupplierName');
    }
    // console.log(this.displaycolumn);
    this.fnBillSeries_Gets();
  }

  fnGetUserPrevilage() {
    this.salesService.onGetUserPrevilage(this.Apiurl, this.staffId )
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        const userprivilage = JSON.parse(data);
        const privilage = userprivilage[0];
        if(privilage) {
          this.editFlag = privilage.SalesEdit;
          this.bSalesRateEditFlag = privilage.SalesRateEdit
        }


      }).finally(() => {
        this.onSalesCtrlOrder();
        this.fnClear();
      })

  }

  fnInvoiceCtrlOrder() {
    const nInvoiceCtrlFocusRow = 0;
    const nCount = 1;
    this.salesService.onInvoiceCtrlOrder('Invoice', this.BranchId, this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        const jsondata = data;
        jsondata.forEach(element => {
          if (element.ControlOrder !== 0) {
            if (element.ControlName === 'BillSeries') {

            } else if (element.ControlName === 'PayTerms') {

            } else if (element.ControlName === 'Customer') {

            } else if (element.ControlName === 'PriceMenu') {

            } else if (element.ControlName === 'SalesMan') {

            } else if (element.ControlName === 'OrderNo') {

            } else if (element.ControlName === 'OrderDate') {

            } else if (element.ControlName === 'ChallanNo') {

            }
          }
        });


      });

  }

  salesRateDis = true;
  bSalesRateEditFlag: boolean = false;
  onSalesCtrlOrder() {
    this.salesService.onInvoiceCtrlOrder('Sales', this.BranchId ,this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        const jsondata = data;
        let item = jsondata.find(x => x.Active && x.ControlOrder && x.ControlName =="SDisPers")
        if(item) this.ctrlDisc = true;

        let userControl = jsondata.find(x => x.ControlName == "SRate" && x.ControlOrder);
        let userRate = userControl && userControl.Active ?  false: true;

         if(!this.bSalesRateEditFlag)
          this.salesRateDis = true;
          else this.salesRateDis = false;

      });

  }

  async fnBillSeries_Gets() {
    await this.salesService.onBillSeriesGets(this.AcId, this.BranchId, this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(async data => {

        this.BillSeriesJson = JSON.parse(data);
        // console.log(this.BillSeriesJson);
        let _params = this.BillSeriesJson[0];
        this.BillSeriesSelected = _params.BillSerId;
        this.dCopyBillSerId = _params.BillSerId;
        this.printFileName = _params.BillwithTIN;
        this.IssueInfo.BillSerId = this.BillSeriesSelected;
        if (_params.BillSeriesAddCess)
          this.IssueInfo.Issue_AddCessFlag = true;
        else this.IssueInfo.Issue_AddCessFlag = false;
        if (this.IssueInfo.Issue_AddCessFlag) {
          this.cessValue = 'Yes';
        }
      }).finally(() => {
        this.fnPayTermsGets();
      }).catch((err) => {
        console.error(err);
      })
  }

  fnPayTermsGets() {
    let BillSerId = this.IssueInfo.BillSerId;
    this.salesService.onPayTermsGets(BillSerId, this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        this.paytermsData = JSON.parse(data);
        this.IssueInfo.Issue_PayTerms = this.paytermsData[0].PayTerms;
        this.PaytermsSelected = this.paytermsData[0].PayTerms;
      }).finally(() => {
        this.fnBillSeriesSalesInclusiveSet();
      })
  }

  async fnchangeBillSeries(event) {
    this.BillSeriesSelected = parseFloat(event.detail.value || 0);
    this.IssueInfo.BillSerId = this.BillSeriesSelected;
    let billFlag = this.BillSeriesJson.find(e => e.BillSerId === this.BillSeriesSelected)
    if (billFlag) {
      if (billFlag.BillSeriesAddCess)
        this.IssueInfo.Issue_AddCessFlag = true;
      else
        this.IssueInfo.Issue_AddCessFlag = false;

      if (this.IssueInfo.Issue_AddCessFlag) {
        this.cessValue = 'Yes';
      }
    }


    this.fnBillSeriesSalesInclusiveSet();

  }

  async fnBillCopyChangeBillSeries(event) {
    this.dCopyBillSerId = event.detail.value;
    this.fnBillGets('');
    this.printFileName = this.BillSeriesJson.find(res => res.BillSerId == this.dCopyBillSerId).BillwithTIN;
  }

  async fnGetMaxBillNo() {
    await this.salesService.onGetMaxBillNo(this.BillSeriesSelected, this.BranchId, this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        this.billNo = data;
      }).finally(() => {
        this.ctrlService.hideLoader();
      }).catch((err) => {
        console.error(err);
      });
  }

  async fnBillSeriesSalesInclusiveSet() {

    const BillSerId = this.BillSeriesSelected;
    this.strBillSeriesAddTax = 'Yes';
    await this.salesService.onBillSeriesSalesInclusiveSet(BillSerId, this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {

        const jsonobj = JSON.parse(data);
        if (jsonobj.length > 0) {
          this.MrpInclusiveSales = jsonobj[0].InclusiveSales;
          if (jsonobj[0].TaxCondition == "No") {
            this.strBillSeriesAddTax = 'No';
          }
        }

        this.ListIssueSubDetailsInfo.forEach(objIssueSub => {
          objIssueSub.Field2 = this.MrpInclusiveSales;
        });

      }).finally(() => {
        this.fnGetMaxBillNo();
      }).catch((err) => {
        console.error(err);
      })

  }

  fnchangePayterms(event) {
    this.PaytermsSelected = event.detail.value;
    this.IssueInfo.Issue_PayTerms = this.PaytermsSelected;

  }

  fnPriceMenuGets() {

    this.salesService.onPriceMenuGets(this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        this.Pricejson = JSON.parse(data);
        this.PriceSelected = this.Pricejson[0].PriceMenu_Id;
        this.IssueInfo.Issue_SaleType = String(this.PriceSelected);
        const priceName = this.Pricejson[0].DisplayName;
        this.fnHistorycolumn(priceName);

      }).catch((err) => {
        console.error(err);
      });
  }

  fnchangePrice(event) {
    this.PriceSelected = 0;
    this.PriceSelected = event.detail.value;
    this.IssueInfo.Issue_SaleType = String(this.PriceSelected);
    this.Pricejson.forEach(data => {
      if (data.PriceMenu_Id === this.PriceSelected) {
        this.fnHistorycolumn(data.PriceMenu_Name);
      }
    });

  }

  fnSalesManGets() {
    this.salesService.onSalesManGets(this.BranchId, this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        this.Salesmanjson = JSON.parse(data);
        this.SalesManSelectedId = this.Salesmanjson[0].AC_Id;
        if(this.bSalesmanFixedInSales)
        this.SalesManSelectedId = this.staffId;

        this.IssueInfo.SalesExeId = Number(this.SalesManSelectedId);
      }).finally(() => {
        this.fnTaxGets();

      }).catch((err) => {
        console.error(err);
      })
  }

  fnchangeSalesman(event) {
    this.SalesManSelectedId = event.detail.value;
    this.IssueInfo.SalesExeId = Number(this.SalesManSelectedId);
  }
  //   scrollToBottom(): void {
  //   //  method used to enable scrolling
  //     this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
  // }



  fncustomerClick(items) {

    this.shownNext = true;
    this.AcName = items.AC_Name;
    this.custPhone = items.Phone;
    this.AcId = items.AC_Id;
    this.Address = items.Addr1;
    this.IssueInfo.Issue_GSTinNo = items.Tin1;

    if (this.IssueInfo.Issue_SlNo == 0) {
      if (this.bCustomerBillSeriesLinkInSales && parseFloat(this.AcId || 0) > 0) {
        this.fnBillSeriesgetCustmerBillSeriesLink(this.AcId);
      }
    }
    this.PriceSelected = '1';
    if (items.PriceMenuId) {
      this.PriceSelected = parseFloat(items.PriceMenuId);
    }
    this.IssueInfo.Issue_SaleType = String(this.PriceSelected);
    this.IssueInfo.AcId = this.AcId;
    this.IssueInfo.Issue_Type = items.PurType;

    this.customerGet = items;
    this.fnGetLeadgerAmtOnAcId(items.AC_Id);
    if (this.bTCSInSales) {
      this.fnGetSalesValueForTCS();
    }
    if(this.IssueInfo.Issue_GSTinNo != "") {
      this.IssueInfo.Issue_AddCessFlag = false;
      this.cessValue = 'No'
    } else {
      this.IssueInfo.Issue_AddCessFlag = true;
      this.cessValue = 'Yes'
    }
  }

  fnGetSalesValueForTCS() {
    this.IssueInfo.Issue_TCSPers = 0;
    this.IssueInfo.Issue_TCSAmt = 0;
    this.salesService.onGetSalesValueForTCS(this.AcId, this.BranchId,
      this.billNo, this.IssueInfo.BillSerId, this.UniqeuNo, this.Apiurl)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        let jsonobj = JSON.parse(res.JsonDetails[0]);
        if (jsonobj.length) {
          var dSalesValue = parseFloat(jsonobj[0].Total || 0);
          if (dSalesValue > 5000000) {
            this.IssueInfo.Issue_TCSPers = 0.075;
          }
        }
      })
  }

  fnGetLeadgerAmtOnAcId(AcId) {
    this.salesService.onGetLeadgerAmtOnAcId(AcId, this.BranchId, this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        const jsonLedger = JSON.parse(data);
        this.ledgerAmount = parseFloat(jsonLedger[0].LeaderAmt || 0)
        // this.keyparams.ledgerAmt = jsonLedger[0].LeaderAmt;
        // this.IssueInfo.LeaderAmt = jsonLedger[0].LeaderAmt;
      }).catch((err) => {
        console.error(err);
      })
  }
  fnBillSeriesgetCustmerBillSeriesLink(AcId) {

    let dBranchId = this.BranchId;
    this.salesService.onBillSeriesgetCustmerBillSeriesLink(AcId, dBranchId, this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        let jsonobj = data;
        let dataJson = JSON.parse(jsonobj.JsonDetails[0]);
        if (dataJson.length > 0) {
          this.BillSeriesSelected = parseInt(dataJson[0].BillSerId || 0);
          this.IssueInfo.BillSerId = this.BillSeriesSelected;
          this.fnBillSeriesSalesInclusiveSet();
        }

      });

  }
  toggleChange($event) {
    this.divshow = !this.divshow;
  }
  getproducts() {

    if (this.AcId == 0 || !this.AcName) {
      this.AcIdAlert();
      return;
    }
    this.product_show = true;
    const tdvalue = '';
    this.fnProductGets(tdvalue);

  }
  fnEditRow(IssueSub) {
    //  console.log(IssueSub);
    // console.log(this.ListIssueSubDetailsInfo);
    this.productQtyAlert(IssueSub);
  }
  fnProductKeyDown(nProductId) {


    this.salesService.onGodownProductKeyDown(nProductId, this.dTempGodownId, this.BranchId, this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        const dataHistory = data;
        // console.log(dataHistory);
        if (dataHistory.length == 0) {
          alert('Stock insufficient.');
          return;
        }
        // for (var i = 0; i < dataHistory.length; i++) {

        //   MultiPricing = dataHistory[i].MultiPricing;

        // }
        if (dataHistory.length == 1) {
          this.presentPrompt(dataHistory);
        } else {
          this.historyModal(dataHistory);
        }

      }, err => console.error(err));

  }
  onAddcart(index, Rate, Qty, Free, disc) {
    let result = this.ListIssueSubDetailsInfo[index];
    this.fnUpdateCart(Rate, Qty, Free,disc, result);
    // this.ListIssueSubDetailsInfo.forEach(result => {
    //   if (data.ProductId === result.ProductId && data.Store_BatchSlNo === result.Store_BatchSlNo) {
    //     this.fnUpdateCart(Rate, Qty, Free, result);
    //   }
    // });
  }

  fnUpdateCart(Rate, Qty, Free,disc, data) {

    const products = this.ListIssueSubDetailsInfo;
    const index: number = products.indexOf(data);
    // this.IssueSubDetailsInfo.IssueSub_PerRate = dLandingCost;

    const ListProducts = [];
    for (let i = 0; i < products.length; i++) {
      let productJson = {};
      if (i === index) {
        productJson = {
          AgentPrice: products[i].AgentPrice,
          Agent_SubAmount: products[i].Agent_SubAmount,
          AvilableQTY: products[i].AvilableQTY,
          BranchId: products[i].BranchId,
          Field2: products[i].Field2,
          IssueSub_ActualTaxPers: parseFloat(products[i].IssueSub_ActualTaxPers),
          IssueSub_AddDisPers: products[i].IssueSub_AddDisPers,
          IssueSub_Amount: products[i].IssueSub_Amount,
          IssueSub_Batch: products[i].IssueSub_Batch,
          IssueSub_CGSTTaxPers: products[i].IssueSub_CGSTTaxPers,
          IssueSub_CessAmt: products[i].IssueSub_CessAmt,
          IssueSub_CessPers: parseFloat(products[i].IssueSub_CessPers),
          IssueSub_ExpDate: products[i].IssueSub_ExpDate,
          IssueSub_FreeQty: parseFloat(Free || 0),
          IssueSub_GroupName: products[i].IssueSub_GroupName,
          IssueSub_IGSTTaxPers: products[i].IssueSub_IGSTTaxPers,
          IssueSub_Mrp: products[i].IssueSub_Mrp,
          IssueSub_OriginalRate: Number(Rate),
          IssueSub_Pack: products[i].IssueSub_Pack,
          IssueSub_PdodDis: parseFloat(disc || 0),
          IssueSub_PerRate: products[i].IssueSub_PerRate,
          IssueSub_ProdDisAmt: products[i].IssueSub_ProdDisAmt,
          IssueSub_PurRate: products[i].IssueSub_PurRate,
          IssueSub_Qty: parseFloat(Qty),
          IssueSub_RQty: products[i].IssueSub_RQty,
          IssueSub_SGSTTaxPers: products[i].IssueSub_SGSTTaxPers,
          IssueSub_SpRate1: products[i].IssueSub_SpRate1,
          IssueSub_SpRate2: products[i].IssueSub_SpRate2,
          IssueSub_SpRate3: products[i].IssueSub_SpRate3,
          IssueSub_SpRate4: products[i].IssueSub_SpRate4,
          IssueSub_SpRate5: products[i].IssueSub_SpRate5,
          IssueSub_TaxAmt: products[i].IssueSub_TaxAmt,
          IssueSub_TaxOn: products[i].IssueSub_TaxOn,
          IssueSub_TaxOnFree: products[i].IssueSub_TaxOnFree,
          IssueSub_TaxPers: parseFloat(products[i].IssueSub_TaxPers),
          IssueSub_Type: products[i].IssueSub_Type,
          ItemDesc: products[i].ItemDesc,
          ProductId: products[i].ProductId,
          Store_BatchSlNo: products[i].Store_BatchSlNo,
          TaxId: parseFloat(products[i].TaxId),
          IssueSub_ExtraCessPers: products[i].IssueSub_ExtraCessPers,
          IssueSub_ExtraCessAmt: products[i].IssueSub_ExtraCessAmt,
          IssueSub_NoField1: parseFloat(products[i].IssueSub_NoField1),
        };
      } else {
        productJson = products[i];
      }
      ListProducts.push(productJson);
    }
    this.ListIssueSubDetailsInfo = ListProducts;
    this.fnAmountCalculation();
  }

  async stockCheckToast(stock) {

    this.ctrlService.presentToast('Available Stock ' + stock, 'Valid Quantity.');

  }

  async productQtyAlert(product) {
    let inputArray:any[] = [

      {
        name: 'quantity',
        placeholder: 'enter quantity',
        id: 'product-qty',
        type: 'number',
        value: parseFloat(product.IssueSub_Qty)
      },
      {
        name: 'free',
        placeholder: 'enter free',
        id: 'product-free',
        type: 'number',
        value: parseFloat(product.IssueSub_FreeQty || 0)
      },
      {
        name: 'rate',
        placeholder: 'enter rate',
        id: 'product-rate',
        type: 'number',
        value: product.IssueSub_OriginalRate
      }
    ];
    if(this.ctrlDisc) {
      inputArray.push({
      name: 'Disc',
      id: 'product-discpers',
      placeholder: 'DiscPers(%)',
      type: 'number',
      value: product.IssueSub_PdodDis
    })
  }

    const calert = await this.alertController.create({
      header: product.ItemDesc,
      subHeader: 'Stock - ' + product.AvilableQTY,
      cssClass: 'alert-head',
      mode: "ios",
      inputs: inputArray,

      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            // this.dismiss(data, product);
          }
        },
        {
          text: 'Add',
          handler: data => {
            let index = this.ListIssueSubDetailsInfo.indexOf(product)
            const tempstock = parseFloat(product.AvilableQTY || 0);
            const enterQty = parseFloat(data.quantity || 0) + parseFloat(data.free || 0);
            if (enterQty > tempstock) {
              this.stockCheckToast(tempstock);
              return;
            }
            this.onAddcart(index, data.rate, data.quantity, data.free, data.Disc);
          }
        }
      ],
      backdropDismiss: false
    });
    await calert.present().then(() => {
      const firstInput: any = document.querySelector('ion-alert #product-rate');
      firstInput.focus();
      firstInput.select();
      firstInput.before('Rate')
      const secondInput: any = document.querySelector('ion-alert #product-qty');
      secondInput.before('Quantity')
      const thirdInput: any = document.querySelector('ion-alert #product-free');
      thirdInput.before('Free');

      const fourthInput: any = document.querySelector('ion-alert #product-discpers');
      if(fourthInput)
      fourthInput.before('Disc(%)')
      return;
    });

  }
  fnchangeCess(event) {
    this.cessValue = event.detail.value;
    if (this.cessValue == 'No') {
      this.IssueInfo.Issue_AddCessFlag = false;
    } else {
      this.IssueInfo.Issue_AddCessFlag = true;
    }
    this.fnAmountCalculation();
  }

  fnProductGets(val) {

    this.ProductData = [];
    // var ProductSearch = event.detail.target.value;
    const ProductSearch = val;
    this.productload = true;

    this.salesService.fnProductGets('godown', ProductSearch, this.AcId,
      this.BranchId, this.BillSeriesSelected, this.dTempGodownId, this.Apiurl)
      .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        const ProductJson = JSON.parse(data);
        this.jsonItems = ProductJson;
        this.ProductData = this.jsonItems;
        this.productload = false;
        // this.searchFocus.setFocus();
        // this.view_product = true;
      });

  }


  getTotalQty() {

    return this.ListIssueSubDetailsInfo.map(item => item.IssueSub_Qty)
      .reduce((acc, value) => parseFloat(acc || 0) + parseFloat(value || 0), 0);
  }

  getTotalFreeQty() {
    // console.log(this.ListIssueSubDetailsInfo);
    return this.ListIssueSubDetailsInfo.map(item => item.IssueSub_FreeQty)
      .reduce((acc, value) => parseFloat(acc || 0) + parseFloat(value || 0), 0);
  }


  async presentPrompt(product) {

    let _orgrate = 0;
    let MenuPrice = this.PriceSelected;
    if (MenuPrice == 3) // "MRP"
      _orgrate = parseFloat(product[0].Store_MRP || 0);
    else if (MenuPrice == 2)//"W MRP"
      _orgrate = parseFloat(product[0].Store_DisributRate || 0);
    else if (MenuPrice == 4) //"spRate1"
      _orgrate = parseFloat(product[0].SpRate1 || 0);
    else if (MenuPrice == 5) //spdate2
      _orgrate = parseFloat(product[0].SpRate2 || 0);
    else if (MenuPrice == 6) //spdate3
      _orgrate = parseFloat(product[0].SpRate3 || 0);
    else if (MenuPrice == 7) //spdate4
      _orgrate = parseFloat(product[0].SpRate4 || 0);
    else if (MenuPrice == 8) //spdate5
      _orgrate = parseFloat(product[0].SpRate5 || 0);
    else
      _orgrate = parseFloat(product[0].Store_SellRate || 0);

      let inputArray:any[] = [
                {
                    name: 'Quantity',
                    id: 'present-qty',
                    placeholder: 'Quantity',
                    type: 'number'
                },
                {
                  name: 'Free',
                  id: 'present-free',
                  placeholder: 'Free',
                  type: 'number'
                },
                {
                    name: 'Rate',
                    id: 'present-rate',
                    placeholder: 'Rate',
                    type: 'number',
                    disabled:this.salesRateDis,
                    value: _orgrate
                  }
                ];
                if(this.ctrlDisc) {
                  inputArray.push({
                  name: 'Disc',
                  id: 'present-discpers',
                  placeholder: 'DiscPers(%)',
                  type: 'number'
                })
              }
    const alert = await this.alertController.create({
      header: this.alertProdName,
      subHeader: 'Available Stock - ' + product[0].Store_BalQty,
      mode: "ios",
      inputs: inputArray,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            // this.dismiss(data, product);
          }
        },
        {
          text: 'Add',
          handler: data => {

            if (product[0].Store_BalQty < (parseFloat(data.Quantity || 0) + parseFloat(data.Free || 0))) {
              this.stockCheckToast(product[0].Store_BalQty);
              return;
            }

            if (!data.Rate) {
              data.Rate = _orgrate;
            }
            if (!data.Quantity) {
              data.Quantity = 0;
            }
            if (!data.Free) {
              data.Free = 0;
            }
            if (!data.Disc) {
              data.Disc = 0;
            }

            data.iStore_BatchSlNo = product[0].Store_BatchSlNo;
            data.iProductId = product[0].ProductId;
            data.stock = product[0].Store_BalQty;
            this.fnAddrow(data);
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present().then(() => {
      const firstInput: any = document.querySelector('ion-alert #present-qty');
      firstInput.focus();
      firstInput.select();
      firstInput.before('Quantity');
      const secondInput: any = document.querySelector('ion-alert #present-free');
      secondInput.before('Free');
      const thirdInput: any = document.querySelector('ion-alert #present-rate');
      thirdInput.before('Rate')

      const fourthInput: any = document.querySelector('ion-alert #present-discpers');
      if(fourthInput)
      fourthInput.before('Disc(%)')

      return;
    });
    // await alert.present();
  }

  async historyModal(product) {
    product.map(x => {
      if (this.ListIssueSubDetailsInfo.length) {
        let item = this.ListIssueSubDetailsInfo.find(y => y.Store_BatchSlNo == x.Store_BatchSlNo);
        if (item) {
          let minusQuantity = parseFloat(item.IssueSub_FreeQty || 0) + parseFloat(item.IssueSub_Qty || 0);
          x.Store_BalQty = x.Store_BalQty - minusQuantity;
        }
      }
    })
    const myModal = await this.modalController.create({
      component: ModalhistoryComponent,
      mode: "ios",
      componentProps: {
        data: product, diffPrice: this.PriceSelected, ParamsGodownId: this.dTempGodownId,
        itemName: this.alertProdName, batch: this.SettingBatch, expiry: this.SettingExpiry,
        discFlag: this.ctrlDisc, rateDis: this.salesRateDis
      }

    });
    myModal.onDidDismiss()
      .then((res) => {
        if (res.data === undefined) {
          return;
        }

        this.fnAddrow(res);
      });
    return await myModal.present();

  }


  DateRetExpiryFormat(value) {
    const BillDate = value;
    const BillDate1 = BillDate.split('-');
    const Dates = BillDate1[1] + '/' + BillDate1[0];
    return Dates;
  }

  fnAddrow(val) {

    let Rate: any = 0;
    let Qty: any = '0';
    let txtFree: any = '0';
    let nProductId: any = '0';
    let BatchNo: any = '0';
    let bstock: any = '0';
    let discPers: any = '0';

    if (val.data) {
      Rate = val.data.Rate;
      Qty = val.data.Quantity;
      txtFree = val.data.Free;
      nProductId = val.data.iProductId;
      BatchNo = val.data.iStore_BatchSlNo;
      bstock = val.data.stock;
      discPers = val.data.Disc;
    } else {
      Rate = val.Rate;
      Qty = val.Quantity;
      txtFree = val.Free;
      nProductId = val.iProductId;
      BatchNo = val.iStore_BatchSlNo;
      bstock = val.stock;
      discPers = val.Disc;
    }
    if (!parseFloat(Qty) && !parseFloat(txtFree)) {
      return
    }

    let duplicate = this.ListIssueSubDetailsInfo.find(x => x.ProductId == nProductId && x.Store_BatchSlNo == BatchNo);
    if (duplicate) {
      this.replaceOrAdd(duplicate, Rate, Qty, txtFree,discPers, bstock, nProductId, BatchNo);
      return
    }

    this.addNew(Rate, Qty, txtFree,discPers, nProductId, BatchNo)
  }

  async replaceOrAdd(item, rate, nqty, nFree,discPers, bstock, id, no) {

    let oldQty = parseFloat(item.IssueSub_Qty || 0);
    let oldFree = parseFloat(item.IssueSub_FreeQty || 0);
    const alert = await this.alertController.create({
      header: 'Already Exit!',
      message: `Quantity - ${item.IssueSub_Qty} | Free -${item.IssueSub_FreeQty}`,
      subHeader: `Stock ${bstock}`,
      mode: "ios",
      inputs: [
        {
          label: 'New Quantity',
          name: 'quantity',
          type:'number',
          id: 'replace-qty',
          value: nqty
        },
        {
          label: 'New Free',
          name: 'free',
          type:'number',
          id: 'replace-free',
          value: nFree
        }
      ],
      buttons: [
        {
          text: 'Add New',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            let totalOldQty = oldQty + oldFree;
            let totalQty = totalOldQty + parseFloat(nqty || 0) + parseFloat(nFree || 0);
            if (totalQty > bstock) {
              this.errorToast(`Avilable Stock ${bstock}`, `Already ${totalOldQty} is presented.`);
              return
            }
            this.addNew(rate, nqty, nFree,discPers, id, no)
          }
        }, {
          text: 'Replace',
          handler: async (res) => {
            this.onRemove(item);
            this.addNew(rate, res.quantity, res.free,discPers, id, no);
          }
        }
      ]
    });

    await alert.present().then(() => {
      const firstInput: any = document.querySelector('ion-alert #replace-qty');
      firstInput.focus();
      firstInput.select();
      firstInput.before('Quantity');
      const secondInput: any = document.querySelector('ion-alert #replace-free');
      secondInput.before('Free');
    });
  }


  addNew(Rate, Qty, txtFree,discPers, nProductId, BatchNo) {
    let efreeQty = parseFloat(Qty);
    if (parseFloat(txtFree) && !efreeQty) {
      efreeQty = txtFree
    }
    this.salesService.addInventry('godown', efreeQty, nProductId, this.BranchId, BatchNo, this.dTempGodownId, this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise()
      .then(res => {
        const result = JSON.parse(res);
        const dataget = result[0];

        this.IssueSubDetailsInfo = {};
        this.IssueSubDetailsInfo.ItemDesc = dataget.ItemDesc;
        this.IssueSubDetailsInfo.Store_BatchSlNo = dataget.Store_BatchSlNo;
        this.IssueSubDetailsInfo.IssueSub_Batch = dataget.Store_Batch;
        this.IssueSubDetailsInfo.IssueSub_Pack = dataget.Store_Pack;
        this.IssueSubDetailsInfo.IssueSub_ExpDate = this.DateRetExpiryFormat(dataget.Store_ExpDate);
        this.IssueSubDetailsInfo.IssueSub_GodownId = this.dTempGodownId;

        let dLandingCost = 0;
        let dPurRate = parseFloat(dataget.Store_ReceiptRate || 0);

        if (parseFloat(dataget.Store_BarCode || 0) > 0) {
          this.IssueSubDetailsInfo.IssueSub_PurRate = dataget.Store_BarCode;
          dPurRate = parseFloat(dataget.Store_BarCode || 0);
        } else {
          this.IssueSubDetailsInfo.IssueSub_PurRate = dataget.Store_ReceiptRate;
        }

        dLandingCost = dPurRate + ((dPurRate * parseFloat(dataget.TaxPercent || 0)) / 100);

        this.IssueSubDetailsInfo.IssueSub_PerRate = dLandingCost;
        this.IssueSubDetailsInfo.IssueSub_OriginalRate = Number(Rate);
        this.IssueSubDetailsInfo.IssueSub_Mrp = dataget.Store_MRP;
        this.IssueSubDetailsInfo.IssueSub_Qty = parseFloat(Qty);
        this.IssueSubDetailsInfo.IssueSub_FreeQty = parseFloat(txtFree || 0);
        this.IssueSubDetailsInfo.IssueSub_Amount = 0;
        this.IssueSubDetailsInfo.IssueSub_TaxPers = parseFloat(dataget.TaxPercent);
        this.IssueSubDetailsInfo.IssueSub_TaxAmt = 0;
        this.IssueSubDetailsInfo.IssueSub_PdodDis = parseFloat(discPers || 0);
        this.IssueSubDetailsInfo.IssueSub_TaxOn = dataget.TaxOn;
        this.IssueSubDetailsInfo.IssueSub_TaxOnFree = dataget.TaxOnFree;
        this.IssueSubDetailsInfo.IssueSub_GroupName = dataget.TaxName;
        this.IssueSubDetailsInfo.ProductId = dataget.ProductId;
        this.IssueSubDetailsInfo.TaxId = parseFloat(dataget.TaxId);
        this.IssueSubDetailsInfo.IssueSub_ProdDisAmt = 0;
        this.IssueSubDetailsInfo.IssueSub_ActualTaxPers = parseFloat(dataget.TaxPercent);
        this.IssueSubDetailsInfo.IssueSub_Type = dataget.ReceiptMain_Type;
        this.IssueSubDetailsInfo.IssueSub_SGSTTaxPers = dataget.SGSTTaxPers;
        this.IssueSubDetailsInfo.IssueSub_CGSTTaxPers = dataget.CGSTTaxPers;
        this.IssueSubDetailsInfo.IssueSub_IGSTTaxPers = dataget.IGSTTaxPers;
        this.IssueSubDetailsInfo.IssueSub_ExtraCessPers = dataget.AdditionalCess;
        this.IssueSubDetailsInfo.Field2 = this.MrpInclusiveSales;

        this.IssueSubDetailsInfo.IssueSub_AddDisPers = 0;
        this.IssueSubDetailsInfo.AgentPrice = 0;
        this.IssueSubDetailsInfo.Agent_SubAmount = 0;
        this.IssueSubDetailsInfo.IssueSub_SpRate1 = dataget.SpRate1;
        this.IssueSubDetailsInfo.IssueSub_SpRate2 = dataget.SpRate2;
        this.IssueSubDetailsInfo.IssueSub_SpRate3 = dataget.SpRate3;
        this.IssueSubDetailsInfo.IssueSub_SpRate4 = dataget.SpRate4;
        this.IssueSubDetailsInfo.IssueSub_SpRate5 = dataget.SpRate5;
        this.IssueSubDetailsInfo.IssueSub_RQty = 0;
        this.IssueSubDetailsInfo.IssueSub_CessPers = parseFloat(dataget.CessPers);
        this.IssueSubDetailsInfo.IssueSub_CessAmt = 0;
        this.IssueSubDetailsInfo.BranchId = dataget.BranchId;
        this.IssueSubDetailsInfo.AvilableQTY = dataget.TotQty;

        if (this.bCompoundTaxInSales || this.strBillSeriesAddTax == 'No') {
          this.IssueSubDetailsInfo.IssueSub_TaxPers = 0;
          this.IssueSubDetailsInfo.TaxId = 1;
          this.IssueSubDetailsInfo.IssueSub_ActualTaxPers = 0;
          this.IssueSubDetailsInfo.IssueSub_CessPers = 0;
          this.IssueSubDetailsInfo.IssueSub_ExtraCessPers = 0;

        }

        if (this.PriceSelected === 2) {
          this.IssueSubDetailsInfo.IssueSub_OriginalRate = Number(dataget.Store_DisributRate);
          this.IssueSubDetailsInfo.IssueSub_DistRate = Rate;

          if (this.Softwarename === 'WholeSalePharma') {
            if (this.strCFWithTax === 'Yes') {
              const dSelRate1 = parseFloat(Rate);
              const dMrp1 = parseFloat(dataget.Store_MRP);
              const dTax1 = parseFloat(dataget.TaxPercent);
              let dTaxAmt1 = 0;

              if (dataget.TaxOn === 'MRP Inclusive') {
                dTaxAmt1 = 1 * ((dMrp1 * dTax1) / (100 + dTax1));
              } else {
                dTaxAmt1 = 1 * ((dSelRate1 * dTax1) / 100);
              }

              const dRateWithTax1 = dSelRate1 + dTaxAmt1;
              this.IssueSubDetailsInfo.IssueSub_DistRate = dRateWithTax1;
            }
          }

        }
        if (this.PriceSelected === 3) {
          // tslint:disable-next-line: no-string-literal
          this.IssueSubDetailsInfo['IssueSub_OriginalRate'] = Number(dataget.Store_MRP);
        } else if (this.PriceSelected === 4) {// "spRate1"
          this.IssueSubDetailsInfo.IssueSub_OriginalRate = Number(dataget.SpRate1);
        } else if (this.PriceSelected === 5) {// spdate2
          this.IssueSubDetailsInfo.IssueSub_OriginalRate = Number(dataget.SpRate2);
        } else if (this.PriceSelected === 6) {// spdate3
          this.IssueSubDetailsInfo.IssueSub_OriginalRate = Number(dataget.SpRate3);
        } else if (this.PriceSelected === 7) {// spdate4
          this.IssueSubDetailsInfo.IssueSub_OriginalRate = Number(dataget.SpRate4);
        } else if (this.PriceSelected === 8) {// spdate5
          this.IssueSubDetailsInfo.IssueSub_OriginalRate = Number(dataget.SpRate5);
        }


        this.ListIssueSubDetailsInfo.push(this.IssueSubDetailsInfo);
        //  this.ProductAddcart.push(dataget);
        this.fnAmountCalculation();
      });


  }


  fnTaxGets() {

    this.salesService.onTaxGets(this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {

        this.jsonTaxGet = data;
        this.ListIssueTaxInfo = [];
        let IssueTax = { TaxId: 0, TaxAmount: 0, Amount: 0, SGSTTaxPers: 0, CGSTTaxPers: 0, IGSTTaxPers: 0 };
        this.jsonTaxGet.forEach(ele => {
          IssueTax = { TaxId: 0, TaxAmount: 0, Amount: 0, SGSTTaxPers: 0, CGSTTaxPers: 0, IGSTTaxPers: 0 };
          // tslint:disable-next-line: no-string-literal
          IssueTax['TaxId'] = parseFloat(ele.TaxID);
          IssueTax.TaxAmount = 0;
          IssueTax.Amount = 0;
          IssueTax.SGSTTaxPers = ele.SGSTTaxPers;
          IssueTax.CGSTTaxPers = ele.CGSTTaxPers;
          IssueTax.IGSTTaxPers = ele.IGSTTaxPers;
          this.ListIssueTaxInfo.push(IssueTax);
        });

      }).finally(() => {
        this.fnPriceMenuGets();

      }).catch((err) => {
        console.error(err);
      })

  }

  fnAmountCalculation() {

    let strMrpInclusiveSales = this.MrpInclusiveSales;
    // tslint:disable-next-line: prefer-const
    let dTotDisPersAll = 0, dTotDisAmtAll = 0, dIssueTotAmtBeforeTax = 0;

    dTotDisPersAll = Number(this.IssueInfo.Issue_DisPers || 0);
    this.IssueInfo.Issue_DisAmt = 0;
    this.IssueInfo.Issue_RepAmt = 0;

    // tslint:disable-next-line: prefer-const
    let dDisAdd = 0, dDisMinus = 0;
    let dQty = 0, dFreeQty = 0, dRate = 0, dSelRate = 0, dMRP = 0, dAmount = 0, dProdId = 0,
      Pack = 0, dWholeSaleRate = 0, dTax = 0, dDisPers = 0, dDisAmt = 0;
    let dTotTaxAmount = 0, dTotAmount = 0, dTotDisPers = 0, dTaxAmt = 0, dAmountBeforeTax = 0,
      dAmoutBeforTaxRowise = 0, dFreight = 0, dLCost = 0;
    let dRateWithTaxPerQty = 0, dPerRate = 0, dPerMrp = 0, dPerTaxAmt = 0, dAmountBeforeDiscount = 0,
      dSchePers = 0, dScheAmt = 0, dPack, dRetQty = 0, dReplAmt = 0, dPerScheAmt;
    let strBatch = '', strTaxOn = '', strType = '', strTaxName = '';
    let dLooseQty = 0, dLooseFreeQty = 0; let strTaxOnFree = '';
    let dTotExcempted = 0, dTotMRPValue = 0, dTotVatCollected = 0, dTotSaleValue = 0;
    let dOriginalRate = 0, dAddDisPers = 0, dAgentPrice = 0;
    let dSGSTTaxPers = 0, dSGSTTaxAmount = 0, dSGSTAmount = 0, dCGSTTaxPers = 0,
      dCGSTTaxAmount = 0, dCGSTAmount = 0, dIGSTTaxPers = 0, dIGSTTaxAmount = 0, dIGSTAmount = 0;
    let strSalesType = 'LOCAL';
    dIssueTotAmtBeforeTax = 0;

    const dTempOriginalRate = 0, dTempDisAdd = 0;
    let dCessPers = 0, dCessAmt = 0, dAdditionalCessPers = 0, dAdditionalCessAmt = 0;

    dTotDisPers = this.IssueInfo.Issue_DisPers;
    strSalesType = this.IssueInfo.Issue_Type;


    this.ListIssueSubDetailsInfo.forEach(oIssueSubDetailsInfoArg => {
      // tslint:disable-next-line: max-line-length
      dQty = dFreeQty = dRate = dSelRate = dMRP = dAmount = dProdId = Pack = dWholeSaleRate = dDisPers = dPerRate = dAmountBeforeDiscount = 0;
      dTotTaxAmount = dTotAmount = dTaxAmt = dAmoutBeforTaxRowise = dFreight = dLCost = 0;
      // tslint:disable-next-line: max-line-length
      dSGSTTaxPers = dSGSTTaxAmount = dSGSTAmount = dCGSTTaxPers = 0, dCGSTTaxAmount = dCGSTAmount = dIGSTTaxPers = dIGSTTaxAmount = dIGSTAmount = 0;
      dCessPers = dCessAmt = 0; dRateWithTaxPerQty = 0; strBatch = strTaxOn = strTaxName = '';
      dPack = 0; dPerMrp = 0; strTaxOnFree = 'No'; dPerTaxAmt = 0; dLooseFreeQty = 0; strType = '';
      dOriginalRate = 0; dLooseQty = 0; dQty = 0; dLooseFreeQty = 0; dScheAmt = 0; dPerScheAmt = 0;
      dSchePers = 0; dRetQty = 0; strType = ''; dAddDisPers = 0; dAgentPrice = 0;
      dQty = oIssueSubDetailsInfoArg.IssueSub_Qty; dFreeQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_FreeQty || 0);
      dRetQty = oIssueSubDetailsInfoArg.IssueSub_RQty;

      if (oIssueSubDetailsInfoArg.ProductId !== 0) {
        dPerRate = 0; dPerMrp = 0;
        dQty = 0; dFreeQty = 0; dRetQty = 0;
        dAdditionalCessPers = dAdditionalCessAmt = 0;
        dRate = parseFloat(oIssueSubDetailsInfoArg.IssueSub_OriginalRate || 0);
        dOriginalRate = parseFloat(oIssueSubDetailsInfoArg.IssueSub_OriginalRate || 0)
        dPack = parseFloat(oIssueSubDetailsInfoArg.IssueSub_Pack || 0)
        dMRP = parseFloat(oIssueSubDetailsInfoArg.IssueSub_Mrp || 0)
        dTax = parseFloat(oIssueSubDetailsInfoArg.IssueSub_ActualTaxPers || 0)
        strTaxOn = oIssueSubDetailsInfoArg.IssueSub_TaxOn;
        strTaxOnFree = oIssueSubDetailsInfoArg.IssueSub_TaxOnFree;
        strTaxName = oIssueSubDetailsInfoArg.IssueSub_GroupName;
        dDisPers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_PdodDis || 0)
        dSchePers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_SchmPers || 0)
        dRetQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_RQty || 0)
        oIssueSubDetailsInfoArg.IssueSub_ActualRate = parseFloat(oIssueSubDetailsInfoArg.IssueSub_OriginalRate || 0)
        strType = oIssueSubDetailsInfoArg.IssueSub_Type;
        dQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_Qty || 0)
        dFreeQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_FreeQty || 0)
        dRetQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_RQty || 0)
        dAddDisPers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_AddDisPers || 0)
        dAgentPrice = parseFloat(oIssueSubDetailsInfoArg.AgentPrice || 0)

        dSGSTTaxPers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_SGSTTaxPers || 0)
        dCGSTTaxPers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_CGSTTaxPers || 0)
        dIGSTTaxPers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_IGSTTaxPers || 0)
        dCessPers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_CessPers || 0);
        dAdditionalCessPers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_ExtraCessPers || 0);
        dScheAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_SchmAmt || 0)

        strMrpInclusiveSales = oIssueSubDetailsInfoArg.Field2;

        if (dQty > 0 && dScheAmt > 0) {
          dPerScheAmt = dScheAmt / dQty;
        }

        if (oIssueSubDetailsInfoArg.IssueSub_Repl === 'Rep' && this.Softwarename === 'WholeSalePharma') {
          dReplAmt = dReplAmt + (dQty * dMRP);
          oIssueSubDetailsInfoArg.IssueSub_Amount = 0;
          oIssueSubDetailsInfoArg.IssueSub_TaxAmt = 0;
          oIssueSubDetailsInfoArg.IssueSub_SGSTTaxAmount = 0;
          oIssueSubDetailsInfoArg.IssueSub_SGSTAmount = 0;
          oIssueSubDetailsInfoArg.IssueSub_CGSTTaxAmount = 0;
          oIssueSubDetailsInfoArg.IssueSub_CGSTAmount = 0;
          oIssueSubDetailsInfoArg.IssueSub_IGSTTaxAmount = 0;
          oIssueSubDetailsInfoArg.IssueSub_IGSTAmount = 0;
          this.IssueInfo.Issue_RepAmt = dReplAmt;
          const ID = oIssueSubDetailsInfoArg.IssueSub_Id;

        } else {
          if (dPack === 0) {
            dPack = 1;
            oIssueSubDetailsInfoArg.IssueSub_Pack = 1;
          }

          if (dAddDisPers > 0) {
            dRate = dOriginalRate + ((dOriginalRate * dAddDisPers) / 100);
            dOriginalRate = dOriginalRate + ((dOriginalRate * dAddDisPers) / 100);
          }


          dOriginalRate = dOriginalRate - dPerScheAmt;

          if (oIssueSubDetailsInfoArg.Field2 == 'Yes') {

            if (strTaxOn == 'MRP Inclusive') {
              dRate = dOriginalRate - ((dMRP * dTax) / (100 + dTax));
              oIssueSubDetailsInfoArg.IssueSub_ActualRate = dRate;
            } else {
              dRate = dOriginalRate - ((dOriginalRate * dTax) / (100 + dTax));
              oIssueSubDetailsInfoArg.IssueSub_ActualRate = dRate;
            }
            if (this.bAdditionalCessInclusiveInSales) {
              dRate = dOriginalRate - ((dOriginalRate * (dTax + dAdditionalCessPers)) / (100 + dTax + dAdditionalCessPers));
              oIssueSubDetailsInfoArg.IssueSub_ActualRate = dRate;
            }
            if (this.bCessInclusiveInSales && this.IssueInfo.Issue_AddCessFlag && strType !== 'INTERSTATE') {
              if (this.bAdditionalCessInclusiveInSales) {
                dRate = dOriginalRate - ((dOriginalRate * (dTax + dCessPers + dAdditionalCessPers)) / (100 + dTax + dCessPers + dAdditionalCessPers));
              } else {
                dRate = dOriginalRate - ((dOriginalRate * (dTax + dCessPers)) / (100 + dTax + dCessPers));
              }

              oIssueSubDetailsInfoArg.IssueSub_ActualRate = dRate;
            }

          } else { dRate = dRate - dPerScheAmt; }


          if (oIssueSubDetailsInfoArg.Field2 === 'Yes') {


            if (strTaxOn === 'MRP Inclusive') {

              dAgentPrice = dAgentPrice - ((dMRP * dTax) / (100 + dTax));
              oIssueSubDetailsInfoArg.AgentPrice = dAgentPrice;

            } else {

              dAgentPrice = dAgentPrice - ((dAgentPrice * dTax) / (100 + dTax));
              oIssueSubDetailsInfoArg.AgentPrice = dAgentPrice;

            }

            if (this.bCessInclusiveInSales === true && strType !== 'INTERSTATE') {
              dAgentPrice = dAgentPrice - ((dAgentPrice * dCessPers) / (100 + dCessPers));
              oIssueSubDetailsInfoArg.AgentPrice = dRate;
            }

          }

          dQty = oIssueSubDetailsInfoArg.IssueSub_Qty;
          dFreeQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_FreeQty || 0);
          dRetQty = oIssueSubDetailsInfoArg.IssueSub_RQty;

          dQty = dQty - dRetQty;


          dRate = dRate + ((dRate * dDisAdd) / 100);
          dPerRate = dPerRate + ((dPerRate * dDisAdd) / 100);

          dRateWithTaxPerQty = dRate;
          dAmoutBeforTaxRowise = (dRate * dQty) + (dPerRate * dLooseQty);
          dAmoutBeforTaxRowise = dAmoutBeforTaxRowise - ((dAmoutBeforTaxRowise * dDisPers) / 100);
          dAmountBeforeDiscount = (dRate * dQty);
          dAmountBeforeDiscount = dAmountBeforeDiscount - ((dAmountBeforeDiscount * dDisPers) / 100);


          dDisAmt = (((dRate * dQty) * dDisPers) / 100);
          dDisAmt += (((dPerRate * dLooseQty) * dDisPers) / 100);

          dRate = dRate - ((dRate * dDisPers) / 100);
          dPerRate = dPerRate - ((dPerRate * dDisPers) / 100);

          dAmountBeforeTax += (dRate * dQty);
          dAmountBeforeTax += dPerRate * dLooseQty;
          dIssueTotAmtBeforeTax = dAmountBeforeTax;

          dRate = dRate - ((dRate * dTotDisPers) / 100);
          dPerRate = dPerRate - ((dPerRate * dTotDisPers) / 100);
          dAmountBeforeDiscount += (dPerRate * dLooseQty);

          dRate = dRate - ((dRate * dDisMinus) / 100);
          dPerRate = dPerRate - ((dPerRate * dDisMinus) / 100);

          if (strSalesType === 'INTERSTATE') {
            dIGSTTaxAmount = dQty * ((dRate * dIGSTTaxPers) / 100);
            dIGSTAmount = dQty * dRate;

            if (strTaxOnFree === 'Yes') {
              dIGSTAmount += (dFreeQty * dRate);
              dIGSTTaxAmount += (dFreeQty * ((dRate * dIGSTTaxPers) / 100));
            }
          } else {
            dSGSTTaxAmount = dQty * ((dRate * dSGSTTaxPers) / 100);
            dSGSTAmount = dQty * dRate;
            dCGSTTaxAmount = dQty * ((dRate * dCGSTTaxPers) / 100);
            dCGSTAmount = dQty * dRate;
            if (strTaxOnFree === 'Yes') {

              dSGSTAmount += (dFreeQty * dRate);
              dSGSTTaxAmount += (dFreeQty * ((dRate * dSGSTTaxPers) / 100));

              dCGSTAmount += (dFreeQty * dRate);
              dCGSTTaxAmount += (dFreeQty * ((dRate * dCGSTTaxPers) / 100));
            }
          }

          if (strType === 'LOCAL' && strTaxName === 'MEDICINE') {
            if (strTaxOn === 'MRP Inclusive') {

              dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = 1 * ((dPerMrp * dTax) / (100 + dTax));
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = dLooseQty * ((dPerMrp * dTax) / (100 + dTax));
              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dMRP * dTax) / (100 + dTax));
                dPerTaxAmt += dLooseFreeQty * ((dPerMrp * dTax) / (100 + dTax));
              }
            } else {
              dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = 1 * ((dPerMrp * dTax) / (100 + dTax));
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dRate * dTax) / 100);
              dPerTaxAmt = dLooseQty * ((dPerRate * dTax) / 100);
              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dRate * dTax) / 100);
                dPerTaxAmt += dLooseFreeQty * ((dPerRate * dTax) / 100);
              }
            }
            dTotExcempted += (dQty * dRate) + dTaxAmt;

          } else if (strType === 'INTERSTATE' && strTaxName === 'MEDICINE') {
            dTotMRPValue += (dQty * dMRP) + (dPerMrp * dLooseQty);
            if (strTaxOn === 'MRP Inclusive') {
              dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = 1 * ((dPerMrp * dTax) / (100 + dTax));
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = dLooseQty * ((dPerMrp * dTax) / (100 + dTax));
              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dMRP * dTax) / (100 + dTax));
                dPerTaxAmt += dLooseFreeQty * ((dPerMrp * dTax) / (100 + dTax));
                dTotMRPValue += (dFreeQty * dMRP);
              }
            } else {
              dTaxAmt = 1 * ((dRate * dTax) / 100);
              dPerTaxAmt = 1 * ((dPerRate * dTax) / 100);
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dRate * dTax) / 100);
              dPerTaxAmt = dLooseQty * ((dPerRate * dTax) / 100);
              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dRate * dTax) / 100);
                dPerTaxAmt += dLooseFreeQty * ((dPerRate * dTax) / 100);
              }
            }

            dTotVatCollected += dTaxAmt + dPerTaxAmt;
            dTotSaleValue += (dQty * dRate) + (dPerRate * dLooseQty);
          } else if (strType === 'INTERSTATE') {
            if (strTaxOn === 'MRP Inclusive') {
              dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = 1 * ((dPerMrp * dTax) / (100 + dTax));
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = dLooseQty * ((dPerMrp * dTax) / (100 + dTax));

              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dMRP * dTax) / (100 + dTax));
                dPerTaxAmt += dLooseFreeQty * ((dPerMrp * dTax) / (100 + dTax));
              }
            } else {

              dTaxAmt = 1 * ((dRate * dTax) / 100);
              dPerTaxAmt = 1 * ((dPerRate * dTax) / 100);
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dRate * dTax) / 100);
              dPerTaxAmt = dLooseQty * ((dPerRate * dTax) / 100);

              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dRate * dTax) / 100);
                dPerTaxAmt += dLooseFreeQty * ((dPerRate * dTax) / 100);
              }
            }
          } else {
            if (strTaxOn === 'MRP Inclusive') {
              dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = 1 * ((dPerMrp * dTax) / (100 + dTax));
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = dLooseQty * ((dPerMrp * dTax) / (100 + dTax));
              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dMRP * dTax) / (100 + dTax));
                dPerTaxAmt += dLooseFreeQty * ((dPerMrp * dTax) / (100 + dTax));
              }
            } else {

              dTaxAmt = 1 * ((dRate * dTax) / 100);
              dPerTaxAmt = 1 * ((dPerRate * dTax) / 100);
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dRate * dTax) / 100);
              dPerTaxAmt = dLooseQty * ((dPerRate * dTax) / 100);

              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dRate * dTax) / 100);
                dPerTaxAmt += dLooseFreeQty * ((dPerRate * dTax) / 100);
              }

            }

          }

          if (this.IssueInfo.Issue_AddCessFlag === true && strType !== 'INTERSTATE') {

            dCessAmt = (dRate * dQty * dCessPers) / 100;
          }

          dAdditionalCessAmt = (dRate * dQty * dAdditionalCessPers) / 100;
          dAmount = (dRate * dQty) + (dPerRate * dLooseQty) + dTaxAmt + dPerTaxAmt + dCessAmt + dAdditionalCessAmt;

          if (strMrpInclusiveSales === 'Yes' && this.Softwarename === 'RetailPharma') {
            dAmountBeforeDiscount = dOriginalRate * dQty;
          } else {
            dAmountBeforeDiscount += dTaxAmt + dPerTaxAmt + dCessAmt;
          }

          if (this.strTaxIncluded === 'Yes') {
            if ((dQty + dFreeQty) > 0) {
              dLCost = (((dAmount - dTaxAmt) / (dQty + dFreeQty)) + (dFreight));
            } else {
              dLCost = 0;
            }
          } else {
            if ((dQty + dFreeQty) > 0) {
              dLCost = ((dAmount / (dQty + dFreeQty)) + (dFreight));
            } else {
              dLCost = 0;
            }
          }

          dTaxAmt = dTaxAmt + dPerTaxAmt;


          oIssueSubDetailsInfoArg.IssueSub_Amount = dAmount;
          oIssueSubDetailsInfoArg.IssueSub_TaxAmt = dTaxAmt;
          // oIssueSubDetailsInfoArg.issuesub_ = dLCost;
          oIssueSubDetailsInfoArg.IssueSub_SelRate = dRateWithTaxPerQty;
          oIssueSubDetailsInfoArg.IssueSub_AmountBeforeTax = dAmoutBeforTaxRowise;
          // this.IssueInfo.MRPValue = dTotMRPValue;
          // this.IssueInfo.VatCollected = dTotVatCollected;
          // this.IssueInfo.SaleValue = dTotSaleValue;
          // this.IssueInfo.ExcemptedValue = dTotExcempted;
          oIssueSubDetailsInfoArg.IssueSub_AmountBeforeTax = dAmoutBeforTaxRowise;
          oIssueSubDetailsInfoArg.IssueSub_ProdDisAmt = dDisAmt;
          oIssueSubDetailsInfoArg.IssueSub_AmountBeforeDis = dAmountBeforeDiscount;
          oIssueSubDetailsInfoArg.IssueSub_Exmpvatncess = dAmoutBeforTaxRowise;

          oIssueSubDetailsInfoArg.IssueSub_SGSTTaxAmount = dSGSTTaxAmount;
          oIssueSubDetailsInfoArg.IssueSub_SGSTAmount = dSGSTAmount;
          oIssueSubDetailsInfoArg.IssueSub_CGSTTaxAmount = dCGSTTaxAmount;
          oIssueSubDetailsInfoArg.IssueSub_CGSTAmount = dCGSTAmount;
          oIssueSubDetailsInfoArg.IssueSub_IGSTTaxAmount = dIGSTTaxAmount;
          oIssueSubDetailsInfoArg.IssueSub_IGSTAmount = dIGSTAmount;
          oIssueSubDetailsInfoArg.IssueSub_CessAmt = dCessAmt;
          oIssueSubDetailsInfoArg.IssueSub_ExtraCessAmt = dAdditionalCessAmt;
          // if ($('#ddlAgentRateType').val() == $('#cbDiffPrice').val())
          //     oIssueSubDetailsInfoArg.Agent_SubAmount = dAmount - dTaxAmt-dCessAmt;
          // else
          oIssueSubDetailsInfoArg.Agent_SubAmount = dQty * dAgentPrice;


          if (strType === 'LOCAL' && strTaxName === 'MEDICINE') {
            oIssueSubDetailsInfoArg.IssueSub_TaxAmt = 0;
            oIssueSubDetailsInfoArg.IssueSub_TaxPers = 0;
          }

          const ID = oIssueSubDetailsInfoArg.IssueSub_Id;


        }

      }


    });


    if (dTotDisPersAll > 0) {
      this.IssueInfo.Issue_DisAmt = dTotDisAmtAll;
    }

    this.fnGetFinalTotal();

  }


  fnGetFinalTotal() {
    if (this.ListIssueSubDetailsInfo == null) {
      return;
    }
    // tslint:disable-next-line:prefer-const
    let strSoftwareName = '', strCustomerForSoftware = '', strAddOrMinus = '',
      // tslint:disable-next-line:prefer-const
      strRof = '', strSalesType = '';


    strSalesType = this.IssueInfo.Issue_Type;


    let dTotAmt = 0, dAmt = 0, dTaxAmt = 0, dTotTaxAmt = 0, dTotRetAmt = 0;
    let dTaxAmt1 = 0, dTaxAmt2 = 0, dTaxAmt3 = 0, dTaxAmt4 = 0, dTaxAmt5 = 0, dTaxId, dSalesRetAmt = 0, dPointValue = 0;
    let dAmt1 = 0, dAmt2 = 0, dAmt3 = 0, dAmt4 = 0, dAmt5 = 0, dOtherCharge = 0,
      dFreight = 0, dCreditNoteAmt = 0, dExpiryAmt = 0, dTotAgentPrice = 0;
    const strType = '';
    let dTaxAmt6 = 0, dTaxAmt7 = 0, dTaxAmt8 = 0, dTaxAmt9 = 0, dTaxAmt10 = 0,
      dTaxAmt11 = 0, dTaxAmt12 = 0, dTaxAmt13 = 0, dTaxAmt14 = 0, dTaxAmt15 = 0;
    let dAmt6 = 0, dAmt7 = 0, dAmt8 = 0, dAmt9 = 0, dAmt10 = 0, dAmt11 = 0, dAmt12 = 0, dAmt13 = 0, dAmt14 = 0, dAmt15 = 0;

    let dSGSTTaxAmt = 0, dCGSTTaxAmt = 0, dIGSTTaxAmt = 0, dSGSTAmt = 0, dCGSTAmt = 0, dIGSTAmt = 0;
    let dSGSTTaxAmt1 = 0, dSGSTTaxAmt2 = 0, dSGSTTaxAmt3 = 0, dSGSTTaxAmt4 = 0,
      dSGSTTaxAmt5 = 0, dSGSTTaxAmt6 = 0, dSGSTTaxAmt7 = 0, dSGSTTaxAmt8 = 0, dSGSTTaxAmt9 = 0,
      dSGSTTaxAmt10 = 0, dSGSTTaxAmt11 = 0, dSGSTTaxAmt12 = 0, dSGSTTaxAmt13 = 0, dSGSTTaxAmt14 = 0, dSGSTTaxAmt15 = 0;
    let dCGSTTaxAmt1 = 0, dCGSTTaxAmt2 = 0, dCGSTTaxAmt3 = 0, dCGSTTaxAmt4 = 0,
      dCGSTTaxAmt5 = 0, dCGSTTaxAmt6 = 0, dCGSTTaxAmt7 = 0, dCGSTTaxAmt8 = 0, dCGSTTaxAmt9 = 0,
      dCGSTTaxAmt10 = 0, dCGSTTaxAmt11 = 0, dCGSTTaxAmt12 = 0, dCGSTTaxAmt13 = 0, dCGSTTaxAmt14 = 0, dCGSTTaxAmt15 = 0;
    let dIGSTTaxAmt1 = 0, dIGSTTaxAmt2 = 0, dIGSTTaxAmt3 = 0, dIGSTTaxAmt4 = 0,
      dIGSTTaxAmt5 = 0, dIGSTTaxAmt6 = 0, dIGSTTaxAmt7 = 0, dIGSTTaxAmt8 = 0, dIGSTTaxAmt9 = 0,
      dIGSTTaxAmt10 = 0, dIGSTTaxAmt11 = 0, dIGSTTaxAmt12 = 0, dIGSTTaxAmt13 = 0, dIGSTTaxAmt14 = 0, dIGSTTaxAmt15 = 0;

    let dSGSTAmt1 = 0, dSGSTAmt2 = 0, dSGSTAmt3 = 0, dSGSTAmt4 = 0, dSGSTAmt5 = 0, dSGSTAmt6 = 0,
      dSGSTAmt7 = 0, dSGSTAmt8 = 0, dSGSTAmt9 = 0, dSGSTAmt10 = 0, dSGSTAmt11 = 0, dSGSTAmt12 = 0,
      dSGSTAmt13 = 0, dSGSTAmt14 = 0, dSGSTAmt15 = 0;
    let dCGSTAmt1 = 0, dCGSTAmt2 = 0, dCGSTAmt3 = 0, dCGSTAmt4 = 0, dCGSTAmt5 = 0, dCGSTAmt6 = 0,
      dCGSTAmt7 = 0, dCGSTAmt8 = 0, dCGSTAmt9 = 0, dCGSTAmt10 = 0, dCGSTAmt11 = 0, dCGSTAmt12 = 0,
      dCGSTAmt13 = 0, dCGSTAmt14 = 0, dCGSTAmt15 = 0;
    let dIGSTAmt1 = 0, dIGSTAmt2 = 0, dIGSTAmt3 = 0, dIGSTAmt4 = 0, dIGSTAmt5 = 0, dIGSTAmt6 = 0,
      dIGSTAmt7 = 0, dIGSTAmt8 = 0, dIGSTAmt9 = 0, dIGSTAmt10 = 0, dIGSTAmt11 = 0, dIGSTAmt12 = 0,
      dIGSTAmt13 = 0, dIGSTAmt14 = 0, dIGSTAmt15 = 0;

    let dOtherChgTaxAmt = 0, dOtherChgSGST = 0, dOtherChgCGST = 0, dOtherChgIGST = 0,
      dCourierChgTaxAmt = 0, dCourierChgSGST = 0, dCourierChgCGST = 0, dCourierChgIGST = 0;
    let dOtherChgTaxPers = 0, dCourierChgTaxPers = 0;

    let dCessAmt1 = 0, dCessAmt2 = 0, dCessAmt3 = 0, dCessAmt4 = 0, dCessAmt5 = 0, dCessAmt6 = 0,
      dCessAmt7 = 0, dCessAmt8 = 0, dCessAmt9 = 0, dCessAmt10 = 0;
    let dCessAmt11 = 0, dCessAmt12 = 0, dCessAmt13 = 0, dCessAmt14 = 0, dCessAmt15 = 0;
    let dRowCessAmt = 0, dRowAdditionalCessAmt = 0;
    let dAdditionalCessAmt1 = 0, dAdditionalCessAmt2 = 0, dAdditionalCessAmt3 = 0, dAdditionalCessAmt4 = 0;
    let dAdditionalCessAmt5 = 0, dAdditionalCessAmt6 = 0, dAdditionalCessAmt7 = 0, dAdditionalCessAmt8 = 0;
    let dAdditionalCessAmt9 = 0, dAdditionalCessAmt10 = 0, dAdditionalCessAmt11 = 0, dAdditionalCessAmt12 = 0;
    let dAdditionalCessAmt13 = 0, dAdditionalCessAmt14 = 0, dAdditionalCessAmt15 = 0;
    const strOtherTaxCondition = this.OtherAmtTaxCalculation;
    dOtherChgTaxPers = this.IssueInfo.Issue_OtherTaxPers;
    dCourierChgTaxPers = this.IssueInfo.Issue_CourierTaxPers;

    this.ListIssueSubDetailsInfo.forEach(oIssueSubDetailsInfoArg => {

      if (oIssueSubDetailsInfoArg.ProductId !== 0) {
        dAmt = dTaxAmt = 0;
        dSGSTTaxAmt = 0;
        dCGSTTaxAmt = 0;
        dIGSTTaxAmt = 0;
        dSGSTAmt = 0;
        dCGSTAmt = 0;
        dIGSTAmt = 0;
        dRowCessAmt = 0;
        dRowAdditionalCessAmt = 0;
        if (oIssueSubDetailsInfoArg.IssueSub_Amount !== 0) {
          if (strSoftwareName === 'RetailPharma') {
            dTotAmt += parseFloat(parseFloat(oIssueSubDetailsInfoArg.IssueSub_Amount).toFixed(3));
          } else {
            dTotAmt += parseFloat(parseFloat(oIssueSubDetailsInfoArg.IssueSub_Amount).toFixed(2));
          }
          dAmt = oIssueSubDetailsInfoArg.IssueSub_Amount;
          if (oIssueSubDetailsInfoArg.Color === 'R') {
            dTotRetAmt += oIssueSubDetailsInfoArg.IssueSub_Amount;
          }
          dTaxAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_TaxAmt || 0);
          dTotTaxAmt += dTaxAmt;
          dTotAgentPrice += parseFloat(oIssueSubDetailsInfoArg.Agent_SubAmount || 0);
          dSGSTTaxAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_SGSTTaxAmount || 0);
          dCGSTTaxAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_CGSTTaxAmount || 0);
          dIGSTTaxAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_IGSTTaxAmount || 0);
          dSGSTAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_SGSTAmount || 0);
          dCGSTAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_CGSTAmount || 0);
          dIGSTAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_IGSTAmount || 0);
          dRowCessAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_CessAmt || 0);
          dRowAdditionalCessAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_ExtraCessAmt || 0);
        }
        if (oIssueSubDetailsInfoArg.TaxId !== 0 && oIssueSubDetailsInfoArg.TaxId !== 0 &&
          oIssueSubDetailsInfoArg.IssueSub_GroupName !== 'MEDICINE') {
          dTaxId = oIssueSubDetailsInfoArg.TaxId;
          if (dTaxId === 1) {
            dTaxAmt1 += dTaxAmt;
            dCessAmt1 += dRowCessAmt;
            dAdditionalCessAmt1 += dRowAdditionalCessAmt;
            dAmt1 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt1 += dSGSTTaxAmt;
            dCGSTTaxAmt1 += dCGSTTaxAmt;
            dIGSTTaxAmt1 += dIGSTTaxAmt;
            dSGSTAmt1 += dSGSTAmt;
            dCGSTAmt1 += dCGSTAmt;
            dIGSTAmt1 += dIGSTAmt;
          } else if (dTaxId === 2) {
            dTaxAmt2 += dTaxAmt;
            dCessAmt2 += dRowCessAmt;
            dAdditionalCessAmt2 += dRowAdditionalCessAmt;
            dAmt2 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt2 += dSGSTTaxAmt;
            dCGSTTaxAmt2 += dCGSTTaxAmt;
            dIGSTTaxAmt2 += dIGSTTaxAmt;
            dSGSTAmt2 += dSGSTAmt;
            dCGSTAmt2 += dCGSTAmt;
            dIGSTAmt2 += dIGSTAmt;
          } else if (dTaxId === 3) {
            dTaxAmt3 += dTaxAmt;
            dCessAmt3 += dRowCessAmt;
            dAdditionalCessAmt3 += dRowAdditionalCessAmt;
            dAmt3 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt3 += dSGSTTaxAmt;
            dCGSTTaxAmt3 += dCGSTTaxAmt;
            dIGSTTaxAmt3 += dIGSTTaxAmt;
            dSGSTAmt3 += dSGSTAmt;
            dCGSTAmt3 += dCGSTAmt;
            dIGSTAmt3 += dIGSTAmt;
          } else if (dTaxId === 4) {
            dTaxAmt4 += dTaxAmt;
            dCessAmt4 += dRowCessAmt;
            dAdditionalCessAmt4 += dRowAdditionalCessAmt;
            dAmt4 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt4 += dSGSTTaxAmt;
            dCGSTTaxAmt4 += dCGSTTaxAmt;
            dIGSTTaxAmt4 += dIGSTTaxAmt;
            dSGSTAmt4 += dSGSTAmt;
            dCGSTAmt4 += dCGSTAmt;
            dIGSTAmt4 += dIGSTAmt;
          } else if (dTaxId === 5) {
            dTaxAmt5 += dTaxAmt;
            dCessAmt5 += dRowCessAmt;
            dAdditionalCessAmt5 += dRowAdditionalCessAmt;
            dAmt5 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt5 += dSGSTTaxAmt;
            dCGSTTaxAmt5 += dCGSTTaxAmt;
            dIGSTTaxAmt5 += dIGSTTaxAmt;
            dSGSTAmt5 += dSGSTAmt;
            dCGSTAmt5 += dCGSTAmt;
            dIGSTAmt5 += dIGSTAmt;
          } else if (dTaxId === 6) {

            dTaxAmt6 += dTaxAmt;
            dCessAmt6 += dRowCessAmt;
            dAdditionalCessAmt6 += dRowAdditionalCessAmt;
            dAmt6 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt6 += dSGSTTaxAmt;
            dCGSTTaxAmt6 += dCGSTTaxAmt;
            dIGSTTaxAmt6 += dIGSTTaxAmt;
            dSGSTAmt6 += dSGSTAmt;
            dCGSTAmt6 += dCGSTAmt;
            dIGSTAmt6 += dIGSTAmt;
          } else if (dTaxId === 7) {

            dTaxAmt7 += dTaxAmt;
            dCessAmt7 += dRowCessAmt;
            dAdditionalCessAmt7 += dRowAdditionalCessAmt;
            dAmt7 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt7 += dSGSTTaxAmt;
            dCGSTTaxAmt7 += dCGSTTaxAmt;
            dIGSTTaxAmt7 += dIGSTTaxAmt;
            dSGSTAmt7 += dSGSTAmt;
            dCGSTAmt7 += dCGSTAmt;
            dIGSTAmt7 += dIGSTAmt;
          } else if (dTaxId === 8) {
            dTaxAmt8 += dTaxAmt;
            dCessAmt8 += dRowCessAmt;
            dAdditionalCessAmt8 += dRowAdditionalCessAmt;
            dAmt8 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt8 += dSGSTTaxAmt;
            dCGSTTaxAmt8 += dCGSTTaxAmt;
            dIGSTTaxAmt8 += dIGSTTaxAmt;
            dSGSTAmt8 += dSGSTAmt;
            dCGSTAmt8 += dCGSTAmt;
            dIGSTAmt8 += dIGSTAmt;

          } else if (dTaxId === 9) {
            dTaxAmt9 += dTaxAmt;
            dCessAmt9 += dRowCessAmt;
            dAdditionalCessAmt9 += dRowAdditionalCessAmt;
            dAmt9 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt9 += dSGSTTaxAmt;
            dCGSTTaxAmt9 += dCGSTTaxAmt;
            dIGSTTaxAmt9 += dIGSTTaxAmt;
            dSGSTAmt9 += dSGSTAmt;
            dCGSTAmt9 += dCGSTAmt;
            dIGSTAmt9 += dIGSTAmt;
          } else if (dTaxId === 10) {
            dTaxAmt10 += dTaxAmt;
            dCessAmt10 += dRowCessAmt;
            dAdditionalCessAmt10 += dRowAdditionalCessAmt;
            dAmt10 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt10 += dSGSTTaxAmt;
            dCGSTTaxAmt10 += dCGSTTaxAmt;
            dIGSTTaxAmt10 += dIGSTTaxAmt;
            dSGSTAmt10 += dSGSTAmt;
            dCGSTAmt10 += dCGSTAmt;
            dIGSTAmt10 += dIGSTAmt;
          } else if (dTaxId === 11) {
            dTaxAmt11 += dTaxAmt;
            dCessAmt11 += dRowCessAmt;
            dAdditionalCessAmt11 += dRowAdditionalCessAmt;
            dAmt11 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt11 += dSGSTTaxAmt;
            dCGSTTaxAmt11 += dCGSTTaxAmt;
            dIGSTTaxAmt11 += dIGSTTaxAmt;
            dSGSTAmt11 += dSGSTAmt;
            dCGSTAmt11 += dCGSTAmt;
            dIGSTAmt11 += dIGSTAmt;
          } else if (dTaxId === 12) {
            dTaxAmt12 += dTaxAmt;
            dCessAmt12 += dRowCessAmt;
            dAdditionalCessAmt12 += dRowAdditionalCessAmt;
            dAmt12 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt12 += dSGSTTaxAmt;
            dCGSTTaxAmt12 += dCGSTTaxAmt;
            dIGSTTaxAmt12 += dIGSTTaxAmt;
            dSGSTAmt12 += dSGSTAmt;
            dCGSTAmt12 += dCGSTAmt;
            dIGSTAmt12 += dIGSTAmt;
          } else if (dTaxId === 13) {
            dTaxAmt13 += dTaxAmt;
            dCessAmt13 += dRowCessAmt;
            dAdditionalCessAmt13 += dRowAdditionalCessAmt;
            dAmt13 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt13 += dSGSTTaxAmt;
            dCGSTTaxAmt13 += dCGSTTaxAmt;
            dIGSTTaxAmt13 += dIGSTTaxAmt;
            dSGSTAmt13 += dSGSTAmt;
            dCGSTAmt13 += dCGSTAmt;
            dIGSTAmt13 += dIGSTAmt;
          } else if (dTaxId === 14) {
            dTaxAmt14 += dTaxAmt;
            dCessAmt14 += dRowCessAmt;
            dAdditionalCessAmt14 += dRowAdditionalCessAmt;
            dAmt14 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt14 += dSGSTTaxAmt;
            dCGSTTaxAmt14 += dCGSTTaxAmt;
            dIGSTTaxAmt14 += dIGSTTaxAmt;
            dSGSTAmt14 += dSGSTAmt;
            dCGSTAmt14 += dCGSTAmt;
            dIGSTAmt14 += dIGSTAmt;
          } else if (dTaxId === 15) {
            dTaxAmt15 += dTaxAmt;
            dCessAmt15 += dRowCessAmt;
            dAdditionalCessAmt15 += dRowAdditionalCessAmt;
            dAmt15 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt15 += dSGSTTaxAmt;
            dCGSTTaxAmt15 += dCGSTTaxAmt;
            dIGSTTaxAmt15 += dIGSTTaxAmt;
            dSGSTAmt15 += dSGSTAmt;
            dCGSTAmt15 += dCGSTAmt;
            dIGSTAmt15 += dIGSTAmt;
          }

        }
      }
    });


    this.ListIssueTaxInfo.forEach(oIssueTaxInfoArg => {

      if (oIssueTaxInfoArg.TaxId === 1) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt1;
        oIssueTaxInfoArg.Amount = dAmt1;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt1;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt1;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt1;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt1;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt1;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt1;
        oIssueTaxInfoArg.CessAmt = dCessAmt1;
        oIssueTaxInfoArg.AdditionalCessAmt = dAdditionalCessAmt1;
      } else if (oIssueTaxInfoArg.TaxId === 2) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt2;
        oIssueTaxInfoArg.Amount = dAmt2;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt2;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt2;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt2;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt2;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt2;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt2;
        oIssueTaxInfoArg.CessAmt = dCessAmt2;
        oIssueTaxInfoArg.AdditionalCessAmt = dAdditionalCessAmt2;
      } else if (oIssueTaxInfoArg.TaxId === 3) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt3;
        oIssueTaxInfoArg.Amount = dAmt3;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt3;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt3;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt3;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt3;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt3;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt3;
        oIssueTaxInfoArg.CessAmt = dCessAmt3;
        oIssueTaxInfoArg.AdditionalCessAmt = dAdditionalCessAmt3;
      } else if (oIssueTaxInfoArg.TaxId === 4) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt4;
        oIssueTaxInfoArg.Amount = dAmt4;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt4;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt4;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt4;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt4;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt4;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt4;
        oIssueTaxInfoArg.CessAmt = dCessAmt4;
        oIssueTaxInfoArg.AdditionalCessAmt = dAdditionalCessAmt4;
      } else if (oIssueTaxInfoArg.TaxId === 5) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt5;
        oIssueTaxInfoArg.Amount = dAmt5;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt5;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt5;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt5;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt5;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt5;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt5;
        oIssueTaxInfoArg.CessAmt = dCessAmt5;
        oIssueTaxInfoArg.AdditionalCessAmt = dAdditionalCessAmt5;
      } else if (oIssueTaxInfoArg.TaxId === 6) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt6;
        oIssueTaxInfoArg.Amount = dAmt6;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt6;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt6;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt6;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt6;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt6;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt6;
        oIssueTaxInfoArg.CessAmt = dCessAmt6;
        oIssueTaxInfoArg.AdditionalCessAmt = dAdditionalCessAmt6;
      } else if (oIssueTaxInfoArg.TaxId === 7) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt7;
        oIssueTaxInfoArg.Amount = dAmt7;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt7;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt7;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt7;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt7;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt7;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt7;
        oIssueTaxInfoArg.CessAmt = dCessAmt7;
        oIssueTaxInfoArg.AdditionalCessAmt = dAdditionalCessAmt7;
      } else if (oIssueTaxInfoArg.TaxId === 8) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt8;
        oIssueTaxInfoArg.Amount = dAmt8;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt8;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt8;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt8;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt8;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt8;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt8;
        oIssueTaxInfoArg.CessAmt = dCessAmt8;
        oIssueTaxInfoArg.AdditionalCessAmt = dAdditionalCessAmt8;
      } else if (oIssueTaxInfoArg.TaxId === 9) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt9;
        oIssueTaxInfoArg.Amount = dAmt9;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt9;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt9;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt9;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt9;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt9;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt9;
        oIssueTaxInfoArg.CessAmt = dCessAmt9;
        oIssueTaxInfoArg.AdditionalCessAmt = dAdditionalCessAmt9;
      } else if (oIssueTaxInfoArg.TaxId === 10) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt10;
        oIssueTaxInfoArg.Amount = dAmt10;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt10;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt10;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt10;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt10;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt10;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt10;
        oIssueTaxInfoArg.CessAmt = dCessAmt10;
        oIssueTaxInfoArg.AdditionalCessAmt = dAdditionalCessAmt10;
      } else if (oIssueTaxInfoArg.TaxId === 11) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt11;
        oIssueTaxInfoArg.Amount = dAmt11;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt11;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt11;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt11;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt11;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt11;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt11;
        oIssueTaxInfoArg.CessAmt = dCessAmt11;
        oIssueTaxInfoArg.AdditionalCessAmt = dAdditionalCessAmt11;
      } else if (oIssueTaxInfoArg.TaxId === 12) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt12;
        oIssueTaxInfoArg.Amount = dAmt12;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt12;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt12;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt12;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt12;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt12;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt12;
        oIssueTaxInfoArg.CessAmt = dCessAmt12;
        oIssueTaxInfoArg.AdditionalCessAmt = dAdditionalCessAmt12;
      } else if (oIssueTaxInfoArg.TaxId === 13) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt13;
        oIssueTaxInfoArg.Amount = dAmt13;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt13;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt13;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt13;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt13;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt13;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt13;
        oIssueTaxInfoArg.CessAmt = dCessAmt13;
        oIssueTaxInfoArg.AdditionalCessAmt = dAdditionalCessAmt13;
      } else if (oIssueTaxInfoArg.TaxId === 14) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt14;
        oIssueTaxInfoArg.Amount = dAmt14;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt14;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt14;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt14;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt14;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt14;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt14;
        oIssueTaxInfoArg.CessAmt = dCessAmt14;
        oIssueTaxInfoArg.AdditionalCessAmt = dAdditionalCessAmt14;
      } else if (oIssueTaxInfoArg.TaxId === 15) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt15;
        oIssueTaxInfoArg.Amount = dAmt15;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt15;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt15;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt15;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt15;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt15;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt15;
        oIssueTaxInfoArg.CessAmt = dCessAmt15;
        oIssueTaxInfoArg.AdditionalCessAmt = dAdditionalCessAmt15;
      }

    });
    // Get TCS Amount Calculation New
    let dTCSTaxableAmount = dAmt1 + dAmt2 + dAmt3 + dAmt4 + dAmt5 + dAmt6 + dAmt7 + dAmt8 + dAmt9 + dAmt10 + dAmt11 + dAmt12 + dAmt13 + dAmt14 + dAmt15;
    dTCSTaxableAmount = dTCSTaxableAmount + dTaxAmt1 + dTaxAmt2 + dTaxAmt3 + dTaxAmt4 + dTaxAmt5 + dTaxAmt6 + dTaxAmt7;
    dTCSTaxableAmount = dTCSTaxableAmount + dTaxAmt8 + dTaxAmt9 + dTaxAmt10 + dTaxAmt11 + dTaxAmt12 + dTaxAmt13 + dTaxAmt14 + dTaxAmt15;
    let dTCSTaxPers = this.IssueInfo.Issue_TCSPers;
    let dTCSTaxAmt = 0;
    if (dTCSTaxPers > 0) {
      dTCSTaxAmt = (dTCSTaxableAmount * dTCSTaxPers) / 100;
    }
    this.IssueInfo.Issue_TCSAmt = Number(dTCSTaxAmt.toFixed(2))

    dOtherCharge = parseFloat(<any>this.IssueInfo.Issue_OtherCharge || 0);
    dSalesRetAmt = this.IssueInfo.Issue_RetValue;
    dPointValue = this.IssueInfo.Issue_PointSaleValue;
    dFreight = this.IssueInfo.Issue_Freight;
    dCreditNoteAmt = this.IssueInfo.Issue_CrAmt;
    dExpiryAmt = this.IssueInfo.Issue_ExpiryAmt;

    if (strOtherTaxCondition === 'Yes') {

      dOtherChgTaxAmt = (dOtherCharge * dOtherChgTaxPers) / 100;
      dCourierChgTaxAmt = (dFreight * dCourierChgTaxPers) / 100;
      if (strSalesType === 'LOCAL') {
        dOtherChgSGST = (dOtherChgTaxAmt / 2);
        dOtherChgCGST = (dOtherChgTaxAmt / 2);
        dCourierChgSGST = (dCourierChgTaxAmt / 2);
        dCourierChgCGST = (dCourierChgTaxAmt / 2);
      } else {
        dOtherChgIGST = (dOtherChgTaxAmt);
        dCourierChgIGST = (dCourierChgTaxAmt);
      }
    }



    dTotAmt = dTotAmt + dOtherCharge + dFreight - dSalesRetAmt - dPointValue - dCreditNoteAmt - dExpiryAmt + dOtherChgTaxAmt + dCourierChgTaxAmt + dTCSTaxAmt;


    const dTotal = dTotAmt;

    this.IssueInfo.Issue_ROF = 0;
    const RofDiffValue = dTotAmt - Math.round(dTotAmt);

    if (strRof === 'Yes' && (RofDiffValue === 0.50 || RofDiffValue === (-0.50))) {
      dTotAmt += (0.001);
    }
    this.IssueInfo.Issue_Total = dTotAmt;
    this.IssueInfo.Issue_ATotal = dTotAmt;
    this.IssueInfo.Issue_RetValue = dTotRetAmt;
    this.IssueInfo.AgentSalesVaue = dTotAgentPrice;

    let dAgentMarginDis = 0, dTotAmtBeforeTaxForAgentSales, dAgentTDSAmt = 0;

    dTotAmtBeforeTaxForAgentSales = dAmt1 + dAmt2 + dAmt3 + dAmt4 + dAmt5 + dAmt6 + dAmt7 + dAmt8 + dAmt10;


    let dAgentSalesDiffAmt = 0;
    dAgentSalesDiffAmt = dTotAmtBeforeTaxForAgentSales - dTotAgentPrice;

    if (this.bAgentCommisionCalcOnMarginPers === 'Yes') {
      dAgentSalesDiffAmt = dTotAgentPrice;
      dAgentMarginDis = this.IssueInfo.AgentPers;
      this.IssueInfo.AgentMarginAmt = (dTotAgentPrice * dAgentMarginDis) / 100;
      dAgentTDSAmt = 0;
    } else {
      dAgentMarginDis = this.IssueInfo.AgentPers;

      dAgentTDSAmt = (dAgentSalesDiffAmt * dAgentMarginDis) / 100;
      this.IssueInfo.AgentMarginAmt = dAgentSalesDiffAmt - dAgentTDSAmt;
    }


    if (strRof === 'Yes') {
      this.IssueInfo.Issue_Total = Math.round(dTotAmt);
      const dROF = (this.IssueInfo.Issue_Total) - dTotAmt;
      this.IssueInfo.Issue_ROF = dROF;
    }


  }


  async fnsave() {


    await this.fnAmountCalculation();

    this.IssueInfo.BranchId = this.BranchId;
    this.IssueInfo.StaffId = this.staffId;
    this.IssueInfo.Remarks = this.Remarks;
    this.IssueInfo.GodownId = this.dTempGodownId;
    const StaffId = this.staffId;
    let ErrorMsg = '';
    let SaveFlag = 'Yes';
    this.ProductAddcart.forEach(ele => {
      const dOrginalRate = ele.Store_SellRate;
      const dQty = ele.Qty;
      const dFreQty = ele.Free;
      const dRetQty = 0;
      const dProductId = ele.ProductId;
      if (this.AcId == 0) {
        this.Alert('Select Customer !');
        return;
      }
      if (dProductId !== 0 && (dQty === 0 && dFreQty === 0 && dRetQty === 0)) {
        ErrorMsg = 'Remove Zero Qty Record';
        SaveFlag = 'No';
      }
      if (dProductId !== 0 && dOrginalRate === 0) {
        ErrorMsg = 'Remove Zero Rate Record';
        SaveFlag = 'No';
      }
    });
    if (SaveFlag === 'No') {
      this.Alert(ErrorMsg);
      // $('#ddlbillseries').focus();
      return;
    }


    let varArguements = {};
    varArguements = {
      SoftwareName: this.Softwarename, CustomerForSoftware: this.CustomerForSoftware, AddOrMinus: this.AddOrMinus,
      MrpIncluesiveSales: this.MrpInclusiveSales, TaxIncluded: '', Rof: this.SRof, PackCal: this.PackCal,
      RateDecimalPlace: this.RateDecimalPlace, strOtherTaxCondition: this.OtherAmtTaxCalculation,
      strAgentCommisionCalcOnMarginPers: 'No', strSameItemPrintOneLine: 'No',
      CessInclusiveInSales: this.bCessInclusiveInSales, AdditionalCessInclusiveInSales: this.bAdditionalCessInclusiveInSales
    };
    let dBillSerId = 0;

    const BillNo = this.billNo;
    const dUniqeuNo = this.UniqeuNo;
    const AcId = this.AcId;
    dBillSerId = this.IssueInfo.BillSerId; // this.BillSeriesSelected;

    if (dBillSerId === 0) {

      this.Alert('Select BillSeries');
      // $('#ddlbillseries').focus();
      return;
    }
    const SoftwareName = this.Softwarename;
    const PayTerms = this.IssueInfo.Issue_PayTerms;

    if (AcId === 0 && (SoftwareName === 'WholeSalePharma' || PayTerms === 'CREDIT')) {

      this.Alert('Select Customer');
      return;
    }

    const SalesMan = this.SalesManSelectedId;
    if (SalesMan === 0) {
      this.Alert('Select SalesMan');

      return;
    }
    this.IssueInfo.SalesExeId = Number(SalesMan);
    if (SaveFlag === 'No') {
      return;
    }


    if (this.ListIssueSubDetailsInfo.length === 0) {
      this.Alert('Enter product details');
      return;
    }
    const DictionaryObject = { dictArgmts: {} };
    DictionaryObject.dictArgmts = varArguements;
    this.IssueInfo.DirectRBank = this.times;
    this.IssueInfo.ListIssueSubDetailsInfo = this.ListIssueSubDetailsInfo;
    this.IssueInfo.ListIssueTaxInfo = this.ListIssueTaxInfo;
    this.IssueInfo.DictionaryObject = DictionaryObject;

    const body = JSON.stringify(this.IssueInfo);
    this.disSave = true;
    this.appserVice.fnApiPost(this.Apiurl + '/Sales/fnSaveGodownwise', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        const jsonobj = data;

        this.sendSms(jsonobj.JsonIssueInfo.Issue_SlNo);
        this.saveAndPrint(jsonobj.JsonIssueInfo);

      }, err => {

      });


  }
  alertProdName = ''

  async saveAndPrint(value) {

    const msg = 'Bill No ' + value.Issue_SlNo + '  Saved';
    const alert = await this.alertController.create({
      header: 'Save and Print',
      subHeader: 'Do you want Print?.',
      mode: "ios",
      message: msg,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.fnClear();
          }
        }, {
          text: 'Print',
          handler: () => {
            this.IssueInfo.Issue_SlNo = value.Issue_SlNo;
            this.IssueInfo.BillSerId = value.BillSerId;
            this.IssueInfo.UniqueBillNo = value.UniqueBillNo;
            this.fnPrintTable();
          }
        }
      ]
    });
    await alert.present();
  }

  fnproductClick(item) {

    if (item.StockQty === '0') {
      this.StockAlert();
      return;
    }
    this.alertProdName = item.ItemDesc;
    this.fnProductKeyDown(item.ProductId)
    // this.historyModal(item.ProductId);
    // this.presentPrompt(item);
    // this.ProductAddcart.push(item);
  }

  onRemove(product) {
    const index: number = this.ListIssueSubDetailsInfo.indexOf(product);
    if (index !== -1) {

      this.ListIssueSubDetailsInfo.splice(index, 1);
      // this.IssueInfo.Issue_Total = this.IssueInfo.Issue_Total - product.Issue_Total;
      this.IssueInfo.Issue_Total = this.IssueInfo.Issue_Total - product.IssueSub_Amount;
    }

  }

  async AcIdAlert() {
    const alert = await this.alertController.create({
      // header: 'Check',
      subHeader: 'Alert',
      message: 'Enter Customer Name!',
      mode: "ios",
      buttons: [{
        text: 'Ok',
        handler: () => {
          this.onAddCustomer();
        }
      }]
    });
    await alert.present();
  }

  async StockAlert() {
    const alert = await this.alertController.create({
      // header: 'Product',
      subHeader: 'Stock',
      message: 'Quantity Empty !',
      mode: "ios",
      buttons: ['OK']
    });
    await alert.present();
  }
  onReload() {
    location.reload()
  }

  async anchorClick(item, click) {
    this.ctrlService.onLoading('Loading...')
    this.ListIssueSubDetailsInfo = [];
    let objIssueInfo: any;
    let objIssueSubDetailsInfo: any;
    let objIssueTaxInfo: any;
    this.isDisabled = true;
    const varArguements = { BillSerId: item.BillSerId, BillNo: item.Issue_SlNo, UniqueNo: item.UniqueBillNo, BranchId: this.BranchId };

    await this.salesService.onAnchorClick(varArguements, this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise().then(data => {
        const jsonobj = data;
        objIssueInfo = JSON.parse(jsonobj.JsonIssueInfo);
        objIssueSubDetailsInfo = JSON.parse(jsonobj.JsonIssueSubDetailsInfo);
        objIssueTaxInfo = jsonobj.JsonIssueTaxInfo;
      }).finally(() => {
        this.ctrlService.hideLoader();
        if (click === 'anchor') {
          this.product_show = false;
          this.productPop = false;
          this.divshow = false;
          this.bBillListShow = false;
          this.shownNext = true;
          if (!this.editFlag) this.disSave = true;
        }
        // IssueSub_PerRate
        objIssueInfo.forEach(IssueMain => {
          this.IssueInfo = {
            'Issue_DisPers': IssueMain.Issue_DisPers, 'Issue_DisAmt': IssueMain.Issue_DisAmt,
            'Issue_RepAmt': IssueMain.Issue_RepAmt,
            'Issue_Type': IssueMain.Issue_Type, 'Issue_OtherCharge': IssueMain.Issue_OtherCharge,
            'Issue_RetValue': IssueMain.Issue_RetValue, 'Issue_PointSaleValue': IssueMain.Issue_PointSaleValue,
            'Issue_Freight': IssueMain.Issue_Freight,
            'Issue_CrAmt': IssueMain.Issue_CrAmt, 'Issue_ExpiryAmt': IssueMain.Issue_ExpiryAmt,
            'Issue_ROF': IssueMain.Issue_ROF, 'Issue_Total': IssueMain.Issue_Total, 'Issue_ATotal': IssueMain.Issue_ATotal,
            'AgentSalesVaue': IssueMain.AgentSalesVaue, 'Issue_OtherTaxPers': IssueMain.Issue_OtherTaxPers,
            'Issue_CourierTaxPers': IssueMain.Issue_CourierTaxPers,
            'BillSerId': IssueMain.BillSerId, 'AgentPers': IssueMain.AgentPers, 'AgentMarginAmt': IssueMain.AgentMarginAmt,
            'Issue_SlNo': IssueMain.Issue_SlNo, 'UniqueBillNo': IssueMain.UniqueBillNo, 'SalesExeId': Number(IssueMain.SalesExeId)
            , 'Issue_OrderNo': IssueMain.Issue_OrderNo, 'Issue_OrderDate': this.DateRet(IssueMain.Issue_OrderDate)
            , 'Issue_BillDate': this.DateRet(IssueMain.Issue_BillDate), 'Issue_CardExpDate': this.DateRet(IssueMain.Issue_CardExpDate),
            "Issue_ShippingTransporter": 'version 28042021','AcId': IssueMain.AcId, 'Issue_CustName': IssueMain.Issue_CustName, 'Remarks': IssueMain.Remarks, 'GodownId': this.dTempGodownId
            , DirectRBank: IssueMain.DirectRBank, "Issue_GSTinNo": IssueMain.Tin1, 'Issue_PayTerms': IssueMain.Issue_PayTerms, 'Issue_SaleType': String(IssueMain.Issue_SaleType),
            'Issue_AddCessFlag': IssueMain.Issue_AddCessFlag, 'Issue_TCSPers': IssueMain.Issue_TCSPers, 'Issue_TCSAmt': IssueMain.Issue_TCSAmt,
            BranchId: 0, StaffId: 0, ListIssueSubDetailsInfo: [],
            ListIssueTaxInfo: [], DictionaryObject: {}
          };

          this.custPhone = IssueMain.Phone;
          this.AcId = IssueMain.AcId;
          this.PaytermsSelected = IssueMain.Issue_PayTerms;
          this.BillSeriesSelected = IssueMain.BillSerId;
          this.ledgerAmount = IssueMain.LeaderAmt;
          this.UniqeuNo = IssueMain.UniqueBillNo;
          this.todays = this.DateRet(IssueMain.Issue_BillDate);
          this.AcName = IssueMain.Issue_CustName;
          this.Address = IssueMain.Addr1;

          this.Remarks = IssueMain.Remarks;
          this.SalesManSelectedId = Number(IssueMain.SalesExeId);
          this.PriceSelected = Number(IssueMain.Issue_SaleType);
          this.fnGetLeadgerAmtOnAcId(this.AcId);
          setTimeout(() => {
            this.billNo = IssueMain.Issue_SlNo;
          }, 400);

        });

        objIssueSubDetailsInfo.forEach(IssueSub => {

          this.IssueSubDetailsInfo = {
            ItemDesc: '', Store_BatchSlNo: '', IssueSub_Batch: '', IssueSub_Pack: '',
            IssueSub_ExpDate: '', IssueSub_PurRate: '', IssueSub_OriginalRate: 0, IssueSub_Mrp: '', IssueSub_Qty: 0,
            IssueSub_FreeQty: 0, IssueSub_Amount: '', IssueSub_TaxPers: 0, IssueSub_TaxAmt: '', IssueSub_PdodDis: '',
            IssueSub_TaxOn: '', IssueSub_TaxOnFree: '', IssueSub_GroupName: '', ProductId: '', TaxId: 0, IssueSub_ProdDisAmt: '', IssueSub_ActualTaxPers: 0,
            IssueSub_Type: '', IssueSub_SGSTTaxPers: 0, IssueSub_CGSTTaxPers: 0, IssueSub_IGSTTaxPers: 0,
            Field2: 0, IssueSub_AddDisPers: 0, AgentPrice: 0, Agent_SubAmount: 0, IssueSub_SpRate1: 0,
            IssueSub_SpRate2: 0, IssueSub_SpRate3: 0, IssueSub_SpRate4: 0, IssueSub_CessPers: 0,
            IssueSub_SpRate5: 0, BranchId: 0, IssueSub_CessAmt: 0, IssueSub_RQty: 0,
            AvilableQTY: 0, IssueSub_PerRate: 0, IssueSub_GodownId: 0,
          };

          this.IssueSubDetailsInfo.ItemDesc = IssueSub.ItemDesc;
          this.IssueSubDetailsInfo.Store_BatchSlNo = IssueSub.Store_BatchSlNo;
          this.IssueSubDetailsInfo.IssueSub_Batch = IssueSub.IssueSub_Batch;
          this.IssueSubDetailsInfo.IssueSub_Pack = IssueSub.IssueSub_Pack;
          this.IssueSubDetailsInfo.IssueSub_ExpDate = this.DateRetExpiryFormat(IssueSub.IssueSub_ExpDate);
          this.IssueSubDetailsInfo.IssueSub_PurRate = IssueSub.IssueSub_PurRate;
          this.IssueSubDetailsInfo.IssueSub_OriginalRate = Number(IssueSub.IssueSub_OriginalRate || 0);
          this.IssueSubDetailsInfo.IssueSub_Mrp = IssueSub.IssueSub_Mrp;
          this.IssueSubDetailsInfo.IssueSub_Qty = parseFloat(IssueSub.IssueSub_Qty);
          this.IssueSubDetailsInfo.IssueSub_FreeQty = parseFloat(IssueSub.IssueSub_FreeQty || 0);
          this.IssueSubDetailsInfo.IssueSub_Amount = IssueSub.IssueSub_Amount;
          this.IssueSubDetailsInfo.IssueSub_TaxPers = parseFloat(IssueSub.IssueSub_TaxPers);
          this.IssueSubDetailsInfo.IssueSub_TaxAmt = IssueSub.IssueSub_TaxAmt;
          this.IssueSubDetailsInfo.IssueSub_PdodDis = IssueSub.IssueSub_PdodDis;
          this.IssueSubDetailsInfo.IssueSub_TaxOn = IssueSub.IssueSub_TaxOn;
          this.IssueSubDetailsInfo.IssueSub_TaxOnFree = IssueSub.IssueSub_TaxOnFree;
          this.IssueSubDetailsInfo.IssueSub_GroupName = IssueSub.IssueSub_GroupName;
          this.IssueSubDetailsInfo.ProductId = IssueSub.ProductId;
          this.IssueSubDetailsInfo.TaxId = parseFloat(IssueSub.TaxId);
          this.IssueSubDetailsInfo.IssueSub_ProdDisAmt = IssueSub.IssueSub_ProdDisAmt;
          this.IssueSubDetailsInfo.IssueSub_ActualTaxPers = parseFloat(IssueSub.IssueSub_ActualTaxPers);
          this.IssueSubDetailsInfo.IssueSub_Type = IssueSub.IssueSub_Type;
          this.IssueSubDetailsInfo.IssueSub_SGSTTaxPers = IssueSub.IssueSub_SGSTTaxPers;
          this.IssueSubDetailsInfo.IssueSub_CGSTTaxPers = IssueSub.IssueSub_CGSTTaxPers;
          this.IssueSubDetailsInfo.IssueSub_IGSTTaxPers = IssueSub.IssueSub_IGSTTaxPers;
          this.IssueSubDetailsInfo.Field2 = IssueSub.Field2;
          this.IssueSubDetailsInfo.IssueSub_AddDisPers = IssueSub.IssueSub_AddDisPers;
          this.IssueSubDetailsInfo.AgentPrice = IssueSub.AgentPrice;
          this.IssueSubDetailsInfo.Agent_SubAmount = IssueSub.Agent_SubAmount;
          this.IssueSubDetailsInfo.IssueSub_SpRate1 = IssueSub.IssueSub_SpRate1;
          this.IssueSubDetailsInfo.IssueSub_SpRate2 = IssueSub.IssueSub_SpRate2;
          this.IssueSubDetailsInfo.IssueSub_SpRate3 = IssueSub.IssueSub_SpRate3;
          this.IssueSubDetailsInfo.IssueSub_SpRate4 = IssueSub.IssueSub_SpRate4;
          this.IssueSubDetailsInfo.IssueSub_SpRate5 = IssueSub.IssueSub_SpRate5;
          this.IssueSubDetailsInfo.IssueSub_RQty = IssueSub.IssueSub_RQty;
          this.IssueSubDetailsInfo.IssueSub_CessPers = parseFloat(IssueSub.IssueSub_CessPers);
          this.IssueSubDetailsInfo.IssueSub_CessAmt = IssueSub.IssueSub_CessAmt;
          this.IssueSubDetailsInfo.IssueSub_PerRate = IssueSub.IssueSub_PerRate;
          this.IssueSubDetailsInfo.BranchId = IssueSub.BranchId;
          this.IssueSubDetailsInfo.AvilableQTY = IssueSub.Store_BalQty + (IssueSub.IssueSub_Qty + IssueSub.IssueSub_FreeQty);
          this.IssueSubDetailsInfo.IssueSub_GodownId = this.dTempGodownId;
          this.IssueSubDetailsInfo.IssueSub_ExtraCessPers = IssueSub.IssueSub_ExtraCessPers;
          this.IssueSubDetailsInfo.IssueSub_ExtraCessAmt = IssueSub.IssueSub_ExtraCessAmt;

          this.ListIssueSubDetailsInfo.push(this.IssueSubDetailsInfo);

        });
        this.loading = false;
        if (click === 'print') {
          this.fnPrintTable();
        }
      }).catch((err) => {
        console.error(err);
      })


  }




  DateRet(value) {
    const BillDate = value;
    const BillDate1 = BillDate.split('-');
    const Dates = BillDate1[2] + '/' + BillDate1[1] + '/' + BillDate1[0];
    return Dates;
  }

  async sendSms(message) {
    const phone = this.custPhone;
    let strmsg = "";
    strmsg = this.strInvoiceSmsFormat;
    strmsg = strmsg.replace("(BranchName)", this.branchName)
    strmsg = strmsg.replace("(LedgerAmount)", String(this.ledgerAmount))
    strmsg = strmsg.replace("(BillDate)", this.IssueInfo.Issue_BillDate)
    strmsg = strmsg.replace("(BillNo)", message)
    strmsg = strmsg.replace("(BillTotal)", String(this.IssueInfo.Issue_Total))
    strmsg = strmsg.replace("(CustomerName)", this.AcName)
    // const sms = `Thank you for shopping order no:${message} generated..`;
    const regExp = /^[0-9]{10}$/;
    if (!regExp.test(phone)) {
      console.log('yes');
      // alert('Invalid MobileNo');
      return;
    }
    if (this.smsAlert == 'Yes') {
      const modal = await this.modalController.create({
        component: SmspopupModalComponent,
        mode: "ios",
        componentProps: {
          'phoneNo': phone,
          'sms': strmsg,
          'id': this.staffId,
          'branchid': this.BranchId
        }
      });
      return await modal.present();
    }
  }

  fnBillwiseOutstandingOnAcId() {

    this.salesService.onBillwiseOutstandingOnAcId(this.AcId, this.BranchId, this.Apiurl)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise().then(async data => {
        let jsonData = JSON.parse(data);
        const modal = await this.modalController.create({
          component: OutstandingModalComponent,
          mode: "ios",
          componentProps: { item: jsonData },
          backdropDismiss: true
        });
        return await modal.present();
      })
  }

  async errorToast(head: string, msg: string) {
    const toast = await this.toastCtrl.create({
      header: head,
      message: msg,
      duration: 3000,
      position: 'top',
      color: 'danger'

    });
    await toast.present();
  }

  async onAddCustomer() {
    const modal = await this.modalController.create({
      component: AddCustomerComponent,
      componentProps: {
        billSeriesId: this.BillSeriesSelected
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
