import { Component, Input, OnInit } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { ModalController, NavParams } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import  jsPDF from 'jspdf';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-printmodel-half',
  templateUrl: './printmodel-half.component.html',
  styleUrls: ['./printmodel-half.component.scss'],
})
export class PrintmodelHalfComponent implements OnInit {
  @Input() BillNo: string;
  @Input() BillSerId: string;
  @Input() UniqueNo: string;
  branchId: string = '17';
  ApiUrl: string = '';
  ImageName: string;
  Jurisdiction: string;
  strImageSave: string;
  dQtyDecimalPlace: number;
  private _unsubscribeAll: Subject<any>;
  dRateDecimalPlace:number
  bSameItemPrintOneLine: boolean
  PrintItemColumnDetails: any;
  ItemDescLen: number = 30;
  bPrintLogo: boolean;
  bPrintHeaderImage: boolean;
  bProductNextLine: boolean;
  bBackgroundImageMask: any;
  dFotterTaxsectionWidth = 0;
  dFooterAmountSectionWidth = 0;
  dFooterAmountWordSectionWidth = 0;
  dTotFooterAmountSectionWidth = 0;
  dQRCodeWidth = 0;
  dCustomerBox1 = 0;
  dCustomerBox2 = 0;
  dCustomerBox3 = 0;
  bDeclaration: any;
  nNoOfItemPerPage = 6;
  dProductDetailsHeight = 136;
   divPageWidth: any;
  PrintHeader: any;
  oArray = new Array();

  JsonSub = {
    SlNo: '', ItemDesc: '', HSNCode: '', IssueSub_TaxPers: '', IssueSub_Qty: '', IssueSub_OriginalRate: '', CashDisc: '', GrossValue: '',
    Rate: '', IssueSub_TaxAmt: '', RowTotal: '', IssueSub_Mrp: '', Unit: '', Batch: '', ExpDate: '', IssueSub_FreeQty: '',
    SchemAmt: '', MFR: '', PTR: '', PTW: '', CessPers: '', CessAmt: '', AmtBeforeTotDis: '', IssueSub_ProdDisAmt: ''
  }
  JsonSubInfo = [];
  GrossValue = 0; TotGrossValue = 0; TotTaxAmt = 0; NetValue = 0; TotNetValue = 0; TotQty = 0; TotFQty = 0; TotRowDisAmt = 0;
  TotAmtBeforeTax = 0; TotSGstTotal = 0; TotCGstTotal = 0; TotIGstTotal = 0; TotDisAmt = 0; TotCessAmt = 0; dTotBillRowTotal = 0;

  JsonIssueTaxInfo: any;
  JsonBranchInfo: any;
  JsonIssueInfo: any;
  strBillNo: string;
  strBillDate: string;
  strSupplyDate: string;
  strOrderDate: string;
  strQRCode: any;
  dCustomerDetailsHeight: number= 90;;
  dBillBalance: number;
  bShippingVisible: boolean;
  nfromOneWidth: number;
  strLogoImageName: string;

  dTotAmtBeforeTotDis: number = 0;
  TotAfterDiscount: number;
  constructor(
    public appService: AppService, private printer: Printer,
    private modalpage: ModalController,
    public navParams: NavParams,
    private socialSharing: SocialSharing, private file: File,
    public ctrlService: ControlService) {
      this.BillNo = navParams.get('BillNo');
      this.BillSerId = navParams.get('BillserId');
      this.UniqueNo = navParams.get('UniqueNo');
      this.ctrlService.get('sessionInvenBranchId').then((val) => {
        if (val != null) {
          this.branchId = val;
        }
      });

      this.ctrlService.get('sessionsurl').then((val) => {
        if (val != null) {
          this.ApiUrl = val;
          this.fnSettings();
        }
      });
     }

  ngOnInit() {this._unsubscribeAll = new Subject();}


  async fnSettings() {

    var dictArgmts = { ProcName: 'Settings_GetValues' };

    let body = JSON.stringify(dictArgmts);

    await this.appService.fnApiPost(this.ApiUrl + '/Master/fnSettings', body)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise()
      .then(data => {
        var jsondata: any = data;

        for (var i = 0; i < jsondata.length; i++) {


          if (jsondata[i].KeyValue == 'BankDetailsImg') {
            this.ImageName = jsondata[i].Value;
          } else if (jsondata[i].KeyValue == 'Jurisdiction') {
            this.Jurisdiction = jsondata[i].Value;
          } else if (jsondata[i].KeyValue == 'ImageSave') {
            this.strImageSave = jsondata[i].Value;
          } else if (jsondata[i].KeyValue == 'QtyDecPlace') {
            if (jsondata[i].Value != '0') {
              this.dQtyDecimalPlace = 3;
            }
          } else if (jsondata[i].KeyValue == 'DecimalPlace') {
            this.dRateDecimalPlace = parseFloat(jsondata[i].Value || 0);
          } else if (jsondata[i].KeyValue == 'SameItemPrintOneLine') {
            if (jsondata[i].Value == 'Yes') {
              this.bSameItemPrintOneLine = true;
            }
          }

        }

        this.fnPrintDisplaySetting();
      }, error => console.error(error));

  }

  async fnPrintDisplaySetting() {
    let ServiceParams = {};
    ServiceParams['strProc'] = 'PrintDisplaySettings_Gets';
    ServiceParams['JsonFileName'] = 'JsonArrayScriptFour';

    let oProcParams = [];
    let ProcParams = {};

    ProcParams['strKey'] = '@ParamsPrintName';
    ProcParams['strArgmt'] = 'PrintModelHalfPage';
    oProcParams.push(ProcParams);
    ServiceParams['oProcParams'] = oProcParams;
    let body = JSON.stringify(ServiceParams);
    await this.appService.fnApiPost(`${this.ApiUrl}/CommonQuery/fnGetDataReportFromScriptJsonFile`, body)
    .pipe(takeUntil(this._unsubscribeAll)).toPromise()
      .then(data => {
        let result: any = data;
        this.PrintItemColumnDetails = JSON.parse(result.JsonDetails[0]);
        this.PrintItemColumnDetails.forEach(element => {
          if (element.ColumnName == 'Product') {
            this.ItemDescLen = (parseFloat(element.Width || 0) / 7);
            this.ItemDescLen = Math.round(this.ItemDescLen)
          }

        });

        if (JSON.parse(data.JsonDetails[2]).length > 0) {
          this.bPrintLogo = true;
        }
        if (JSON.parse(data.JsonDetails[1]).length > 0) {
          this.bPrintHeaderImage = true;
        }

        if (JSON.parse(data.JsonDetails[3]).length > 0) {
          this.bProductNextLine = true;
        }

        if (JSON.parse(data.JsonDetails[4]).length > 0) {
          this.bBackgroundImageMask = JSON.parse(data.JsonDetails[4])[0].bActive;
        }

        if (JSON.parse(data.JsonDetails[7]).length > 0) {
          this.bDeclaration = JSON.parse(data.JsonDetails[7])[0].bActive;
        }

        if (!this.bDeclaration) {
          this.nNoOfItemPerPage = this.nNoOfItemPerPage + 4;
          this.dProductDetailsHeight = this.dProductDetailsHeight + 61;
        }
        var JsonPrintFooterDetails = JSON.parse(data.JsonDetails[5]);
        JsonPrintFooterDetails.forEach(element => {
          if (element.ColumnName == 'FotterTaxsection') {
            this.dFotterTaxsectionWidth = element.Width;

          } else if (element.ColumnName == 'FooterAmountSection') {
            this.dFooterAmountSectionWidth = element.Width;

          } else if (element.ColumnName == 'FooterAmountWordSection') {
            this.dFooterAmountWordSectionWidth = element.Width;
          }
          else if (element.ColumnName == 'QRCodeWidth') {
            this.dQRCodeWidth = element.Width;
          }
        });

        var JsonPrintCustomerDetails = JSON.parse(data.JsonDetails[6]);
        JsonPrintCustomerDetails.forEach(element => {
          if (element.ColumnName == 'CustomerBoxOne') {
            this.dCustomerBox1 = element.Width;

          } else if (element.ColumnName == 'CustomerBoxTwo') {
            this.dCustomerBox2 = element.Width;

          } else if (element.ColumnName == 'CustomerBoxThree') {
            this.dCustomerBox3 = element.Width;
          }
        });

        this.dFooterAmountSectionWidth = this.divPageWidth - this.dFotterTaxsectionWidth - this.dFooterAmountWordSectionWidth - 2;//   this.dFotterTaxsectionWidth = event.newWidth;
        if (this.dQRCodeWidth > 0) {
          this.dFooterAmountSectionWidth = this.dFooterAmountSectionWidth - this.dQRCodeWidth;//   this.dFotterTaxsectionWidth = event.newWidth;
        }

        this.dTotFooterAmountSectionWidth = this.dFooterAmountSectionWidth + this.dFooterAmountWordSectionWidth;

        this.fnBillPrint(this.BillSerId, this.BillNo, this.UniqueNo, this.PrintHeader);

      });
  }


  async fnBillPrint(BillSerId, BillNo, UniqueNo, PrintHeader) {

    var JsonIssueSubDetailsInfo: any;

      var varArguements = {};
      varArguements = { BillSerId: BillSerId, BillNo: BillNo, UniqueNo: UniqueNo, BranchId: this.branchId };

      var DictionaryObject = {};
      DictionaryObject['dictArgmts'] = varArguements;
      DictionaryObject['ProcName'] = '';

      let strUrlName = "Sales/Sales_CopyPrint";
      if (this.bSameItemPrintOneLine) {
        strUrlName = "Sales/Sales_CopyPrintOne";
      }

      let body = JSON.stringify(DictionaryObject);
      await this.appService.fnApiPost(`${this.ApiUrl}/${strUrlName}`, body)
      .pipe(takeUntil(this._unsubscribeAll)).toPromise()
        .then(data => {

          JsonIssueSubDetailsInfo = JSON.parse(data.JsonIssueSubDetailsInfo);
          this.JsonIssueTaxInfo = JSON.parse(data.JsonIssueTaxInfo);
          this.JsonBranchInfo = JSON.parse(data.JsonBranchInfo)[0];
          this.JsonIssueInfo = JSON.parse(data.JsonIssueInfo)[0];

          this.strBillNo = this.JsonIssueInfo.BillSerPrefix + '-' + this.JsonIssueInfo.Issue_SlNo
          this.strBillDate = String(this.JsonIssueInfo.Issue_BillDate).split('-').reverse().join('/');
          this.strSupplyDate = String(this.JsonIssueInfo.Issue_DispDate).split('-').reverse().join('/');
          this.strOrderDate = String(this.JsonIssueInfo.Issue_OrderDate).split('-').reverse().join('/');
          this.strQRCode = this.JsonBranchInfo.Branch_QRCode;


    if (this.JsonIssueInfo.Addr3 == '') {

      this.dCustomerDetailsHeight = this.dCustomerDetailsHeight - 9;

    }

    let count = 1;
    let dBillRowTotal = 0;
    this.dBillBalance = parseFloat(this.JsonIssueInfo.OldBalance);
    let dBillRowTotalBeforeTotDis = 0;

    if (this.JsonIssueInfo.Issue_PayTerms == 'CREDIT') {
      this.dBillBalance = parseFloat(this.JsonIssueInfo.OldBalance) + parseFloat(this.JsonIssueInfo.Issue_Total)
    }

    if (this.JsonIssueInfo.Issue_ShippingName != '') {

      this.bShippingVisible = true;
      this.nfromOneWidth = 344;
    }

    // if (this.JsonIssueInfo.Issue_SaleType == '2') {
    //   this.strPTRHeaderName = 'RATE';
    //   this.strPTWHeaderName = 'PTW';
    // }



    var PTW;
    var PTR;
    PTW = 0;
    // GrossValue=0,TotGrossValue=0,TotTaxAmt=0,NetValue=0,TotNetValue=0,TotQty=0,TotFQty=0;
    // TotAmtBeforeTax=0,TotSGstTotal=0,TotCGstTotal=0,TotIGstTotal=0,TotDisAmt=0;
    var dRatePlusTax = 0;
    var dActualRate = 0;
    var strRateDisplay = '';
    JsonIssueSubDetailsInfo.forEach(element => {

      this.TotTaxAmt += parseFloat(element.IssueSub_TaxAmt);

      this.TotQty += parseFloat(element.IssueSub_Qty);
      this.TotFQty += parseFloat(element.IssueSub_FreeQty);
      this.TotCessAmt += parseFloat(element.IssueSub_CessAmt);

      this.TotAmtBeforeTax += parseFloat(element.IssueSub_Qty) * parseFloat(element.IssueSub_ActualRate);
      dBillRowTotal = parseFloat(element.IssueSub_Amount) - parseFloat(element.IssueSub_CessAmt);
      dBillRowTotalBeforeTotDis = dBillRowTotal + ((parseFloat(element.IssueSub_ActualRate) * (parseFloat(element.IssueSub_Qty) - parseFloat(element.IssueSub_RQty)) * parseFloat(this.JsonIssueInfo.Issue_DisPers)) / 100);
      this.TotRowDisAmt += parseFloat(element.IssueSub_ProdDisAmt);
      this.dTotBillRowTotal += dBillRowTotal;
      this.dTotAmtBeforeTotDis += dBillRowTotalBeforeTotDis;
      this.TotSGstTotal += parseFloat(element.IssueSub_SGSTTaxAmount);
      this.TotCGstTotal += parseFloat(element.IssueSub_CGSTTaxAmount);
      this.TotIGstTotal += parseFloat(element.IssueSub_IGSTTaxAmount);
      this.TotDisAmt += parseFloat(element.IssueSub_ProdDisAmt);
      if (element.Color.length > 1) {
        element.ItemDesc = element.ItemDesc + ' ' + String(element.Color);
      }

      dRatePlusTax = parseFloat(element.IssueSub_OriginalRate);

      if (element.Field2 != "Yes") {

        dRatePlusTax = dRatePlusTax + (dRatePlusTax * parseFloat(element.IssueSub_TaxPers || 0)) / 100;
        strRateDisplay = parseFloat(element.IssueSub_OriginalRate).toFixed(2);
        this.GrossValue = parseFloat(element.IssueSub_Qty) * parseFloat(element.IssueSub_ActualRate);
        this.TotGrossValue += this.GrossValue;

      } else {

        dActualRate = parseFloat(element.IssueSub_OriginalRate);
        dActualRate = parseFloat(element.IssueSub_OriginalRate) - ((parseFloat(element.IssueSub_OriginalRate) * parseFloat(element.IssueSub_TaxPers)) / (100 + parseFloat(element.IssueSub_TaxPers)));
        strRateDisplay = eval(dActualRate.toFixed(5));
        this.GrossValue = parseFloat(element.IssueSub_Qty) * (dActualRate);
        this.TotGrossValue += this.GrossValue;
      }

      this.NetValue = this.GrossValue - parseFloat(element.IssueSub_ProdDisAmt)
      this.TotNetValue += this.NetValue;

      PTW = 0;
      PTR = 0;

      if (this.JsonIssueInfo.Issue_SaleType == '2') {
        PTW = parseFloat(element.IssueSub_ActualRate).toFixed(2);
        PTR = parseFloat(element.IssueSub_DistRate).toFixed(2);
      } else {
        PTW = parseFloat(element.IssueSub_SelRate).toFixed(2);
        PTR = parseFloat(element.IssueSub_ActualRate).toFixed(2);
      }

      this.JsonSub = {

        SlNo: count.toFixed(), ItemDesc: this.CalcColSpaces(element.ItemDesc, this.ItemDescLen), HSNCode: element.HSNCode,
        IssueSub_TaxPers: parseInt(element.IssueSub_TaxPers).toFixed(), IssueSub_Qty: parseFloat(element.IssueSub_Qty).toFixed(this.dQtyDecimalPlace),
        IssueSub_OriginalRate: (dRatePlusTax).toFixed(2),
        CashDisc: parseFloat(element.IssueSub_PdodDis).toFixed(2), GrossValue: (this.GrossValue).toFixed(2),
        Rate: strRateDisplay, IssueSub_TaxAmt: parseFloat(element.IssueSub_TaxAmt).toFixed(2),
        RowTotal: dBillRowTotal.toFixed(2), IssueSub_Mrp: parseFloat(element.IssueSub_Mrp).toFixed(2)
        , Unit: element.Unit, Batch: element.IssueSub_Batch, ExpDate: this.DateRetExpiryFormat(element.IssueSub_ExpDate),
        IssueSub_FreeQty: parseFloat(element.IssueSub_FreeQty).toFixed(this.dQtyDecimalPlace), SchemAmt: parseFloat(element.IssueSub_SchmAmt).toFixed(2)
        , MFR: element.MFRNo, PTR: parseFloat(element.IssueSub_ActualRate).toFixed(2), PTW: PTW,
        CessPers: parseFloat(element.IssueSub_CessPers).toFixed(2), CessAmt: parseFloat(element.IssueSub_CessAmt).toFixed(2),
        AmtBeforeTotDis: dBillRowTotalBeforeTotDis.toFixed(2), IssueSub_ProdDisAmt: parseFloat(element.IssueSub_ProdDisAmt).toFixed(2)

      }


      this.JsonSubInfo.push(this.JsonSub);

      if (this.bProductNextLine) {
        if (element.ItemDesc.length > this.ItemDescLen) {

          this.JsonSub = {
            SlNo: '', ItemDesc: this.CalcColSpaces(element.ItemDesc.substring(this.ItemDescLen - 1, element.ItemDesc.length), this.ItemDescLen), HSNCode: '',
            IssueSub_TaxPers: '', IssueSub_Qty: '', IssueSub_OriginalRate: '',
            CashDisc: '', GrossValue: '', Rate: '', IssueSub_TaxAmt: '',
            RowTotal: '', IssueSub_Mrp: '', Unit: '', Batch: '', ExpDate: '',
            IssueSub_FreeQty: '', SchemAmt: '', MFR: '', PTR: '', PTW: '', CessPers: '', CessAmt: '', AmtBeforeTotDis: '', IssueSub_ProdDisAmt: ''
          }

          this.JsonSubInfo.push(this.JsonSub);

        }

      }

      count = count + 1;

    });

    let bOtherTaxFlag = false;
    if (parseFloat(this.JsonIssueInfo.Issue_OtherCharge || 0) > 0) {

      if (parseFloat(this.JsonIssueInfo.Issue_OtherTaxAmt) > 0) {
        bOtherTaxFlag = false;
        this.JsonIssueTaxInfo.forEach(element => {
          bOtherTaxFlag = true;
          if (element.TaxId = this.JsonIssueInfo.OtherTaxId) {
            element.Amount = parseFloat(element.Amount) + parseFloat(this.JsonIssueInfo.Issue_OtherCharge);
            element.TaxAmount = parseFloat(element.TaxAmount) + parseFloat(this.JsonIssueInfo.Issue_OtherTaxAmt);
            element.SGSTTaxAmount += parseFloat(this.JsonIssueInfo.Issue_OtherSGST);
            element.CGSTTaxAmount += parseFloat(this.JsonIssueInfo.Issue_OtherCGST);
            element.IGSTTaxAmount += parseFloat(this.JsonIssueInfo.Issue_OtherIGST);
            this.TotSGstTotal += parseFloat(this.JsonIssueInfo.Issue_OtherSGST);
            this.TotCGstTotal += parseFloat(this.JsonIssueInfo.Issue_OtherCGST);
            this.TotIGstTotal += parseFloat(this.JsonIssueInfo.Issue_OtherIGST);
          }
        });
      }

      dBillRowTotal = parseFloat(this.JsonIssueInfo.Issue_OtherCharge) + parseFloat(this.JsonIssueInfo.Issue_OtherTaxAmt);
      this.dTotBillRowTotal += dBillRowTotal;

      dBillRowTotalBeforeTotDis = dBillRowTotal;
      this.dTotAmtBeforeTotDis += dBillRowTotalBeforeTotDis;

      this.GrossValue = parseFloat(this.JsonIssueInfo.Issue_OtherCharge);
      this.TotGrossValue += this.GrossValue;
      this.NetValue = this.GrossValue + parseFloat(this.JsonIssueInfo.Issue_OtherTaxAmt);
      this.TotNetValue += this.NetValue;
      this.TotTaxAmt += parseFloat(this.JsonIssueInfo.Issue_OtherTaxAmt);
      this.TotAmtBeforeTax += parseFloat(this.JsonIssueInfo.Issue_OtherCharge);


      this.JsonSub = {

        SlNo: count.toFixed(), ItemDesc: this.CalcColSpaces(this.JsonIssueInfo.Field2, this.ItemDescLen), HSNCode: '',
        IssueSub_TaxPers: parseInt(this.JsonIssueInfo.Issue_OtherTaxPers).toFixed(), IssueSub_Qty: "1",
        IssueSub_OriginalRate: (this.JsonIssueInfo.Issue_OtherCharge).toFixed(2),
        CashDisc: parseFloat("0").toFixed(2), GrossValue: (this.GrossValue).toFixed(2),
        Rate: strRateDisplay, IssueSub_TaxAmt: parseFloat(this.JsonIssueInfo.Issue_OtherTaxAmt).toFixed(2),
        RowTotal: dBillRowTotal.toFixed(2), IssueSub_Mrp: parseFloat("0").toFixed(2)
        , Unit: '', Batch: '', ExpDate: '', IssueSub_FreeQty: "0", SchemAmt: "0"
        , MFR: "", PTR: '', PTW: '', CessPers: '', CessAmt: '', AmtBeforeTotDis: dBillRowTotalBeforeTotDis.toFixed(2)
        , IssueSub_ProdDisAmt: ''
      }

      this.JsonSubInfo.push(this.JsonSub);
      count = count + 1;

    }

    if (parseFloat(this.JsonIssueInfo.Issue_Freight || 0) > 0) {

      if (parseFloat(this.JsonIssueInfo.Issue_CourierTaxAmt) > 0) {
        bOtherTaxFlag = false;
        this.JsonIssueTaxInfo.forEach(element => {
          bOtherTaxFlag = true;
          if (element.TaxId = this.JsonIssueInfo.CourierTaxId) {
            element.Amount = parseFloat(element.Amount) + parseFloat(this.JsonIssueInfo.Issue_Freight);
            element.TaxAmount = parseFloat(element.TaxAmount) + parseFloat(this.JsonIssueInfo.Issue_CourierTaxAmt);
            element.SGSTTaxAmount += parseFloat(this.JsonIssueInfo.Issue_CourierSGST);
            element.CGSTTaxAmount += parseFloat(this.JsonIssueInfo.Issue_CourierCGST);
            element.IGSTTaxAmount += parseFloat(this.JsonIssueInfo.Issue_CourierIGST);
            this.TotSGstTotal += parseFloat(this.JsonIssueInfo.Issue_CourierSGST);
            this.TotCGstTotal += parseFloat(this.JsonIssueInfo.Issue_CourierCGST);
            this.TotIGstTotal += parseFloat(this.JsonIssueInfo.Issue_CourierIGST);
          }
        });
      }

      dBillRowTotal = parseFloat(this.JsonIssueInfo.Issue_Freight) + parseFloat(this.JsonIssueInfo.Issue_CourierTaxAmt);
      this.dTotBillRowTotal += dBillRowTotal;
      dBillRowTotalBeforeTotDis = dBillRowTotal;
      this.dTotAmtBeforeTotDis += dBillRowTotalBeforeTotDis;

      this.GrossValue = parseFloat(this.JsonIssueInfo.Issue_Freight);
      this.TotGrossValue += this.GrossValue;
      this.NetValue = this.GrossValue + parseFloat(this.JsonIssueInfo.Issue_CourierTaxAmt);
      this.TotNetValue += this.NetValue;
      this.TotNetValue += this.NetValue;
      this.TotTaxAmt += parseFloat(this.JsonIssueInfo.Issue_CourierTaxAmt);
      this.TotAmtBeforeTax += parseFloat(this.JsonIssueInfo.Issue_Freight);

      this.JsonSub = {

        SlNo: count.toFixed(), ItemDesc: this.CalcColSpaces('Courier Charge', this.ItemDescLen), HSNCode: '',
        IssueSub_TaxPers: parseInt(this.JsonIssueInfo.Issue_OtherTaxPers).toFixed(), IssueSub_Qty: "1",
        IssueSub_OriginalRate: (this.JsonIssueInfo.Issue_Freight).toFixed(2),
        CashDisc: parseFloat("0").toFixed(2), GrossValue: (this.GrossValue).toFixed(2),
        Rate: strRateDisplay, IssueSub_TaxAmt: parseFloat(this.JsonIssueInfo.Issue_CourierTaxAmt).toFixed(2),
        RowTotal: dBillRowTotal.toFixed(2), IssueSub_Mrp: parseFloat("0").toFixed(2)
        , Unit: '', Batch: '', ExpDate: '', IssueSub_FreeQty: "0", SchemAmt: "0", MFR: "", PTR: '', PTW: ''
        , CessPers: '', CessAmt: '', AmtBeforeTotDis: dBillRowTotalBeforeTotDis.toFixed(2), IssueSub_ProdDisAmt: ''

      }

      this.JsonSubInfo.push(this.JsonSub);
      count = count + 1;

    }


    if (parseFloat(this.JsonIssueInfo.Issue_TCSAmt || 0) > 0) {


      dBillRowTotal = parseFloat(this.JsonIssueInfo.Issue_TCSAmt);
      this.dTotBillRowTotal += dBillRowTotal;

      this.JsonSub = {

        SlNo: "", ItemDesc: this.CalcColSpaces('TCS (' + parseFloat(this.JsonIssueInfo.Issue_TCSPers || 0).toFixed(3) + '%)', this.ItemDescLen), HSNCode: '',
        IssueSub_TaxPers: '', IssueSub_Qty: "", IssueSub_OriginalRate: '', CashDisc: '', GrossValue: '',
        Rate: '', IssueSub_TaxAmt: '', RowTotal: parseFloat(this.JsonIssueInfo.Issue_TCSAmt).toFixed(2), IssueSub_Mrp: ''
        , Unit: '', Batch: '', ExpDate: '', IssueSub_FreeQty: "0", SchemAmt: "0", MFR: "", PTR: '', PTW: ''
        , CessPers: '', CessAmt: '', AmtBeforeTotDis: parseFloat(this.JsonIssueInfo.Issue_TCSAmt).toFixed(2), IssueSub_ProdDisAmt: ''

      }

      this.JsonSubInfo.push(this.JsonSub);

    }

    this.TotDisAmt += parseFloat(this.JsonIssueInfo.Issue_DisAmt);
    this.TotAfterDiscount = this.TotAmtBeforeTax - this.TotDisAmt;


    var nRemainter = parseInt(<any>(this.JsonSubInfo.length % this.nNoOfItemPerPage));
    var nNoOfPage = this.JsonSubInfo.length - nRemainter;
    nNoOfPage = nNoOfPage / this.nNoOfItemPerPage;

    if (nRemainter > 0) {
      nNoOfPage = nNoOfPage + 1;
    }

    var nStartNo = 0;
    var arr1: any;

    for (var i = 0; i < nNoOfPage; i++) {

      if (this.JsonSubInfo.length <= (i + 1) * this.nNoOfItemPerPage) {

        arr1 = this.JsonSubInfo.slice(nStartNo, this.JsonSubInfo.length);

      } else {

        arr1 = this.JsonSubInfo.slice(nStartNo, (i + 1) * this.nNoOfItemPerPage);
        nStartNo = nStartNo + this.nNoOfItemPerPage;

      }

      this.JsonSub = {
        SlNo: '', ItemDesc: '', HSNCode: '', IssueSub_TaxPers: '', IssueSub_Qty: '', IssueSub_OriginalRate: '', CashDisc: '', GrossValue: '',
        Rate: '', IssueSub_TaxAmt: '', RowTotal: '', IssueSub_Mrp: '', Unit: '', Batch: '', ExpDate: '', IssueSub_FreeQty: '',
        SchemAmt: '', MFR: '', PTR: '', PTW: '', CessPers: '', CessAmt: '', AmtBeforeTotDis: '', IssueSub_ProdDisAmt: ''
      }
      if (arr1.length < this.nNoOfItemPerPage) {
        for (var j = arr1.length; j < this.nNoOfItemPerPage; j++) {
          arr1.push(this.JsonSub);
        }
      }
      this.oArray.push(arr1);

    }
  }, error => console.error(error));
      // console.log(this.JsonIssueInfo.AmtInWords);
    // setTimeout(() => {
    //   window.print();
    //   if(this.strDirectPrint=="Yes"){
    //     window.close();
    //   }
    // }, 700);

    // this.oArray.push(row);
  }

  DateRetExpiryFormat(value) {

    var BillDate = value;
    var BillDate1 = BillDate.split('-');
    var Dates = BillDate1[1] + '/' + BillDate1[0].substring(2, 4);
    return Dates;

  }

  CalcColSpaces(strValue, nPadLength) {

    if (strValue.length > nPadLength) {
      strValue = strValue.substring(0, nPadLength - 1);
    }
    return strValue;

  }


  fnPrintpage() {
    // let popupWinindow ;
    // const innerContents = document.getElementById('printer_content').innerHTML;
    // popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    // popupWinindow.document.open();
    // popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="assets/css/print-modalone.css" /></head><body onload="window.print()">' + innerContents + '</html>');
    // popupWinindow.document.close();
    // return;

    setTimeout(() => {
      // file:///android_asset/www/
      const content = document.getElementById('printer_content').innerHTML;
      const page = `<html>
    <head>
    <link rel="stylesheet" type="text/css" href="../assets/css/print-modalone.css" />
    </head>
    <body>
    ${content}
    </body>
    </html>`;
    const printoption: PrintOptions = {
      name: 'vansales',
      duplex: false,
      orientation: 'portrait',

    };

      let pdfoption = {
      documentSize: "A4",
      type: "share",
      fileName: 'my-pdf.pdf'
    }


        this.printer.print(page, printoption).then(onError => {
          console.log(onError);
        });
      // }).catch(() => {
      //   this.pdfGenerator.fromData(page, pdfoption);
      // })

    }, 200);


  }


  async fnSharepage() {

    this.ctrlService.onLoading('Creating PDF file...');

    const element:any = document.getElementById('printer_content') as HTMLDivElement;
    const option = { allowTaint: true, useCORS: true };
    let content:HTMLDivElement = element.firstChild;

    await html2canvas(content, option).then((canvas) => {

        canvas.getContext('2d');
        const dataUrl = canvas.toDataURL('image/png');
        const doc = new jsPDF("p","mm","a4");
        const bufferX = 5;
        const bufferY = 5;
        const imgProps = (<any>doc).getImageProperties(dataUrl);
        const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          doc.addImage(dataUrl, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
       //Add image Url to PDF
       let pdfOutput = doc.output();
       let buffer = new ArrayBuffer(pdfOutput.length);
       let array = new Uint8Array(buffer);
       for (var i = 0; i < pdfOutput.length; i++) {
         array[i] = pdfOutput.charCodeAt(i);
       }

       const directory = this.file.cacheDirectory ;
        // const fileName = `invoiceBill_Bill.pdf`;
        let date = new Date().getTime();
        const fileName = `invoiceBill_${date}.pdf`;
       let options: IWriteOptions = { replace: true };

       this.file.checkFile(directory, fileName).then((success)=> {
         //Writing File to Device
         this.file.writeFile(directory,fileName,buffer, options)
         .then((success)=> {

           this.ctrlService.hideLoader();
           console.log("File created Succesfully" + JSON.stringify(success));
           setTimeout(() => {
             this.socialSharing.share('invoiceBill', null, directory + fileName, null);
           });

         }).catch((error)=> {
          this.ctrlService.hideLoader();
           console.log("Cannot Create File " +JSON.stringify(error));
         });
       }).catch((error)=> {
         //Writing File to Device
         this.file.writeFile(directory,fileName,buffer)
         .then((success)=> {
          this.ctrlService.hideLoader();
           console.log("File created Succesfully" + JSON.stringify(success));
           setTimeout(() => {
             this.socialSharing.share('invoiceBill', null, directory + fileName, null);
           });
         }).catch((error)=> {
          this.ctrlService.hideLoader();
           console.log("Cannot Create File " +JSON.stringify(error));
         });
       });
     }).catch(function (error) {
      this.ctrlService.hideLoader();
       console.error('oops, something went wrong!', error);
     });

   }
   fnClose() {
    this.modalpage.dismiss();
  }


ngOnDestroy(): void {

  this._unsubscribeAll.next();
  this._unsubscribeAll.complete();
}
}
