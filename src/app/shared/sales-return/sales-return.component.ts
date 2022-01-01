import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { AlertController, ModalController } from '@ionic/angular';
import { ProductsReturnModalComponent } from './products-return-modal/products-return-modal.component';
import { ProductReturnListComponent } from './product-return-list/product-return-list.component';
import { DatePipe } from '@angular/common';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { takeUntil } from 'rxjs/operators';
import { Alert } from 'selenium-webdriver';

@Component({
  selector: 'app-sales-return',
  templateUrl: './sales-return.component.html',
  styleUrls: ['./sales-return.component.scss'],
})
export class SalesReturnComponent implements OnInit {
  jsonSales: any[] = [];
  billSeries: any[] = [];
  customerSearch: any[] = [];
  billSearch: any[] = [];
  IssueSubDetailsInfo: any[] = [];
  taxSource: any[] = [];
  dTempPriceMenuId: number = 0;
  billTypes = "productwise";
  bSalesItemCode: boolean;
  dynamicHeader: any[] = [];
  totalTaxAmount: number;
  tempTaxSource: any;
  txtCopyBillNo: number = 0;
  txtUniqueNo: number = 0;
  btnSave: boolean = true;
  private _unsubscribeAll: Subject<any>;
  constructor(private appservice: AppService, private modalController: ModalController,
    public ctrlService: ControlService,
    public alertController: AlertController, private datePipe: DatePipe,
    private router: Router) { }
  StaffId: any;
  branchId: any;
  Apiurl: any;
  public txtBillNo: number = 0;
  today = new Date();
  IssueInfo = {
    UniqueBillNo: 0,
    BillSerId: 0,
    Issue_SlNo: 0,
    IssueRetSlNo: 0,
    IssueRetDate: this.today,
    Issue_BillDate: this.today,
    Issue_DisPers: 0,
    Issue_DisAmt: 0,
    AcId: 0,
    Issue_CustName: "",
    Issue_DoctId: 0,
    Issue_DoctName: "",
    SalesExeId: 0,
    Issue_NoOfProducts: 0,
    Issue_PayTerms: "",
    Issue_CardNo: "",
    Issue_CardName: "",
    Issue_Banker: "",
    Issue_DueDate: "",
    Issue_Transporter: "",
    Issue_LRNo: "",
    Issue_Cases: 0,
    Issue_OrderNo: "",
    Issue_BankCharge: 0,
    Issue_Postage: 0,
    Issue_CrAmt: 0,
    Issue_DbAmt: 0,
    Issue_Freight: 0,
    Issue_OtherCharge: 0,
    Issue_ExpiryAmt: 0,
    Issue_ExpiryId: 0,
    Issue_RepAmt: 0,
    Issue_DTotal: 0,
    Issue_ATotal: 0,
    Issue_CSTPers: 0,
    Issue_CSTAmt: 0,
    Issue_ROF: 0,
    Issue_Cancel: "No",
    Issue_Type: "LOCAL",
    Issue_Block: "",
    DelFlag: "",
    CrditNoteNos: "",
    ExpCrNoteNos: "",
    VType_SlNo: 0,
    Trans_VoucherNo: 0,
    ExcemptedValue: 0,
    MRPValue: 0,
    SaleValue: 0,
    VatCollected: 0,
    Issue_CstType: "",
    DirectRBank: "",
    BCLIssued: "",
    Issue_PaymentFlag: "",
    CrditNoteDates: "",
    ExpCrNoteDates: "",
    Issue_AgentId: 0,
    Issue_Print: false,
    Field1: "",
    Issue_PaidAmount: 0,
    Issue_ChellaNo: "",
    Issue_AddDis: 0,
    Issue_MinusDis: 0,
    Remarks: "",
    Field2: "",
    Field3: "",
    Issue_RetValue: 0,
    Issue_PointSaleValue: 0,
    Issue_PointAmount: 0,
    Issue_NoOfPoints: 0,
    IssueRet_PayTerms: "CREDIT",
    Issue_Field1: "",
    Issue_AgentMarginPers: 0,
    Issue_AgentMarginAmt: 0,
  };
  public settings = {
    SoftwareName: "",
    AddOrMinus: "",
    CustomerForSoftware: "",
    SetRof: "",
    MrpInclusiveSales: "",
    PackCal: "",
    QtyDecimalPlace: "",
    SettingBatch: "",
    SettingExpiry: "",
    PrintFormat: "",
    PrintName: "",
    PaymentOption: "",
    PrintTypePreview: "",
    PrintType: "",
    TaxIncluded: "",
    RateDecimalPlace: "",
    strGlobalTaxName: "",
    strAgentCommisionCalcCondition: "",
    strBatchDisplayName: "",
    ReturnBillPost: ""
  };
  ngOnInit() {
    this._unsubscribeAll = new Subject();


    this.ctrlService.get('SessionBranchId').then((val) => {
      if (val != null) {
        this.branchId = val;
      }
    });
    this.ctrlService.get('sessionInvenBranchId').then((val) => {
      if (val != null) {
        this.branchId = val;
      }
    });

    this.ctrlService.get('SessionSalesmanId').then((val) => {
      if (val != null) {
        this.StaffId = val;
      }
    });

    this.ctrlService.get('sessionInvenStaffId').then((val) => {
      if (val != null) {
        this.StaffId = val;
      }
    });

    this.ctrlService.get('sessionsurl').then((val) => {
      if (val != null) {
        this.Apiurl = val;
        this.fnSettings();
      }
    });

    // let time = new Observable<string>(observer => {
    //   setInterval(() => observer.next(new Date().toString()), 1000);
    // });

  };

  fnchangeBill(eve) {
    this.fnClear();
  }

  fnClear() {
    this.IssueSubDetailsInfo = [];
    this.IssueInfo = {
      UniqueBillNo: 0,
      BillSerId: 0,
      Issue_SlNo: 0,
      IssueRetSlNo: 0,
      IssueRetDate: this.today,
      Issue_BillDate: this.today,
      Issue_DisPers: 0,
      Issue_DisAmt: 0,
      AcId: 0,
      Issue_CustName: "",
      Issue_DoctId: 0,
      Issue_DoctName: "",
      SalesExeId: 0,
      Issue_NoOfProducts: 0,
      Issue_PayTerms: "",
      Issue_CardNo: "",
      Issue_CardName: "",
      Issue_Banker: "",
      Issue_DueDate: "",
      Issue_Transporter: "",
      Issue_LRNo: "",
      Issue_Cases: 0,
      Issue_OrderNo: "",
      Issue_BankCharge: 0,
      Issue_Postage: 0,
      Issue_CrAmt: 0,
      Issue_DbAmt: 0,
      Issue_Freight: 0,
      Issue_OtherCharge: 0,
      Issue_ExpiryAmt: 0,
      Issue_ExpiryId: 0,
      Issue_RepAmt: 0,
      Issue_DTotal: 0,
      Issue_ATotal: 0,
      Issue_CSTPers: 0,
      Issue_CSTAmt: 0,
      Issue_ROF: 0,
      Issue_Cancel: "No",
      Issue_Type: "LOCAL",
      Issue_Block: "",
      DelFlag: "",
      CrditNoteNos: "",
      ExpCrNoteNos: "",
      VType_SlNo: 0,
      Trans_VoucherNo: 0,
      ExcemptedValue: 0,
      MRPValue: 0,
      SaleValue: 0,
      VatCollected: 0,
      Issue_CstType: "",
      DirectRBank: "",
      BCLIssued: "",
      Issue_PaymentFlag: "",
      CrditNoteDates: "",
      ExpCrNoteDates: "",
      Issue_AgentId: 0,
      Issue_Print: false,
      Field1: "",
      Issue_PaidAmount: 0,
      Issue_ChellaNo: "",
      Issue_AddDis: 0,
      Issue_MinusDis: 0,
      Remarks: "",
      Field2: "",
      Field3: "",
      Issue_RetValue: 0,
      Issue_PointSaleValue: 0,
      Issue_PointAmount: 0,
      Issue_NoOfPoints: 0,
      IssueRet_PayTerms: "CREDIT",
      Issue_Field1: "",
      Issue_AgentMarginPers: 0,
      Issue_AgentMarginAmt: 0,
    }
    this.btnSave = true;
    this.invoBill = '';
    this.txtBillNo = 0;

    this.txtCopyBillNo = 0;
    this.txtUniqueNo = 0
    if (this.jsonSales.length)
      this.IssueInfo.SalesExeId = this.jsonSales[0].AC_Id;
    if (this.billSeries.length)
      this.IssueInfo.BillSerId = this.billSeries[0].BillSerId;
    this.fnGetMaxBillNo();
  }

  fnSettings() {

    var dictArgmts = { ProcName: 'Settings_GetValues' };

    let body = JSON.stringify(dictArgmts);

    this.appservice.fnApiPost(this.Apiurl + '/Master/fnSettings', body)
      .pipe(takeUntil(this._unsubscribeAll)).toPromise()
      .then(data => {
        let jsonSettings: any = data;
        jsonSettings.forEach((_settings) => {
          switch (_settings.KeyValue) {
            case "ProductName":
              this.settings.SoftwareName = _settings.Value;
              break;

            case "Neethi":
              this.settings.AddOrMinus = _settings.Value;
              break;

            case "Customer":
              this.settings.CustomerForSoftware = _settings.Value;
              break;
            case "SRof":
              this.settings.SetRof = _settings.Value;
              break;

            case "MRPINCLUSIVESALES":
              this.settings.MrpInclusiveSales = _settings.Value;
              break;
            case "PackCal":
              this.settings.PackCal = _settings.Value;
              break;
            case "QtyDecPlace":
              this.settings.QtyDecimalPlace = _settings.Value;
              break;
            case "SaleBatch":
              this.settings.SettingBatch = _settings.Value;
              break;
            case "SaleExpiry":
              this.settings.SettingExpiry = _settings.Value;
              break;

            case "PrintFormat":
              this.settings.PrintFormat = _settings.Value;
              break;
            case "SalesReturnPrint":
              this.settings.PrintName = _settings.Value;
              break;
            case "ReturnCashPayment":
              this.settings.PaymentOption = _settings.Value;
              break;
            case "SalesReturnPreview":
              this.settings.PrintTypePreview = _settings.Value;
              break;
            case "ReturnPrintType":
              this.settings.PrintType = _settings.Value;
              break;
            case "DecimalPlace":
              this.settings.RateDecimalPlace = _settings.Value;
              break;
            case "ItemSearch":
              break;
            case "BatchNoBarcodeInSales":
              break;
            case "SalesItemCode":
              if (_settings.Value == "Yes") {
                this.bSalesItemCode = true;
              }
              break;
            case "TaxName":
              this.settings.strGlobalTaxName = _settings.Value;
              break;
            case "TaxIncluded":
              this.settings.TaxIncluded = _settings.Value;
              break;

            case "AgentInSales":
              break;

            case "AgentCommisionCalcOnMarginPers":
              this.settings.strAgentCommisionCalcCondition = _settings.Value;
              break;

            case "BatchDisplayName":
              this.settings.strBatchDisplayName = _settings.Value;
              break;

            default:
              break;
          }
        });

      }).finally(() => {
        this.fnVoucherSettingsGets();
      });
  }

  fnVoucherSettingsGets() {
    let ServiceParams = {};
    ServiceParams["strProc"] = "VoucherSettings_GetsForSettings";
    let body = JSON.stringify(ServiceParams)
    let condition = "";
    this.appservice.fnApiPost(this.Apiurl + '/CommonQuery/fnGetDataReportNew', body)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        let data: any = res;
        let jsonobj = JSON.parse(data);
        for (const iterator of jsonobj) {
          if (iterator.Setting_Name == "IssueReturn") {
            this.settings.ReturnBillPost = iterator.Setting_Condition
            if (iterator.Setting_Condition == "Bill") {
              condition = " Return amount is adjusted in next bill.";
              // bReturnAccountsPost = false;
            } else {
              condition = " Return amount is adjusted in accounts.";
            }
          }
        }
        this.fnSalesManGets();
      });
  }
  // isNumber(val): boolean { return typeof val === 'number'; }

  fnSalesManGets() {
    let ServiceParams = {};
    ServiceParams["strProc"] = "SalesExecutive_GetsNew";

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "SalesExe_Name";
    ProcParams["strArgmt"] = "";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(this.branchId);
    oProcParams.push(ProcParams);
    ServiceParams["oProcParams"] = oProcParams;
    let body = JSON.stringify(ServiceParams)
    this.appservice.fnApiPost(this.Apiurl + '/CommonQuery/fnGetDataReportNew', body)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {
        let data: any = res;
        let jsonobj = JSON.parse(data);
        this.jsonSales = jsonobj;
        this.IssueInfo.SalesExeId = jsonobj[0].AC_Id;
        this.fnBillSeries_Gets();
      });
  }

  fnBillSeries_Gets() {
    let ServiceParams = {};
    ServiceParams["strProc"] = "BillSeries_GetsStaffwise";

    let oProcParams = [];
    let ProcParams = {};

    ProcParams["strKey"] = "StaffId";
    ProcParams["strArgmt"] = String(this.StaffId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(this.branchId);
    oProcParams.push(ProcParams);
    ServiceParams["oProcParams"] = oProcParams;
    let body = JSON.stringify(ServiceParams)
    this.appservice.fnApiPost(this.Apiurl + '/CommonQuery/fnGetDataReportBranchStaff', body)
      .pipe(takeUntil(this._unsubscribeAll)).subscribe((res) => {
        let data: any = res;
        let jsonData = JSON.parse(data);
        this.billSeries = jsonData;
        this.IssueInfo.BillSerId = jsonData[0].BillSerId;

        this.fnTaxGets();
      });
  }

  fnTaxGets() {

    let ProcName = { ProcName: "Tax_Gets" };
    let body = JSON.stringify(ProcName);
    this.appservice.fnApiPost(this.Apiurl + "/Master/TaxGets", body)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((res) => {

        this.taxSource = res;
        this.tempTaxSource = res;
        //  this.fnHideTaxGroup();

      });
  }

  fnHideTaxGroup() {
    let ServiceParams = {};
    ServiceParams['strProc'] = "Tax_Gets";
    let body = JSON.stringify(ServiceParams);
    this.appservice.fnApiPost(this.Apiurl + '/CommonQuery/fnGetData', body)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        let jsonData = JSON.parse(res);

        let result = this.taxSource.filter(o => !jsonData.some(({ TaxID }) => o.Active != 1 && o.TaxID == TaxID));
        result.map(x => {
          return x.Amount = 0, x.TaxAmount = 0, x.SGSTTaxAmount = 0, x.CGSTTaxAmount = 0, x.IGSTTaxAmount = 0
        })
        // Amount TaxAmount SGSTTaxAmount CGSTTaxAmount IGSTTaxAmount
        // console.log(result);
        this.taxSource = result;
        this.fnGetMaxBillNo();
      });
  }


  fnGetMaxBillNo() {
    let dictArgmts = { BranchId: this.branchId };
    let DictionaryObject = {};
    DictionaryObject["dictArgmts"] = dictArgmts;
    DictionaryObject["ProcName"] = "IssueReturn_GetMaxBillNo";
    let body = JSON.stringify(DictionaryObject);
    if (this.Apiurl)
      this.appservice.fnApiPost(this.Apiurl + '/Sales/SalesReturn_GetMaxBillNo', body)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((res) => {
          this.txtBillNo = Number(res);
          this.fnColOrderForHeader();
        });
  }

  fnBillNoSearch(event) {
    const keyword = event.target.value;
    if (keyword == "") {
      this.customerSearch = [];
      return;
    }
    let ServiceParams = {};
    ServiceParams["strProc"] = "Issue_SearchForInvoiceReturn";
    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "Search";
    ProcParams["strArgmt"] = String(keyword);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(this.branchId);
    oProcParams.push(ProcParams);
    ServiceParams["oProcParams"] = oProcParams;
    let body = JSON.stringify(ServiceParams);
    this.appservice.fnApiPost(this.Apiurl + "/CommonQuery/fnGetDataReport", body)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        let data: any = res;
        let jsonSupplier = JSON.parse(data);
        if (jsonSupplier.length) {
          this.billSearch = jsonSupplier;
        } else {
          this.billSearch = [];
        }
      });
  }
  invoBill: string = '';
  fnBillClick(eve) {
    let BillSerId = eve.BillSerId;
    let BillNo = eve.Issue_SlNo;
    let UniqueNo = eve.UniqueBillNo;
    this.invoBill = eve.InvoiceNo
    this.IssueInfo.Issue_SlNo = BillNo
    this.IssueInfo.Issue_DoctId = UniqueNo
    this.IssueInfo.BillSerId = BillSerId
    this.billSearch = [];
    this.fnCopyBillNo(BillSerId, BillNo, UniqueNo);
  }

  fnCustomerSearch(event) {

    const keyword = event.target.value;
    if (keyword == "") {
      this.customerSearch = [];
      return;
    }

    let ServiceParams = {};
    ServiceParams["strProc"] = "AccountHead_SearchForReturn";

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "AC_Name";
    ProcParams["strArgmt"] = keyword;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(this.branchId);
    oProcParams.push(ProcParams);
    ServiceParams["oProcParams"] = oProcParams;
    let body = JSON.stringify(ServiceParams)
    this.appservice.fnApiPost(this.Apiurl + '/CommonQuery/fnGetDataReportNew', body)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        let data: any = res;
        let jsonSupplier = JSON.parse(data);
        if (jsonSupplier.length) {
          this.customerSearch = jsonSupplier;
        } else {
          this.customerSearch = [];
        }

      })

  }

  fncustomerClick(eve) {
    this.IssueInfo.AcId = eve.AC_Id;
    this.IssueInfo.Issue_CustName = eve.AC_Name;
    this.IssueInfo.Issue_Type = eve.PurType;
    this.IssueInfo.Issue_Field1 = eve.Tin1;
    this.dTempPriceMenuId = parseFloat(eve.PriceMenu || 0);
    this.customerSearch = [];
  }

  fnCopyBillNo(value1, value, UniqueNo) {
    let varArguements = {};
    varArguements = {
      BillSerId: value1,
      BillNo: value,
      UniqueNo: UniqueNo,
      BranchId: this.branchId,
    };

    let DictionaryObject = {};
    DictionaryObject["dictArgmts"] = varArguements;
    let body = JSON.stringify(DictionaryObject);
    this.appservice.fnApiPost(this.Apiurl + '/Sales/Sales_CopyForInvoiceReturn', body)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        let res: any = data;


        let JsonIssueSubDetailsInfo = JSON.parse(res.JsonIssueSubDetailsInfo);
        let JsonIssueTaxInfo = JSON.parse(res.JsonIssueTaxInfo);
        let JsonIssueInfo = JSON.parse(res.JsonIssueInfo);


        this.IssueInfo = JsonIssueInfo[0];
        this.IssueInfo.IssueRet_PayTerms = "CREDIT";
        this.IssueInfo.AcId = JsonIssueInfo[0].AC_Id;

        this.IssueInfo.Issue_DoctId = JsonIssueInfo[0].UniqueBillNo;
        this.IssueInfo.IssueRetDate = this.today;

        this.IssueInfo.Issue_AgentId = JsonIssueInfo[0].AgentId;
        this.IssueInfo.Issue_AgentMarginPers = JsonIssueInfo[0].AgentPers;
        this.IssueInfo.Issue_AgentMarginAmt = JsonIssueInfo[0].AgentMarginAmt;
        // this.txtAddress = JsonIssueInfo[0].Addr1;
        // this.IssueInfo.Issue_Field1 = JsonIssueInfo[0].Tin1;
        this.IssueInfo.Issue_Field1 = JsonIssueInfo[0].Issue_GSTinNo;
        this.IssueInfo.SalesExeId = JsonIssueInfo[0].SalesManId;
        this.IssueInfo.Issue_DoctId = parseFloat(JsonIssueInfo[0].UniqueBillNo || 0);
        if (JsonIssueInfo[0].Issue_Cancel == "Yes") {
          // this.btnSave = false;
        }
        this.IssueSubDetailsInfo = JsonIssueSubDetailsInfo;

        let id = 0;
        for (const ter of JsonIssueSubDetailsInfo) {
          this.IssueSubDetailsInfo[id].IssueSub_Repl = ter.IssueSub_GroupName;
          this.IssueSubDetailsInfo[id].IssueRetSub_InclusiveSales = ter.Field2;
          this.IssueSubDetailsInfo[id].IssueSub_ExpDate = dateRetExpiryFormat(ter.IssueSub_ExpDate);
          this.IssueSubDetailsInfo[id].IssueSub_AmountBeforeTax = ter.IssueSub_Exmpvatncess
          id += 1
        }
        let result = this.taxSource.filter(o => !JsonIssueTaxInfo.some(({ TaxId }) => o.Active != 1 && o.TaxID == TaxId));
        result.map(x => {
          return x.Amount = 0, x.TaxAmount = 0, x.SGSTTaxAmount = 0, x.CGSTTaxAmount = 0, x.IGSTTaxAmount = 0
        })
        this.fnGetFinalAmt();
      });
  }

  fnColOrderForHeader() {

    let _columnHeader = [{ name: "Del", col: 'Del' }, { name: "No", col: 'no' }];
    if (this.bSalesItemCode) _columnHeader.push({ name: "tblItemCode", col: 'ItemCode' });
    _columnHeader.push({ name: "Item Name", col: 'ItemDesc' });
    if (this.billTypes == "billwise") _columnHeader.push({ name: "OldRQty", col: 'BillRetQty' });
    let varParams = {};
    varParams = { ControlType: "Return", BranchId: this.branchId };

    let DictionaryObject = {};
    DictionaryObject["dictArgmts"] = varParams;
    DictionaryObject["ProcName"] = "ControlOrder_GetOnType";
    let body = JSON.stringify(DictionaryObject)
    this.appservice.fnApiPost(this.Apiurl + '/Purchase/fnGetControlOrder', body)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        const columData: any = res;
        for (const col of columData) {
          if (col.ControlName == "SRBatch" && col.ControlOrder != 0) {

            _columnHeader.push({ name: this.settings.strBatchDisplayName, col: 'IssueSub_Batch' });

          }

          if (col.ControlName == "SRExpiry" && col.ControlOrder != 0) {

            _columnHeader.push({ name: "Expiry", col: 'IssueSub_ExpDate' });
          }

          if (col.ControlName == "SRRate" && col.ControlOrder != 0) {
            _columnHeader.push({ name: "Rate", col: 'IssueSub_OriginalRate' });
          }

          if (col.ControlName == "SRQty" && col.ControlOrder != 0) {
            if (this.billTypes == "billwise") _columnHeader.push({ name: "Qty", col: 'IssueSub_Qty' });
            _columnHeader.push({ name: "RQty", col: 'IssueSub_RQty' })
          }

          if (col.ControlName == "SRMrp" && col.ControlOrder != 0) {
            _columnHeader.push({ name: "Mrp", col: 'IssueSub_Mrp' })
          }

          if (col.ControlName == "SRFree" && col.ControlOrder != 0) {
            if (this.billTypes == "billwise")
              _columnHeader.push({ name: "Free", col: 'IssueSub_FreeQty' })
            _columnHeader.push({ name: "RFree", col: 'IssueSub_RFreeQty' })

          }

          if (col.ControlName == "SRDisPers" && col.ControlOrder != 0) {
            _columnHeader.push({ name: "DisPers", col: 'IssueSub_PdodDis' })
          }

          if (col.ControlName == "SRDisAmt" && col.ControlOrder != 0) {
            _columnHeader.push({ name: "DisAmt", col: 'IssueSub_ProdDisAmt' })
          }

          if (col.ControlName == "SRPack" && col.ControlOrder != 0) {
            _columnHeader.push({ name: "Pack", col: 'IssueSub_Pack' })
          }

          if (this.billTypes == "productwise") {
            if (col.ControlName == "SRBillNo" && col.ControlOrder != 0) {
              _columnHeader.push({ name: "BillNo", col: 'Issue_SlNo' })

            }
            if (col.ControlName == "SRBillPrefix" && col.ControlOrder != 0) {
              _columnHeader.push({ name: "BillPrefix", col: 'BillSerId' })
            }
            if (col.ControlName == "SRInclusiveSales" && col.ControlOrder != 0) {
              // _columnHeader.push({name:"IncSales",col: 'IssueRetSub_InclusiveSales'})
            }
            if (col.ControlName == "SRBillDate" && col.ControlOrder != 0) {
              _columnHeader.push({ name: "BillDate", col: 'Issue_BillDate' })
            }
          }
        }
        let taxPers = `${this.settings.strGlobalTaxName}%`;
        let taxAmt = `${this.settings.strGlobalTaxName}Amt`;
        _columnHeader.push({ name: taxPers, col: 'IssueSub_TaxPers' },
          { name: taxAmt, col: 'IssueSub_TaxAmt' },
          { name: 'Amount', col: 'IssueSub_Amount' })

        if (this.billTypes == "billwise") _columnHeader.push({ name: 'RetAmount', col: 'IssueSub_RetAmount' })
        this.dynamicHeader = _columnHeader;

      });
  }

  removeItem(index) {

    if (this.billTypes == "billwise")
      return

    this.IssueSubDetailsInfo.splice(index, 1);
    this.fnGetTotal();

  }

  async productListModal() {
    const modal = await this.modalController.create({
      component: ProductReturnListComponent,
      cssClass: 'my-custom-class',
      mode: "ios",
      backdropDismiss: false,
      componentProps: {
        printName: this.settings.PrintName
      }
    });
    modal.onDidDismiss().then((res) => {

      if (res.data) {
        this.anchorClick(res.data.params);
      }
      this.fnClear();
    });

    return await modal.present();
  }
  async productModal() {
    const modal = await this.modalController.create({
      component: ProductsReturnModalComponent,
      cssClass: 'my-custom-class',
      mode: "ios",
      backdropDismiss: false,
      componentProps: {
        'acid': this.IssueInfo.AcId,
        'pricemenuid': this.dTempPriceMenuId,
        'mrpInclusive': this.settings.MrpInclusiveSales,
        'products': this.IssueSubDetailsInfo
      }
    });
    modal.onDidDismiss().then((res) => {
      if (res.data) {
        this.IssueSubDetailsInfo = res.data.params;
        this.IssueSubDetailsInfo.map(x => {
          if (!x.BillSerId) {
            x.BillSerId = this.billSeries[0].BillSerId;
          }
        });

        this.fnGetTotal();
      }
    });

    return await modal.present();

  }

  anchorClick(item) {

    let BillNo = item.BillNo;
    let UniqueBillNo = item.UniqueBillNo;

    let varArguements = {};
    varArguements = { BillNo: BillNo, UniqueNo: UniqueBillNo, BranchId: this.branchId };

    let DictionaryObject = {};
    DictionaryObject["dictArgmts"] = varArguements;
    let body = JSON.stringify(DictionaryObject)
    this.appservice.fnApiPost(this.Apiurl + '/Sales/fnSalesReturn_Copy', body)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        let JsonIssueSubDetailsInfo = JSON.parse(res.JsonIssueSubDetailsInfo);
        let JsonIssueTaxInfo = JSON.parse(res.JsonIssueTaxInfo);
        let JsonIssueInfo = JSON.parse(res.JsonIssueInfo);
        if (JsonIssueInfo[0].Issue_SlNo) {
          this.billTypes = "billwise"
        } else {
          this.billTypes = "productwise"
        }
        setTimeout(() => {

          this.txtBillNo = JsonIssueInfo[0].IssueRetSlNo;
          this.txtCopyBillNo = JsonIssueInfo[0].IssueRetSlNo;
          this.txtUniqueNo = JsonIssueInfo[0].UniqueNo;
          this.IssueSubDetailsInfo = JsonIssueSubDetailsInfo;
          this.IssueSubDetailsInfo.map(x => {

            x.IssueSub_ExpDate = this.dateRetExpiryFormat(x.IssueSub_ExpDate);
            x.IssueSub_AmountBeforeTax = x.IssueSub_Exmpvatncess;

            if (this.billTypes == "billwise") {
              x.Issue_BillDate = this.DateRetCopy(x.Issue_BillDate);
            } else {
              x.Issue_BillDate = this.DateRet(x.Issue_BillDate);
            }
            x.IssueSub_RetAmount = x.IssueSub_Amount;
            x.IssueSub_Amount = this.billTypes == 'billwise' ? x.IssueSub_SchmAmt : x.IssueSub_Amount;
            return x;

          });
          // IssueSub_SchmAmt IssueSub_Amount
          this.IssueInfo = JsonIssueInfo[0];
          // this.IssueInfo.Issue_BillDate = this.dateReverce(
          //   JsonIssueInfo[0].Issue_BillDate
          // );



          this.IssueInfo.IssueRetDate = this.DateRetCopy(JsonIssueInfo[0].IssueRetDate);
          this.IssueInfo.Issue_BillDate = this.DateRetCopy(JsonIssueInfo[0].Issue_BillDate);
          this.IssueInfo.Issue_PaidAmount = JsonIssueInfo[0].Issue_PaidAmt;
          this.invoBill = JsonIssueInfo[0].Issue_SlNo;
          if (JsonIssueInfo[0].Issue_Cancel == "Yes") {
            // this.btnCancel = false;
            this.btnSave = false;
          }
          // else {
          //   this.btnCancel = true;
          //   this.btnEdit = true;
          // }
          let result = JsonIssueTaxInfo.filter(o => this.taxSource.some(({ TaxID }) => o.TaxId == TaxID));

          if (result.length) {
            this.taxFill(result[0]);
          }

          this.fnGetFinalAmt();
        }, 200);
      });
  }

  DateRet(value) {
    var BillDate = value;
    var BillDate1 = BillDate.split('-');
    var Dates = BillDate1[2] + '/' + BillDate1[1] + '/' + BillDate1[0]
    return Dates;
  }

  DateRetCopy(value) {
    let BillDate = value;
    let BillDate1 = BillDate.split('-');
    // let Dates = new Date(BillDate1[2] + '-' + BillDate1[1] + '-' + BillDate1[0])
    let Dates = new Date(BillDate1[0], BillDate1[1] - 1, BillDate1[2]);
    return Dates;
  }


  dateReverce(value) {
    return value.split("-").reverse().join("/");
  }

  dateRetExpiryFormat(value) {
    let BillDate = value;
    let BillDate1 = BillDate.split('-');
    let Dates = BillDate1[1] + '/' + BillDate1[0]
    return Dates;

  }

  taxFill(result) {
    let taxitem = this.taxSource.find(t => t.TaxID == result.TaxId);
    if (taxitem) {
      let i = this.taxSource.indexOf(taxitem);
      this.taxSource[i].Amount = result.Amount
      this.taxSource[i].CGSTTaxAmount = result.CGSTTaxAmount
      this.taxSource[i].IGSTTaxAmount = result.IGSTTaxAmount
      this.taxSource[i].SGSTTaxAmount = result.SGSTTaxAmount
      this.taxSource[i].TaxAmount = result.TaxAmount

    }
  }

  fnGetTotal() {

    let dTotDisPers = 0, dTotDisAmt = 0, dAmountBeforeTax = 0;
    dTotDisPers = Number(this.IssueInfo.Issue_DisPers);
    let dDisAdd = 0, dDisMinus = 0;
    let dQty = 0, dFreeQty = 0, dRate = 0, dSelRate = 0, dMRP = 0, dAmount = 0, dProdId = 0, Pack = 0, dWholeSaleRate = 0, dTax = 0, dDisPers = 0, dDisAmt = 0;
    let dTotTaxAmount = 0, dTotAmount = 0, dAmoutBeforTaxRowise = 0, dFreight = 0, dLCost = 0;
    let dRateWithTaxPerQty = 0, dPerRate = 0, dPerMrp = 0, dPerTaxAmt = 0, dAmountBeforeDiscount = 0, dSchePers = 0, dScheAmt = 0, dPack;
    let strBatch = "", strTaxOn = "", strType = "", strTaxName = "", strSalesType = "LOCAL";
    let dLooseQty = 0, dLooseFreeQty = 0;
    let strTaxOnFree = "";
    let dTotExcempted = 0, dTotMRPValue = 0, dTotVatCollected = 0, dTotSaleValue = 0;
    let dOriginalRate = 0;
    let dSGSTTaxPers = 0, dSGSTTaxAmount = 0, dSGSTAmount = 0, dCGSTTaxPers = 0, dCGSTTaxAmount = 0, dCGSTAmount = 0, dIGSTTaxPers = 0, dIGSTTaxAmount = 0, dIGSTAmount = 0;

    let dIssueTotAmtBeforeTax = 0, dTaxAmt = 0;
    let strMrpInclusiveSales = ''
    let strSoftwareName = this.settings.SoftwareName;
    let strTaxIncluded = this.settings.TaxIncluded
    let dTempOriginalRate = 0, dTempDisAdd = 0;
    let dTotAmt = 0, dAmt = 0, dTotTaxAmt = 0, dTotRetAmt = 0;
    let dTaxAmt1 = 0, dTaxAmt2 = 0, dTaxAmt3 = 0, dTaxAmt4 = 0, dTaxAmt5 = 0, dTaxId, dSalesRetAmt = 0, dPointValue = 0;
    let dAmt1 = 0, dAmt2 = 0, dAmt3 = 0, dAmt4 = 0, dAmt5 = 0, dOtherCharge = 0;
    let dTaxAmt6 = 0, dTaxAmt7 = 0, dTaxAmt8 = 0, dTaxAmt9 = 0, dTaxAmt10 = 0, dTaxAmt11 = 0, dTaxAmt12 = 0, dTaxAmt13 = 0, dTaxAmt14 = 0, dTaxAmt15 = 0;
    let dAmt6 = 0, dAmt7 = 0, dAmt8 = 0, dAmt9 = 0, dAmt10 = 0, dAmt11 = 0, dAmt12 = 0, dAmt13 = 0, dAmt14 = 0, dAmt15 = 0;

    let dSGSTTaxAmt = 0, dCGSTTaxAmt = 0, dIGSTTaxAmt = 0, dSGSTAmt = 0, dCGSTAmt = 0, dIGSTAmt = 0;
    let dSGSTTaxAmt1 = 0, dSGSTTaxAmt2 = 0, dSGSTTaxAmt3 = 0, dSGSTTaxAmt4 = 0, dSGSTTaxAmt5 = 0, dSGSTTaxAmt6 = 0, dSGSTTaxAmt7 = 0, dSGSTTaxAmt8 = 0, dSGSTTaxAmt9 = 0, dSGSTTaxAmt10 = 0, dSGSTTaxAmt11 = 0, dSGSTTaxAmt12 = 0, dSGSTTaxAmt13 = 0, dSGSTTaxAmt14 = 0, dSGSTTaxAmt15 = 0;
    let dCGSTTaxAmt1 = 0, dCGSTTaxAmt2 = 0, dCGSTTaxAmt3 = 0, dCGSTTaxAmt4 = 0, dCGSTTaxAmt5 = 0, dCGSTTaxAmt6 = 0, dCGSTTaxAmt7 = 0, dCGSTTaxAmt8 = 0, dCGSTTaxAmt9 = 0, dCGSTTaxAmt10 = 0, dCGSTTaxAmt11 = 0, dCGSTTaxAmt12 = 0, dCGSTTaxAmt13 = 0, dCGSTTaxAmt14 = 0, dCGSTTaxAmt15 = 0;
    let dIGSTTaxAmt1 = 0, dIGSTTaxAmt2 = 0, dIGSTTaxAmt3 = 0, dIGSTTaxAmt4 = 0, dIGSTTaxAmt5 = 0, dIGSTTaxAmt6 = 0, dIGSTTaxAmt7 = 0, dIGSTTaxAmt8 = 0, dIGSTTaxAmt9 = 0, dIGSTTaxAmt10 = 0, dIGSTTaxAmt11 = 0, dIGSTTaxAmt12 = 0, dIGSTTaxAmt13 = 0, dIGSTTaxAmt14 = 0, dIGSTTaxAmt15 = 0;

    let dSGSTAmt1 = 0, dSGSTAmt2 = 0, dSGSTAmt3 = 0, dSGSTAmt4 = 0, dSGSTAmt5 = 0, dSGSTAmt6 = 0, dSGSTAmt7 = 0, dSGSTAmt8 = 0, dSGSTAmt9 = 0, dSGSTAmt10 = 0, dSGSTAmt11 = 0, dSGSTAmt12 = 0, dSGSTAmt13 = 0, dSGSTAmt14 = 0, dSGSTAmt15 = 0;
    let dCGSTAmt1 = 0, dCGSTAmt2 = 0, dCGSTAmt3 = 0, dCGSTAmt4 = 0, dCGSTAmt5 = 0, dCGSTAmt6 = 0, dCGSTAmt7 = 0, dCGSTAmt8 = 0, dCGSTAmt9 = 0, dCGSTAmt10 = 0, dCGSTAmt11 = 0, dCGSTAmt12 = 0, dCGSTAmt13 = 0, dCGSTAmt14 = 0, dCGSTAmt15 = 0;
    let dIGSTAmt1 = 0, dIGSTAmt2 = 0, dIGSTAmt3 = 0, dIGSTAmt4 = 0, dIGSTAmt5 = 0, dIGSTAmt6 = 0, dIGSTAmt7 = 0, dIGSTAmt8 = 0, dIGSTAmt9 = 0, dIGSTAmt10 = 0, dIGSTAmt11 = 0, dIGSTAmt12 = 0, dIGSTAmt13 = 0, dIGSTAmt14 = 0, dIGSTAmt15 = 0;

    this.IssueSubDetailsInfo.forEach(oIssueSubDetailsInfoArg => {
      if (oIssueSubDetailsInfoArg.ProductId != 0) {
        dTempDisAdd = 0;
        dTempOriginalRate = Number(oIssueSubDetailsInfoArg.IssueSub_OriginalRate);
        // dTempDisAdd = oIssueSubDetailsInfoArg.IssueSub_AddDisPers;
        dTempOriginalRate = dTempOriginalRate + ((dTempOriginalRate * dTempDisAdd) / 100);
        oIssueSubDetailsInfoArg.IssueSub_ActualRate = dTempOriginalRate;
        dQty = dFreeQty = dRate = dSelRate = dMRP = dAmount = dProdId = Pack = dWholeSaleRate = dDisPers = dPerRate = dAmountBeforeDiscount = 0;
        dTotTaxAmount = dTotAmount = dTaxAmt = dAmoutBeforTaxRowise = dFreight = dLCost = 0;
        dRateWithTaxPerQty = 0;
        strBatch = strTaxOn = strTaxName = "";
        dPack = 0;
        dPerMrp = 0;
        strTaxOnFree = "No";
        dPerTaxAmt = 0;
        dLooseFreeQty = 0;
        strType = "";
        dOriginalRate = 0;
        dLooseQty = 0;
        dQty = 0;
        dLooseFreeQty = 0;
        dScheAmt = 0;
        dSchePers = 0;
        dQty = Number(oIssueSubDetailsInfoArg.IssueSub_RQty);
        dFreeQty = Number(oIssueSubDetailsInfoArg.IssueSub_RFreeQty);
        if (oIssueSubDetailsInfoArg.ProductId != 0 && (dQty != 0 || dFreeQty != 0)) {
          dQty = 0; dFreeQty = 0;
          dRate = Number(oIssueSubDetailsInfoArg.IssueSub_OriginalRate);
          dOriginalRate = Number(oIssueSubDetailsInfoArg.IssueSub_OriginalRate);
          dPack = Number(oIssueSubDetailsInfoArg.IssueSub_Pack);
          dMRP = Number(oIssueSubDetailsInfoArg.IssueSub_Mrp);
          dTax = Number(oIssueSubDetailsInfoArg.IssueSub_ActualTaxPers);
          strTaxOn = oIssueSubDetailsInfoArg.IssueSub_TaxOn;
          strTaxOnFree = oIssueSubDetailsInfoArg.IssueSub_TaxOnFree;
          strTaxName = oIssueSubDetailsInfoArg.IssueSub_Repl;
          dDisPers = oIssueSubDetailsInfoArg.IssueSub_PdodDis;
          // dSchePers = oIssueSubDetailsInfoArg.IssueSub_SchmPers;
          oIssueSubDetailsInfoArg.IssueSub_ActualRate = Number(oIssueSubDetailsInfoArg.IssueSub_OriginalRate);
          strType = oIssueSubDetailsInfoArg.IssueSub_Type;

          dSGSTTaxPers = Number(oIssueSubDetailsInfoArg.IssueSub_SGSTTaxPers);
          dCGSTTaxPers = Number(oIssueSubDetailsInfoArg.IssueSub_CGSTTaxPers);
          dIGSTTaxPers = Number(oIssueSubDetailsInfoArg.IssueSub_IGSTTaxPers);
          strMrpInclusiveSales = oIssueSubDetailsInfoArg.IssueRetSub_InclusiveSales;
        }
        if (dPack == 0) {
          dPack = 1;
          oIssueSubDetailsInfoArg.IssueSub_Pack = 1;
        }
        if (strMrpInclusiveSales == "Yes") {
          dRate = dOriginalRate - ((dOriginalRate * dTax) / (100 + dTax));
          oIssueSubDetailsInfoArg.IssueSub_ActualRate = dRate;
        }
        dQty = Number(oIssueSubDetailsInfoArg.IssueSub_RQty);
        dFreeQty = Number(oIssueSubDetailsInfoArg.IssueSub_RFreeQty);
        dPerRate = dRate / 1000;
        dPerMrp = dMRP / 1000;
        dRate = dRate + ((dRate * dDisAdd) / 100);
        dPerRate = dPerRate + ((dPerRate * dDisAdd) / 100);

        dRateWithTaxPerQty = dRate;
        dAmoutBeforTaxRowise = (dRate * dQty) + (dPerRate * dLooseQty);
        dAmountBeforeDiscount = (dRate * dQty);
        dAmountBeforeDiscount = dAmountBeforeDiscount - ((dAmountBeforeDiscount * dDisPers) / 100);

        dDisAmt = (((dRate * dQty) * dDisPers) / 100);
        dDisAmt += (((dPerRate * dLooseQty) * dDisPers) / 100);

        dRate = dRate - ((dRate * dDisPers) / 100);

        dPerRate = dPerRate - ((dPerRate * dDisPers) / 100);
        dIssueTotAmtBeforeTax = dIssueTotAmtBeforeTax + (dRate * dQty);
        dRate = dRate - ((dRate * dTotDisPers) / 100);
        dPerRate = dPerRate - ((dPerRate * dTotDisPers) / 100);
        dAmountBeforeDiscount += (dPerRate * dLooseQty);
        dScheAmt = (((dRate * dQty) * dSchePers) / 100);
        dScheAmt += (((dPerRate * dLooseQty) * dSchePers) / 100);
        dRate = dRate - ((dRate * dSchePers) / 100);
        dPerRate = dPerRate - ((dPerRate * dSchePers) / 100);
        dRate = dRate - ((dRate * dDisMinus) / 100);
        dPerRate = dPerRate - ((dPerRate * dDisMinus) / 100);
        dAmountBeforeTax += (dRate * dQty);
        dAmountBeforeTax += dPerRate * dLooseQty;

        if (strSalesType == "INTERSTATE") {
          dIGSTTaxAmount = dQty * ((dRate * dIGSTTaxPers) / 100);
          dIGSTAmount = dQty * dRate;
          if (strTaxOnFree == "Yes") {
            dIGSTAmount += (dFreeQty * dRate);
            dIGSTTaxAmount += (dFreeQty * ((dRate * dIGSTTaxPers) / 100));
          }
        } else {
          dSGSTTaxAmount = dQty * ((dRate * dSGSTTaxPers) / 100);
          dSGSTAmount = dQty * dRate;
          dCGSTTaxAmount = dQty * ((dRate * dCGSTTaxPers) / 100);
          dCGSTAmount = dQty * dRate;
          if (strTaxOnFree == "Yes") {
            dSGSTAmount += (dFreeQty * dRate);
            dSGSTTaxAmount += (dFreeQty * ((dRate * dSGSTTaxPers) / 100));
            dCGSTAmount += (dFreeQty * dRate);
            dCGSTTaxAmount += (dFreeQty * ((dRate * dCGSTTaxPers) / 100));
          }
        }

        if (strType == "LOCAL" && strTaxName == "MEDICINE") {
          if (strTaxOn == "MRP Inclusive") {
            dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
            dPerTaxAmt = 1 * ((dPerMrp * dTax) / (100 + dTax));
            dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
            dTaxAmt = dQty * ((dMRP * dTax) / (100 + dTax));
            dPerTaxAmt = dLooseQty * ((dPerMrp * dTax) / (100 + dTax));
            if (strTaxOnFree == "Yes") {
              dTaxAmt += dFreeQty * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt += dLooseFreeQty * ((dPerMrp * dTax) / (100 + dTax));
            }
          } else {
            dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
            dPerTaxAmt = 1 * ((dPerMrp * dTax) / (100 + dTax));
            dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
            dTaxAmt = dQty * ((dRate * dTax) / 100);
            dPerTaxAmt = dLooseQty * ((dPerRate * dTax) / 100);
            if (strTaxOnFree == "Yes") {
              dTaxAmt += dFreeQty * ((dRate * dTax) / 100);
              dPerTaxAmt += dLooseFreeQty * ((dPerRate * dTax) / 100);
            }
          }
          dTotExcempted += (dQty * dRate) + dTaxAmt;
        } else if (strType == "INTERSTATE" && strTaxName == "MEDICINE") {
          dTotMRPValue += (dQty * dMRP) + (dPerMrp * dLooseQty);
          if (strTaxOn == "MRP Inclusive") {
            dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
            dPerTaxAmt = 1 * ((dPerMrp * dTax) / (100 + dTax));
            dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
            dTaxAmt = dQty * ((dMRP * dTax) / (100 + dTax));
            dPerTaxAmt = dLooseQty * ((dPerMrp * dTax) / (100 + dTax));
            if (strTaxOnFree == "Yes") {
              dTaxAmt += dFreeQty * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt += dLooseFreeQty * ((dPerMrp * dTax) / (100 + dTax));
              dTotMRPValue += (dFreeQty * dMRP) + (dPerMrp * dLooseQty);
            }
          } else {
            dTaxAmt = 1 * ((dRate * dTax) / 100);
            dPerTaxAmt = 1 * ((dPerRate * dTax) / 100);
            dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
            dTaxAmt = dQty * ((dRate * dTax) / 100);
            dPerTaxAmt = dLooseQty * ((dPerRate * dTax) / 100);
            if (strTaxOnFree == "Yes") {
              dTaxAmt += dFreeQty * ((dRate * dTax) / 100);
              dPerTaxAmt += dLooseFreeQty * ((dPerRate * dTax) / 100);
            }
          }
          dTotVatCollected += dTaxAmt + dPerTaxAmt;
          dTotSaleValue += (dQty * dRate) + (dPerRate + dLooseQty);
        } else if (strType == "INTERSTATE") {
          if (strTaxOn == "MRP Inclusive") {
            dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
            dPerTaxAmt = 1 * ((dPerMrp * dTax) / (100 + dTax));
            dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
            dTaxAmt = dQty * ((dMRP * dTax) / (100 + dTax));
            dPerTaxAmt = dLooseQty * ((dPerMrp * dTax) / (100 + dTax));
            if (strTaxOnFree == "Yes") {
              dTaxAmt += dFreeQty * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt += dLooseFreeQty * ((dPerMrp * dTax) / (100 + dTax));
            }
          } else {
            dTaxAmt = 1 * ((dRate * dTax) / 100);
            dPerTaxAmt = 1 * ((dPerRate * dTax) / 100);
            dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
            dTaxAmt = dQty * ((dRate * dTax) / 100);
            dPerTaxAmt = dLooseQty * ((dPerRate * dTax) / 100);
            if (strTaxOnFree == "Yes") {
              dTaxAmt += dFreeQty * ((dRate * dTax) / 100);
              dPerTaxAmt += dLooseFreeQty * ((dPerRate * dTax) / 100);
            }
          }
        } else {
          if (strTaxOn == "MRP Inclusive") {
            dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
            dPerTaxAmt = 1 * ((dPerMrp * dTax) / (100 + dTax));
            dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
            dTaxAmt = dQty * ((dMRP * dTax) / (100 + dTax));
            dPerTaxAmt = dLooseQty * ((dPerMrp * dTax) / (100 + dTax));
            if (strTaxOnFree == "Yes") {
              dTaxAmt += dFreeQty * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt += dLooseFreeQty * ((dPerMrp * dTax) / (100 + dTax));
            }
          } else {
            dTaxAmt = 1 * ((dRate * dTax) / 100);
            dPerTaxAmt = 1 * ((dPerRate * dTax) / 100);
            dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
            dTaxAmt = dQty * ((dRate * dTax) / 100);
            dPerTaxAmt = dLooseQty * ((dPerRate * dTax) / 100);
            if (strTaxOnFree == "Yes") {
              dTaxAmt += dFreeQty * ((dRate * dTax) / 100);
              dPerTaxAmt += dLooseFreeQty * ((dPerRate * dTax) / 100);
            }
          }
        }


        dAmount = (dRate * dQty) + (dPerRate * dLooseQty) + dTaxAmt + dPerTaxAmt;

        if (strMrpInclusiveSales == "Yes" && strSoftwareName == "RetailPharma") {
          dAmountBeforeDiscount = dOriginalRate * dQty;
        } else {
          dAmountBeforeDiscount += dTaxAmt + dPerTaxAmt;
        }

        if (strTaxIncluded == "Yes") {
          if ((dQty + dFreeQty) > 0)
            dLCost = (((dAmount - dTaxAmt) / (dQty + dFreeQty)) + (dFreight));
          else
            dLCost = 0;
        } else {
          if ((dQty + dFreeQty) > 0)
            dLCost = ((dAmount / (dQty + dFreeQty)) + (dFreight));
          else
            dLCost = 0;
        }

        dTaxAmt = dTaxAmt + dPerTaxAmt;

        oIssueSubDetailsInfoArg.IssueSub_RetAmount = dAmount;

        if (this.billTypes == 'productwise')
          oIssueSubDetailsInfoArg.IssueSub_Amount = dAmount;

        oIssueSubDetailsInfoArg.IssueSub_TaxAmt = dTaxAmt;
        oIssueSubDetailsInfoArg.IssueSub_SelRate = dRateWithTaxPerQty;
        oIssueSubDetailsInfoArg.IssueSub_AmountBeforeTax = dAmountBeforeTax;

        this.IssueInfo.MRPValue = dTotMRPValue;
        this.IssueInfo.VatCollected = dTotVatCollected;
        this.IssueInfo.SaleValue = dTotSaleValue;
        this.IssueInfo.ExcemptedValue = dTotExcempted;

        oIssueSubDetailsInfoArg.IssueSub_AmountBeforeTax = dAmoutBeforTaxRowise;
        oIssueSubDetailsInfoArg.IssueSub_ProdDisAmt = dDisAmt;
        oIssueSubDetailsInfoArg.IssueSub_AmountBeforeDis = dAmountBeforeDiscount;
        oIssueSubDetailsInfoArg.IssueSub_SGSTTaxAmount = dSGSTTaxAmount;
        oIssueSubDetailsInfoArg.IssueSub_SGSTAmount = dSGSTAmount;
        oIssueSubDetailsInfoArg.IssueSub_CGSTTaxAmount = dCGSTTaxAmount;
        oIssueSubDetailsInfoArg.IssueSub_CGSTAmount = dCGSTAmount;
        oIssueSubDetailsInfoArg.IssueSub_IGSTTaxAmount = dIGSTTaxAmount;
        oIssueSubDetailsInfoArg.IssueSub_IGSTAmount = dIGSTAmount;
        if (strType == "LOCAL" && strTaxName == "MEDICINE") {
          oIssueSubDetailsInfoArg.IssueSub_TaxAmt = 0;
          oIssueSubDetailsInfoArg.IssueSub_TaxPers = 0;
        }
      }
      dAmt = dTaxAmt = 0;
      dSGSTTaxAmt = 0;
      dCGSTTaxAmt = 0;
      dIGSTTaxAmt = 0;
      dSGSTAmt = 0;
      dCGSTAmt = 0;
      dIGSTAmt = 0;
      if (oIssueSubDetailsInfoArg.IssueSub_RetAmount != 0) {
        // if (this.billTypes == "billwise")
        //   dTotAmt += Number(oIssueSubDetailsInfoArg.IssueSub_RetAmount)
        // else
          dTotAmt += Number(oIssueSubDetailsInfoArg.IssueSub_RetAmount);

          dAmt = Number(oIssueSubDetailsInfoArg.IssueSub_RetAmount);
        // if (oIssueSubDetailsInfoArg.Color == "R") {
        //     dTotRetAmt += oIssueSubDetailsInfoArg.IssueSub_Amount;
        // }
        dTaxAmt = Number(oIssueSubDetailsInfoArg.IssueSub_TaxAmt);
        dTotTaxAmt += dTaxAmt;
        dSGSTTaxAmt = Number(oIssueSubDetailsInfoArg.IssueSub_SGSTTaxAmount);
        dCGSTTaxAmt = Number(oIssueSubDetailsInfoArg.IssueSub_CGSTTaxAmount);
        dIGSTTaxAmt = Number(oIssueSubDetailsInfoArg.IssueSub_IGSTTaxAmount);
        dSGSTAmt = Number(oIssueSubDetailsInfoArg.IssueSub_SGSTAmount);
        dCGSTAmt = Number(oIssueSubDetailsInfoArg.IssueSub_CGSTAmount);
        dIGSTAmt = Number(oIssueSubDetailsInfoArg.IssueSub_IGSTAmount);
      }
      if (oIssueSubDetailsInfoArg.TaxId != 0 && oIssueSubDetailsInfoArg.TaxId != 0 && oIssueSubDetailsInfoArg.IssueSub_Repl != "MEDICINE") {
        dTaxId = Number(oIssueSubDetailsInfoArg.TaxId);
        if (dTaxId == 1) {
          dTaxAmt1 += dTaxAmt;
          dAmt1 += dAmt - dTaxAmt;
          dSGSTTaxAmt1 += dSGSTTaxAmt;
          dCGSTTaxAmt1 += dCGSTTaxAmt;
          dIGSTTaxAmt1 += dIGSTTaxAmt;
          dSGSTAmt1 += dSGSTAmt;
          dCGSTAmt1 += dCGSTAmt;
          dIGSTAmt1 += dIGSTAmt;
        } else if (dTaxId == 2) {
          dTaxAmt2 += dTaxAmt;
          dAmt2 += dAmt - dTaxAmt;
          dSGSTTaxAmt2 += dSGSTTaxAmt;
          dCGSTTaxAmt2 += dCGSTTaxAmt;
          dIGSTTaxAmt2 += dIGSTTaxAmt;
          dSGSTAmt2 += dSGSTAmt;
          dCGSTAmt2 += dCGSTAmt;
          dIGSTAmt2 += dIGSTAmt;
        } else if (dTaxId == 3) {
          dTaxAmt3 += dTaxAmt;
          dAmt3 += dAmt - dTaxAmt;
          dSGSTTaxAmt3 += dSGSTTaxAmt;
          dCGSTTaxAmt3 += dCGSTTaxAmt;
          dIGSTTaxAmt3 += dIGSTTaxAmt;
          dSGSTAmt3 += dSGSTAmt;
          dCGSTAmt3 += dCGSTAmt;
          dIGSTAmt3 += dIGSTAmt;
        } else if (dTaxId == 4) {
          dTaxAmt4 += dTaxAmt;
          dAmt4 += dAmt - dTaxAmt;
          dSGSTTaxAmt4 += dSGSTTaxAmt;
          dCGSTTaxAmt4 += dCGSTTaxAmt;
          dIGSTTaxAmt4 += dIGSTTaxAmt;
          dSGSTAmt4 += dSGSTAmt;
          dCGSTAmt4 += dCGSTAmt;
          dIGSTAmt4 += dIGSTAmt;
        } else if (dTaxId == 5) {
          dTaxAmt5 += dTaxAmt;
          dAmt5 += dAmt - dTaxAmt;
          dSGSTTaxAmt5 += dSGSTTaxAmt;
          dCGSTTaxAmt5 += dCGSTTaxAmt;
          dIGSTTaxAmt5 += dIGSTTaxAmt;
          dSGSTAmt5 += dSGSTAmt;
          dCGSTAmt5 += dCGSTAmt;
          dIGSTAmt5 += dIGSTAmt;
        } else if (dTaxId == 6) {
          dTaxAmt6 += dTaxAmt;
          dAmt6 += dAmt - dTaxAmt;
          dSGSTTaxAmt6 += dSGSTTaxAmt;
          dCGSTTaxAmt6 += dCGSTTaxAmt;
          dIGSTTaxAmt6 += dIGSTTaxAmt;
          dSGSTAmt6 += dSGSTAmt;
          dCGSTAmt6 += dCGSTAmt;
          dIGSTAmt6 += dIGSTAmt;
        } else if (dTaxId == 7) {
          dTaxAmt7 += dTaxAmt;
          dAmt7 += dAmt - dTaxAmt;
          dSGSTTaxAmt7 += dSGSTTaxAmt;
          dCGSTTaxAmt7 += dCGSTTaxAmt;
          dIGSTTaxAmt7 += dIGSTTaxAmt;
          dSGSTAmt7 += dSGSTAmt;
          dCGSTAmt7 += dCGSTAmt;
          dIGSTAmt7 += dIGSTAmt;
        } else if (dTaxId == 8) {
          dTaxAmt8 += dTaxAmt;
          dAmt8 += dAmt - dTaxAmt;
          dSGSTTaxAmt8 += dSGSTTaxAmt;
          dCGSTTaxAmt8 += dCGSTTaxAmt;
          dIGSTTaxAmt8 += dIGSTTaxAmt;
          dSGSTAmt8 += dSGSTAmt;
          dCGSTAmt8 += dCGSTAmt;
          dIGSTAmt8 += dIGSTAmt;
        } else if (dTaxId == 9) {
          dTaxAmt9 += dTaxAmt;
          dAmt9 += dAmt - dTaxAmt;
          dSGSTTaxAmt9 += dSGSTTaxAmt;
          dCGSTTaxAmt9 += dCGSTTaxAmt;
          dIGSTTaxAmt9 += dIGSTTaxAmt;
          dSGSTAmt9 += dSGSTAmt;
          dCGSTAmt9 += dCGSTAmt;
          dIGSTAmt9 += dIGSTAmt;
        } else if (dTaxId == 10) {
          dTaxAmt10 += dTaxAmt;
          dAmt10 += dAmt - dTaxAmt;
          dSGSTTaxAmt10 += dSGSTTaxAmt;
          dCGSTTaxAmt10 += dCGSTTaxAmt;
          dIGSTTaxAmt10 += dIGSTTaxAmt;
          dSGSTAmt10 += dSGSTAmt;
          dCGSTAmt10 += dCGSTAmt;
          dIGSTAmt10 += dIGSTAmt;
        } else if (dTaxId == 11) {
          dTaxAmt11 += dTaxAmt;
          dAmt11 += dAmt - dTaxAmt;
          dSGSTTaxAmt11 += dSGSTTaxAmt;
          dCGSTTaxAmt11 += dCGSTTaxAmt;
          dIGSTTaxAmt11 += dIGSTTaxAmt;
          dSGSTAmt11 += dSGSTAmt;
          dCGSTAmt11 += dCGSTAmt;
          dIGSTAmt11 += dIGSTAmt;
        } else if (dTaxId == 12) {
          dTaxAmt12 += dTaxAmt;
          dAmt12 += dAmt - dTaxAmt;
          dSGSTTaxAmt12 += dSGSTTaxAmt;
          dCGSTTaxAmt12 += dCGSTTaxAmt;
          dIGSTTaxAmt12 += dIGSTTaxAmt;
          dSGSTAmt12 += dSGSTAmt;
          dCGSTAmt12 += dCGSTAmt;
          dIGSTAmt12 += dIGSTAmt;
        } else if (dTaxId == 13) {
          dTaxAmt13 += dTaxAmt;
          dAmt13 += dAmt - dTaxAmt;
          dSGSTTaxAmt13 += dSGSTTaxAmt;
          dCGSTTaxAmt13 += dCGSTTaxAmt;
          dIGSTTaxAmt13 += dIGSTTaxAmt;
          dSGSTAmt13 += dSGSTAmt;
          dCGSTAmt13 += dCGSTAmt;
          dIGSTAmt13 += dIGSTAmt;
        } else if (dTaxId == 14) {
          dTaxAmt14 += dTaxAmt;
          dAmt14 += dAmt - dTaxAmt;
          dSGSTTaxAmt14 += dSGSTTaxAmt;
          dCGSTTaxAmt14 += dCGSTTaxAmt;
          dIGSTTaxAmt14 += dIGSTTaxAmt;
          dSGSTAmt14 += dSGSTAmt;
          dCGSTAmt14 += dCGSTAmt;
          dIGSTAmt14 += dIGSTAmt;
        } else if (dTaxId == 15) {
          dTaxAmt15 += dTaxAmt;
          dAmt15 += dAmt - dTaxAmt;
          dSGSTTaxAmt15 += dSGSTTaxAmt;
          dCGSTTaxAmt15 += dCGSTTaxAmt;
          dIGSTTaxAmt15 += dIGSTTaxAmt;
          dSGSTAmt15 += dSGSTAmt;
          dCGSTAmt15 += dCGSTAmt;
          dIGSTAmt15 += dIGSTAmt;
        }
      }
    });
    this.taxSource.forEach(oIssueTaxInfoArg => {
      let taxId = Number(oIssueTaxInfoArg.TaxID);
      if (taxId == 1) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt1;
        oIssueTaxInfoArg.Amount = dAmt1;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt1;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt1;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt1;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt1;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt1;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt1;
      } else if (taxId == 2) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt2;
        oIssueTaxInfoArg.Amount = dAmt2;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt2;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt2;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt2;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt2;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt2;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt2;
      } else if (taxId == 3) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt3;
        oIssueTaxInfoArg.Amount = dAmt3;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt3;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt3;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt3;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt3;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt3;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt3;
      } else if (taxId == 4) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt4;
        oIssueTaxInfoArg.Amount = dAmt4;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt4;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt4;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt4;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt4;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt4;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt4;
      } else if (taxId == 5) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt5;
        oIssueTaxInfoArg.Amount = dAmt5;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt5;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt5;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt5;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt5;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt5;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt5;
      } else if (taxId == 6) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt6;
        oIssueTaxInfoArg.Amount = dAmt6;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt6;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt6;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt6;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt6;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt6;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt6;
      } else if (taxId == 7) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt7;
        oIssueTaxInfoArg.Amount = dAmt7;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt7;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt7;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt7;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt7;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt7;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt7;
      } else if (taxId == 8) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt8;
        oIssueTaxInfoArg.Amount = dAmt8;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt8;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt8;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt8;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt8;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt8;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt8;
      } else if (taxId == 9) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt9;
        oIssueTaxInfoArg.Amount = dAmt9;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt9;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt9;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt9;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt9;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt9;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt9;
      } else if (taxId == 10) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt10;
        oIssueTaxInfoArg.Amount = dAmt10;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt10;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt10;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt10;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt10;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt10;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt10;
      } else if (taxId == 11) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt11;
        oIssueTaxInfoArg.Amount = dAmt11;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt11;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt11;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt11;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt11;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt11;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt11;
      } else if (taxId == 12) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt12;
        oIssueTaxInfoArg.Amount = dAmt12;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt12;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt12;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt12;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt12;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt12;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt12;
      } else if (taxId == 13) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt13;
        oIssueTaxInfoArg.Amount = dAmt13;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt13;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt13;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt13;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt13;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt13;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt13;
      } else if (taxId == 14) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt14;
        oIssueTaxInfoArg.Amount = dAmt14;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt14;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt14;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt14;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt14;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt14;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt14;
      } else if (taxId == 15) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt15;
        oIssueTaxInfoArg.Amount = dAmt15;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt15;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt15;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt15;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt15;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt15;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt15;
      }

    });

    dOtherCharge = Number(this.IssueInfo.Issue_OtherCharge || 0);
    dSalesRetAmt = Number(this.IssueInfo.Issue_RetValue || 0);
    dPointValue = 0;
    dTotAmt = dTotAmt + dOtherCharge - dSalesRetAmt - dPointValue;
    let dTotal = dTotAmt;
    this.IssueInfo.Issue_ROF = 0;
    this.IssueInfo.Issue_CrAmt = dTotAmt;
    this.IssueInfo.Issue_ATotal = dTotAmt;
    this.IssueInfo.Issue_RetValue = dTotRetAmt;
    let RofDiffValue = dTotAmt - Math.round(dTotAmt);
    if (this.settings.SetRof == "Yes" && (RofDiffValue == 0.50 || RofDiffValue == (-0.50)))
      dTotAmt += 0.001;
    if (this.settings.SetRof == "Yes") {
      this.IssueInfo.Issue_CrAmt = Math.round(dTotAmt);
      let dROF = Number(this.IssueInfo.Issue_CrAmt) - dTotAmt;
      this.IssueInfo.Issue_ROF = dROF;
    }
    strSalesType = this.IssueInfo.Issue_Type;
    if (dTotDisPers > 0) {
      dTotDisAmt = (dIssueTotAmtBeforeTax * dTotDisPers) / 100;
    }

    this.IssueInfo.Issue_DisAmt = dTotDisAmt;
    this.fnGetFinalAmt();
  }

  fnGetFinalAmt() {
    let dTotTaxAmt = 0;
    let dAmtBeforeTax = 0;
    for (const sub of this.IssueSubDetailsInfo) {
      let dTaxAmt = Number(sub.IssueSub_TaxAmt);
      let dAmtBeforeTaxPerRow = Number(sub.IssueSub_AmountBeforeTax);
      dTotTaxAmt = dTotTaxAmt + dTaxAmt;
      dAmtBeforeTax = dAmtBeforeTax + dAmtBeforeTaxPerRow;
    }
    this.IssueInfo.Issue_DTotal = dAmtBeforeTax;
    this.totalTaxAmount = dTotTaxAmt;
  }



  async alertListConfirm(value) {
    if (!this.IssueSubDetailsInfo.length) {
      this.fnAlertConfirm(value);
      return
    }
    const alert = await this.alertController.create({
      cssClass: 'my-custom-claass',
      mode: "ios",
      header: 'Confirm!',
      message: 'Do you Want Change Without <strong>Save</strong>!!!',
      buttons: [
        {
          text: 'Stay',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {

          }
        }, {
          text: 'Leave',
          handler: () => {
            this.fnAlertConfirm(value)
          }
        }
      ]
    });

    await alert.present();
  }

  fnAlertConfirm(value) {
    if (value == 'list')
      this.productListModal();
    else if (value == 'back')
      this.router.navigate(['home']);
    else
      this.fnClear();
  }

  async productBillwiseView(index) {

    let item = this.IssueSubDetailsInfo[index];
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      mode: "ios",
      header: item.ItemDesc,
      backdropDismiss: false,
      inputs: [
        {
          name: 'quantity',
          type: 'number',
          id: 'qty-id',
          value: item.IssueSub_RQty,
          placeholder: 'Enter Quantity'
        }, {
          name: 'free',
          type: 'number',
          id: 'free-id',
          value: item.IssueSub_RFreeQty,
          placeholder: 'Enter Free'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {

          text: 'Ok',
          role: 'selected',
          handler: (res) => {

            let dQty = Number(this.IssueSubDetailsInfo[index].IssueSub_Qty || 0);
            let dRQty = Number(res.quantity || 0) + Number(res.free || 0);
            let dOldRQty = Number(this.IssueSubDetailsInfo[index].BillRetQty || 0);

            if ((dRQty + dOldRQty) > dQty) {
              this.alertToast("Enter Valid Qty");
              this.IssueSubDetailsInfo[index].IssueSub_RQty = 0
              this.IssueSubDetailsInfo[index].IssueSub_RFreeQty = 0
              this.fnGetTotal();
              return false;
            }

            item.BillRetQty
            item.IssueSub_RQty = Number(res.quantity);
            item.IssueSub_RFreeQty = Number(res.free);
            this.fnGetTotal();

          }

        }
      ]
    });
    await alert.present().then(() => {
      const firstInput: any = document.querySelector('ion-alert #qty-id');
      firstInput.focus();
      firstInput.select();
      firstInput.before('Quantity')

      const thirdInput: any = document.querySelector('ion-alert #free-id');
      thirdInput.before('Free');
      return;
    });

  }
  async productView(index) {
    if (this.billTypes == "billwise") {
      this.productBillwiseView(index)
      return
    }

    let item = this.IssueSubDetailsInfo[index];
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      mode: "ios",
      header: item.ItemDesc,
      backdropDismiss: false,
      inputs: [
        {
          name: 'quantity',
          type: 'number',
          id: 'qty-id',
          value: item.IssueSub_RQty,
          placeholder: 'Enter Quantity'
        }, {
          name: 'rate',
          type: 'number',
          id: 'rate-id',
          value: item.IssueSub_OriginalRate,
          placeholder: 'Enter Rate'
        }, {
          name: 'free',
          type: 'number',
          id: 'free-id',
          value: item.IssueSub_RFreeQty,
          placeholder: 'Enter Free'
        }, {
          name: 'billno',
          type: 'number',
          id: 'billno-id',
          value: item.Issue_SlNo,
          placeholder: 'Enter billno'
        },

      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          role: 'selected',
          handler: (res) => {
            item.IssueSub_OriginalRate = Number(res.rate);
            item.IssueSub_RQty = Number(res.quantity);
            item.IssueSub_RFreeQty = Number(res.free);
            item.Issue_SlNo = Number(res.billno);
            this.fnGetTotal();
          }
        }
      ]
    });
    await alert.present().then(() => {
      const firstInput: any = document.querySelector('ion-alert #qty-id');
      firstInput.focus();
      firstInput.select();
      firstInput.before('Quantity')
      const secondInput: any = document.querySelector('ion-alert #rate-id');
      secondInput.before('Rate')
      const thirdInput: any = document.querySelector('ion-alert #free-id');
      thirdInput.before('Free');
      const fouthInput: any = document.querySelector('ion-alert #billno-id');
      fouthInput.before('Bill no');

      return;
    });

    // await alert.present();
  }


  fnSave() {

    if (!confirm('Are you sure you want to save  this return ?'))
      return;

    var varArguements = {};

    varArguements = {
      SoftwareName: this.settings.SoftwareName, CustomerForSoftware: this.settings.CustomerForSoftware, AddOrMinus: this.settings.AddOrMinus,
      MrpIncluesiveSales: this.settings.MrpInclusiveSales, TaxIncluded: this.settings.TaxIncluded, Rof: this.settings.SetRof, PackCal: this.settings.PackCal
    };

    if (this.IssueInfo.AcId == 0 && (this.settings.SoftwareName == "WholeSalePharma" || this.IssueInfo.IssueRet_PayTerms == "CREDIT")) {
      this.alertToast("Select Customer");
      return;
    }
    if (this.IssueInfo.SalesExeId == 0) {
      this.alertToast("Select Salesman");
      return;
    }

    let id = 0;
    if (this.IssueSubDetailsInfo.length == 0) {
      this.alertToast("Enter Product Details");
      return
    }

    let ListIssueSubDetailsInfo = [];

    for (const x of this.IssueSubDetailsInfo) {


      id += 1;
      x.IssueSub_RQty = Number(x.IssueSub_RQty);
      x.IssueSub_RFreeQty = Number(x.IssueSub_RFreeQty);

      // x.IssueSub_RFreeQty = Number(x.Issue_SlNo);
      // x.IssueSub_Mrp = Number(x.Issue_SlNo);
      let retAmt = Number(x.IssueSub_Amount);
      if (this.billTypes == 'billwise') {

        retAmt = Number(x.IssueSub_RetAmount);
        x.Issue_BillDate = this.datePipe.transform(x.Issue_BillDate, 'dd/MM/yyyy');
      }
      // let Issue_BillDate = this.datePipe.transform(x.Issue_BillDate, 'dd/MM/yyyy');
      if (x.ProductId != 0 && (x.IssueSub_RQty > 0 || x.IssueSub_RFreeQty > 0)) {

        let IssueSubDetailsInfo = {};

        IssueSubDetailsInfo["UniqueBillNo"]          =  Number(this.txtUniqueNo || 0);
        IssueSubDetailsInfo["IssueSub_Id"]           = Number(id || 0);
        IssueSubDetailsInfo["BillSerId"]             = Number(x.BillSerId || 0);
        IssueSubDetailsInfo["Issue_SlNo"]            = Number(x.Issue_SlNo || 0);
        IssueSubDetailsInfo["Issue_BillDate"]        = x.Issue_BillDate;
        IssueSubDetailsInfo["Store_BatchSlNo"]       = Number(x.Store_BatchSlNo || 0);
        IssueSubDetailsInfo["IssueSub_Batch"]        = x.IssueSub_Batch;
        IssueSubDetailsInfo["IssueSub_Pack"]         = Number(x.IssueSub_Pack || 0);
        IssueSubDetailsInfo["IssueSub_ExpDate"]      = x.IssueSub_ExpDate;
        IssueSubDetailsInfo["IssueSub_PurRate"]      = Number(x.IssueSub_PurRate || 0);
        IssueSubDetailsInfo["IssueSub_OriginalRate"] = Number(x.IssueSub_OriginalRate || 0);
        IssueSubDetailsInfo["IssueSub_Mrp"]          = Number(x.IssueSub_Mrp || 0);
        IssueSubDetailsInfo["IssueSub_RQty"]         = Number(x.IssueSub_RQty || 0);
        IssueSubDetailsInfo["IssueSub_RFreeQty"]     = Number(x.IssueSub_RFreeQty || 0);

        if (this.billTypes == 'billwise') {
          IssueSubDetailsInfo["IssueSub_Qty"]        = Number(x.IssueSub_Qty || 0);
          IssueSubDetailsInfo["IssueSub_FreeQty"]    = Number(x.IssueSub_FreeQty || 0);
        }

        IssueSubDetailsInfo["IssueSub_TaxPers"]      = Number(x.IssueSub_TaxPers || 0);
        IssueSubDetailsInfo["IssueSub_TaxAmt"]       = Number(x.IssueSub_TaxAmt || 0);
        IssueSubDetailsInfo["IssueSub_PdodDis"]      = Number(x.IssueSub_PdodDis || 0);
        IssueSubDetailsInfo["IssueSub_TaxOn"]        = x.IssueSub_TaxOn;
        IssueSubDetailsInfo["IssueSub_TaxOnFree"]    = x.IssueSub_TaxOnFree;
        IssueSubDetailsInfo["IssueSub_Repl"]         = x.IssueSub_Repl;
        IssueSubDetailsInfo["ProductId"]                   = Number(x.ProductId || 0);
        IssueSubDetailsInfo["TaxId"]                       = Number(x.TaxId || 0);
        IssueSubDetailsInfo["IssueSub_ProdDisAmt"]         = Number(x.IssueSub_ProdDisAmt || 0);
        IssueSubDetailsInfo["IssueSub_ActualTaxPers"]      = Number(x.IssueSub_ActualTaxPers || 0);
        IssueSubDetailsInfo["IssueSub_Amount"]             = Number(retAmt || 0);
        IssueSubDetailsInfo["IssueSub_TaxAmt"]             = Number(x.IssueSub_TaxAmt || 0);
        IssueSubDetailsInfo["IssueSub_SelRate"]            = Number(x.IssueSub_SelRate || 0);
        IssueSubDetailsInfo["IssueSub_AmountBeforeTax"]    = Number(x.IssueSub_AmountBeforeTax || 0);
        IssueSubDetailsInfo["IssueSub_ActualRate"]         = Number(x.IssueSub_ActualRate || 0);
        IssueSubDetailsInfo["IssueSub_AmountBeforeDis"]    = Number(x.IssueSub_AmountBeforeDis || 0);
        IssueSubDetailsInfo["IssueSub_Exmpvatncess"]       = Number(x.IssueSub_AmountBeforeTax || 0);
        IssueSubDetailsInfo["IssueSub_Type"]               = x.IssueSub_Type;
        IssueSubDetailsInfo["IssueSub_ActualTaxPers"]      = Number(x.IssueSub_ActualTaxPers || 0);
        IssueSubDetailsInfo["IssueSub_SGSTTaxPers"]        = Number(x.IssueSub_SGSTTaxPers || 0);
        IssueSubDetailsInfo["IssueSub_SGSTTaxAmount"]      = Number(x.IssueSub_SGSTTaxAmount || 0);
        IssueSubDetailsInfo["IssueSub_SGSTAmount"]         = Number(x.IssueSub_SGSTAmount || 0);
        IssueSubDetailsInfo["IssueSub_CGSTTaxPers"]        = Number(x.IssueSub_CGSTTaxPers || 0);
        IssueSubDetailsInfo["IssueSub_CGSTTaxAmount"]      = Number(x.IssueSub_CGSTTaxAmount || 0);
        IssueSubDetailsInfo["IssueSub_CGSTAmount"]         = Number(x.IssueSub_CGSTAmount || 0);
        IssueSubDetailsInfo["IssueSub_IGSTTaxPers"]        = Number(x.IssueSub_IGSTTaxPers || 0);
        IssueSubDetailsInfo["IssueSub_IGSTTaxAmount"]      = Number(x.IssueSub_IGSTTaxAmount || 0);
        IssueSubDetailsInfo["IssueSub_IGSTAmount"]         = Number(x.IssueSub_IGSTAmount || 0);
        IssueSubDetailsInfo["IssueRetSub_InclusiveSales"]  = x.IssueRetSub_InclusiveSales;
        ListIssueSubDetailsInfo.push(IssueSubDetailsInfo);

      }
    }
    if (ListIssueSubDetailsInfo.length == 0) {
      this.alertToast('Enter Product Details !!');
      return
    }
    let IssueRetDate = this.datePipe.transform(this.IssueInfo.IssueRetDate, 'dd/MM/yyyy');
    // let Issue_BillDate = this.IssueInfo.Issue_BillDate;
    let Issue_BillDate = this.datePipe.transform(this.IssueInfo.Issue_BillDate, 'dd/MM/yyyy');

    let IssueInfo = {};
    IssueInfo["UniqueBillNo"] = this.txtUniqueNo;
    IssueInfo["BillSerId"] = Number(this.IssueInfo.BillSerId);
    IssueInfo["IssueRetSlNo"] = this.txtCopyBillNo;
    IssueInfo["Issue_SlNo"] = Number(this.IssueInfo.Issue_SlNo);
    IssueInfo["IssueRetDate"] = IssueRetDate;
    IssueInfo["Issue_BillDate"] = Issue_BillDate;
    IssueInfo["Issue_DisPers"] = Number(this.IssueInfo.Issue_DisPers);
    IssueInfo["Issue_DisAmt"] = Number(this.IssueInfo.Issue_DisAmt || 0);
    IssueInfo["AcId"] = Number(this.IssueInfo.AcId);
    IssueInfo["Issue_CustName"] = this.IssueInfo.Issue_CustName;
    IssueInfo["Issue_DoctId"] = Number(this.IssueInfo.Issue_DoctId);
    IssueInfo["Issue_DoctName"] = '';
    IssueInfo["SalesExeId"] = Number(this.IssueInfo.SalesExeId);
    IssueInfo["Issue_NoOfProducts"] = 0;
    IssueInfo["Issue_PayTerms"] = this.IssueInfo.Issue_PayTerms;
    IssueInfo["Issue_CardNo"] = "0";
    IssueInfo["Issue_CardName"] = '';
    IssueInfo["Issue_Banker"] = '';
    IssueInfo["Issue_Transporter"] = '';
    IssueInfo["Issue_LRNo"] = '';
    IssueInfo["Issue_Cases"] = 0;
    IssueInfo["Issue_OrderNo"] = '';
    IssueInfo["Issue_BankCharge"] = 0;
    IssueInfo["Issue_Postage"] = 0;
    IssueInfo["Issue_CrAmt"] = 0;
    IssueInfo["Issue_DbAmt"] = 0;
    IssueInfo["Issue_Freight"] = 0;
    IssueInfo["Issue_OtherCharge"] = Number(this.IssueInfo.Issue_OtherCharge);;
    IssueInfo["Issue_ExpiryAmt"] = 0;
    IssueInfo["Issue_ExpiryId"] = 0;
    IssueInfo["Issue_RepAmt"] = 0;
    IssueInfo["Issue_DTotal"] = Number(this.IssueInfo.Issue_DTotal);
    IssueInfo["Issue_ATotal"] = Number(this.IssueInfo.Issue_ATotal);
    IssueInfo["Issue_CSTPers"] = 0;
    IssueInfo["Issue_CSTAmt"] = 0;
    IssueInfo["Issue_ROF"] = Number(this.IssueInfo.Issue_ROF);
    IssueInfo["Issue_CrAmt"] = Number(this.IssueInfo.Issue_CrAmt);
    IssueInfo["Issue_Cancel"] = 'No';
    IssueInfo["Issue_Type"] = 'LOCAL';
    IssueInfo["Issue_Block"] = "0";
    IssueInfo["DelFlag"] = "0";
    IssueInfo["StaffId"] = 0;
    IssueInfo["CrditNoteNos"] = '';
    IssueInfo["ExpCrNoteNos"] = '';
    IssueInfo["VType_SlNo"] = 0;
    IssueInfo["Trans_VoucherNo"] = 0;
    IssueInfo["ExcemptedValue"] = Number(this.IssueInfo.ExcemptedValue);
    IssueInfo["MRPValue"] = Number(this.IssueInfo.MRPValue);
    IssueInfo["SaleValue"] = Number(this.IssueInfo.SaleValue);
    IssueInfo["VatCollected"] = Number(this.IssueInfo.VatCollected);
    IssueInfo["Issue_CstType"] = "0";
    IssueInfo["DirectRBank"] = "0";
    IssueInfo["BCLIssued"] = "0";
    IssueInfo["Issue_PaymentFlag"] = this.IssueInfo.Issue_PaymentFlag;
    IssueInfo["CrditNoteDates"] = "0";
    IssueInfo["ExpCrNoteDates"] = String(this.IssueInfo.AcId);
    IssueInfo["Issue_AgentId"] = Number(this.IssueInfo.Issue_AgentId);

    IssueInfo["Issue_Print"] = false;
    IssueInfo["Field1"] = '';
    IssueInfo["Issue_PaidAmount"] = Number(this.IssueInfo.Issue_PaidAmount);
    IssueInfo["Issue_ChellaNo"] = '';
    IssueInfo["Issue_AddDis"] = 0;
    IssueInfo["Issue_MinusDis"] = 0;
    IssueInfo["Remarks"] = '';
    IssueInfo["Field2"] = '';
    IssueInfo["Field3"] = '';
    IssueInfo["Issue_RetValue"] = 0;
    IssueInfo["Issue_PointSaleValue"] = 0;
    IssueInfo["Issue_PointAmount"] = 0;
    IssueInfo["Issue_NoOfPoints"] = 0;
    IssueInfo["BranchId"] = Number(this.branchId);
    IssueInfo["StaffId"] = Number(this.StaffId);
    IssueInfo["IssueRet_PayTerms"] = this.IssueInfo.IssueRet_PayTerms;
    IssueInfo["Issue_Type"] = this.IssueInfo.Issue_Type;
    IssueInfo["Issue_Field1"] = this.IssueInfo.Issue_Field1;
    IssueInfo["CrditNoteNos"] = this.IssueInfo.CrditNoteNos;
    IssueInfo["Issue_AgentMarginPers"] = Number(this.IssueInfo.Issue_AgentMarginPers);
    IssueInfo["Issue_AgentMarginAmt"] = Number(this.IssueInfo.Issue_AgentMarginAmt);


    let ListIssueTaxInfo = []
    this.taxSource.forEach(ele => {
      let IssueTaxInfo = {}
      IssueTaxInfo["TaxId"] = ele.TaxID;
      IssueTaxInfo["TaxAmount"] = ele.TaxAmount;
      IssueTaxInfo["Amount"] = ele.Amount;
      IssueTaxInfo["SGSTTaxPers"] = ele.SGSTTaxPers;
      IssueTaxInfo["SGSTTaxAmount"] = ele.SGSTTaxAmount;
      IssueTaxInfo["SGSTAmount"] = ele.SGSTAmount;
      IssueTaxInfo["CGSTTaxPers"] = ele.CGSTTaxPers;
      IssueTaxInfo["CGSTTaxAmount"] = ele.CGSTTaxAmount;
      IssueTaxInfo["CGSTAmount"] = ele.CGSTAmount;
      IssueTaxInfo["IGSTTaxPers"] = ele.IGSTTaxPers;
      IssueTaxInfo["IGSTTaxAmount"] = ele.IGSTTaxAmount;
      IssueTaxInfo["IGSTAmount"] = ele.IGSTAmount;
      ListIssueTaxInfo.push(IssueTaxInfo);

    });

    let DictionaryObject = {};
    DictionaryObject["dictArgmts"] = varArguements;
    IssueInfo['ListIssueSubDetailsInfo'] = ListIssueSubDetailsInfo;
    IssueInfo['ListIssueTaxInfo'] = ListIssueTaxInfo;
    IssueInfo['DictionaryObject'] = DictionaryObject;
    console.log(JSON.stringify(IssueInfo));
    let body = JSON.stringify(IssueInfo)
    this.appservice.fnApiPost(this.Apiurl + '/Sales/fnSalesReturnSave', body)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(result => {

        let JsonIssueInfo = result.JsonIssueInfo;
        let msg = "Sales Return No " + JsonIssueInfo.IssueRetSlNo + "  Saved ";
        let BillNo = JsonIssueInfo.IssueRetSlNo;
        let UniqueNo = JsonIssueInfo.UniqueBillNo;
        // dTempReturnNo       = BillNo;
        // dTempReturnUniqueNo = UniqueNo;
        // strTempSaveMsg      = msg;
        this.alertToast(msg);
        // if (this.settings.ReturnBillPost != "Bill" && this.IssueInfo.IssueRet_PayTerms == "CREDIT" && this.IssueInfo.AcId != 0) {
        //   alert(msg);
        //   this.fnReturnAdjustmentBillOpenForAdjustment(BillNo, UniqueNo);
        // } else {
        //   alert(msg)

        //   let arrvalue = { BillNo: BillNo, UniqueBillNo: UniqueNo }
        //   if (confirm("Do u Want to Print This Bill?")) {
        //     this.fnPrint(arrvalue);
        //   }

        // }
        this.fnClear();
      }, err => console.error(err));

  }

  async alertToast(msg) {

    this.ctrlService.presentToast('', msg)
  }


  getBillSeries(id) {
    let item = this.billSeries.find(x => Number(x.BillSerId) == id)
    if (item)
      return item.BillSerPrefix;
    else
      return '';
  }

  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}


function dateReverce(value) {
  return value.split("-").reverse().join("/");
}
function dateRetExpiryFormat(value) {
  let BillDate = value;
  let BillDate1 = BillDate.split('-');
  let Dates = BillDate1[1] + '/' + BillDate1[0]
  return Dates;

}