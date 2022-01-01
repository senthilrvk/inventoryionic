import { Component, Input, OnInit } from '@angular/core';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { ModalController, NavParams } from '@ionic/angular';
import { Subject } from 'rxjs';
import { AppService } from 'src/app/app.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PDFGenerator } from '@ionic-native/pdf-generator/ngx';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';

@Component({
  selector: 'app-printmodelcreditnote',
  templateUrl: './printmodelcreditnote.component.html',
  styleUrls: ['./printmodelcreditnote.component.scss'],
})
export class PrintmodelcreditnoteComponent implements OnInit {


  bHeaderLine: boolean = false;

  PrintFormat: any;
  dBranchId: any;
  strBranchName: any;
  oArray = new Array();
  JsonIssueInfo: any;
  JsonBranchInfo: any;
  JsonIssueTaxInfo: any;
  strLogoImageName = "";
  bBackgroundImageMask = false;
  bPrintLogo: boolean = false;
  bPrintHeaderImage: boolean = false;
  strInvoiceHeaderName = 'CREDIT NOTE';
  dCustomerDetailsHeight = 125;
  strBillNo: any;
  strBillDate: any;
  dProductDetailsHeight = 496;
  strPTRHeaderName: string = 'PTR'
  strPTWHeaderName: string = 'RATE'
  PrintItemColumnDetails: any;
  ImageName: string;
  Jurisdiction: string;
  strImageSave: string;
  dQtyDecimalPlace: number = 0;
  dRateDecimalPlace: number;
  bSameItemPrintOneLine = false;
  TotAfterDiscount: number;
  bDeclaration: boolean = false;
  JsonSubInfo = [];
  dFotterTaxsectionWidth = 0;
  dFooterAmountSectionWidth = 0;
  dFooterAmountWordSectionWidth = 0;
  dTotFooterAmountSectionWidth = 0;
  dQRCodeWidth = 0;
  dCustomerBox1 = 0;
  dCustomerBox2 = 0;
  dCustomerBox3 = 0;
  bEditWidth: boolean = false;
  TotAmtBeforeTax = 0; TotSGstTotal = 0; TotCGstTotal = 0; TotIGstTotal = 0; TotDisAmt = 0; TotCessAmt = 0; dTotBillRowTotal = 0;
  dTotAmtBeforeTotDis: number = 0;
  GrossValue = 0; TotGrossValue = 0; TotTaxAmt = 0; NetValue = 0; TotNetValue = 0; TotQty = 0; TotFQty = 0; TotRowDisAmt = 0;
  nNoOfItemPerPage = 30;
  bPayTerms: boolean = false;
  bSalesman: boolean = false;
  dDeclareWordSectionWidth = 0;
  dSignatureSectionWidth = 0;
  bDeclarationFirstLineBold: boolean = false;
  bHeaderVisible: boolean = false;

  JsonSub = {
    SlNo: '', ItemDesc: '', HSNCode: '', IssueSub_TaxPers: '', IssueSub_Qty: '', IssueSub_OriginalRate: '', CashDisc: '', GrossValue: '',
    Rate: '', IssueSub_TaxAmt: '', RowTotal: '', IssueSub_Mrp: '', Unit: '', Batch: '', ExpDate: '', IssueSub_FreeQty: '',
    SchemAmt: '', MFR: '', PTR: '', PTW: '', CessPers: '', CessAmt: '', AmtBeforeTotDis: '',
    IssueSub_ProdDisAmt: '', PurInvoiceNo: '', PurInvoiceDate: ''
  }
  bProductNextLine: boolean = false;

  ItemDescLen = 30;
  strFooterImage = "";
  strHeaderImage = "";
  dBranchBoxHeight = 107
  strBackgroundMaskImage = "";
  strAmtInwords = "";
  argTaxIds: any;
  ApiUrl: any;
  private _unsubscribeAll: Subject<any>;
  @Input() ReturnNo: string;
  @Input() UniqueRetNo: string;

  constructor(private appService: AppService, public navParams: NavParams
    , public ctrlService: ControlService, private printer: Printer,
    private file: File,private socialSharing: SocialSharing
    ,private modalpage: ModalController,) {
    this.ReturnNo = navParams.get('ReturnNo');
    this.UniqueRetNo = navParams.get('UniqueRetNo');

    this.ctrlService.get('sessionInvenBranchId').then((val) => {
      if (val != null) {
        this.dBranchId = val;
      }
    });

    this.ctrlService.get('sessionsurl').then((val) => {
      if (val != null) {
        this.ApiUrl = val;
        this.fnTaxGets();
      }
    });

  }

  ngOnInit() {


    // setTimeout(() => {
    //   document.getElementById('pre-loader').style.display = 'none';
    // }, 10);
    this._unsubscribeAll = new Subject();
  }


  async fnTaxGets() {

    let ProcName = { ProcName: 'Tax_Gets' }
    await this.appService.fnApiPost(this.ApiUrl + '/Master/TaxGets', ProcName)
      .pipe()
      .toPromise().then(data => {
        this.argTaxIds = data;
        this.fnSettings();
      });

  }

  async fnPrintImageGets() {

    let ServiceParams = {};
    ServiceParams['strProc'] = 'ProductImageSet_Gets';
    ServiceParams['JsonFileName'] = 'JsonArrayScriptTen';

    let body = JSON.stringify(ServiceParams);
    await this.appService.fnApiPost(this.ApiUrl + '/CommonQuery/fnGetDataReportFromScriptJsonFile', body).toPromise()
      .then(data => {
        var jsonData = JSON.parse(data.JsonDetails[0]);
        var JsonPrintImageData = jsonData.filter(element => element.PrintImage_PrintName == 'PrintModelCreditNote');
        console.log(JsonPrintImageData);

        JsonPrintImageData.forEach(element => {

          if (element.PrintImage_Position == 'CreditNoteHeader') {
            this.strHeaderImage = 'https://s3.ap-south-1.amazonaws.com/codeappsimageerp/' + element.PrintImage_Name;
          } else if (element.PrintImage_Position == 'CreditNoteFooter') {
            this.strFooterImage = 'https://s3.ap-south-1.amazonaws.com/codeappsimageerp/' + element.PrintImage_Name;
          } else if (element.PrintImage_Position == 'CreditNoteBackgroundMask') {
            this.strBackgroundMaskImage = 'https://s3.ap-south-1.amazonaws.com/codeappsimageerp/' + element.PrintImage_Name;
          }
        });
        this.fnPrintDisplaySetting();
      });
  }





  async fnSettings() {

    var dictArgmts = { ProcName: 'Settings_GetValues' };

    let body = JSON.stringify(dictArgmts);

    await this.appService.fnApiPost(this.ApiUrl + '/Master/fnSettings', body).toPromise()
      .then(data => {
        var jsondata = data;

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

        this.fnPrintImageGets();
      }, error => console.error(error));

  }

  async fnPrintDisplaySetting() {

    let ServiceParams = {};
    ServiceParams['strProc'] = 'PrintDisplaySettings_Gets';
    ServiceParams['JsonFileName'] = 'JsonArrayScriptFour';

    let oProcParams = [];
    let ProcParams = {};

    ProcParams['strKey'] = '@ParamsPrintName';
    ProcParams['strArgmt'] = 'PrintModelCreditNote';
    oProcParams.push(ProcParams);
    ServiceParams['oProcParams'] = oProcParams;
    let body = JSON.stringify(ServiceParams);
    await this.appService.fnApiPost(this.ApiUrl + '/CommonQuery/fnGetDataReportFromScriptJsonFile', body).toPromise()
      .then(data => {

        this.PrintItemColumnDetails = JSON.parse(data.JsonDetails[0]);

        this.PrintItemColumnDetails.forEach(element => {

          if (element.ColumnName == 'Product') {
            this.ItemDescLen = (parseFloat(element.Width || 0) / 7);
            this.ItemDescLen = Math.round(this.ItemDescLen);
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


        if (JSON.parse(data.JsonDetails[12]).length > 0) {
          this.dCustomerDetailsHeight = parseFloat(JSON.parse(data.JsonDetails[12])[0].Width || 0);
        }

        if (JSON.parse(data.JsonDetails[15]).length > 0) {
          this.dBranchBoxHeight = parseFloat(JSON.parse(data.JsonDetails[15])[0].Width || 0);
        }

        if (JSON.parse(data.JsonDetails[16]).length > 0) {
          this.nNoOfItemPerPage = parseFloat(JSON.parse(data.JsonDetails[16])[0].Width || 0);
        }

        if (JSON.parse(data.JsonDetails[7]).length > 0) {
          this.bDeclaration = JSON.parse(data.JsonDetails[7])[0].bActive;
        }

        if (JSON.parse(data.JsonDetails[14]).length > 0) {
          this.bPayTerms = true;
        }

        if (JSON.parse(data.JsonDetails[13]).length > 0) {
          this.bSalesman = true;
        }

        if (JSON.parse(data.JsonDetails[21]).length > 0) {
          this.bHeaderLine = true;
        }

        if (JSON.parse(data.JsonDetails[22]).length > 0) {
          this.bHeaderVisible = true;
        }

        if (JSON.parse(data.JsonDetails[23]).length > 0) {
          this.bDeclarationFirstLineBold = true;
        }

        if (JSON.parse(data.JsonDetails[18]).length > 0) {
          this.dDeclareWordSectionWidth = parseFloat(JSON.parse(data.JsonDetails[18])[0].Width || 0);
        }

        if (JSON.parse(data.JsonDetails[19]).length > 0) {
          this.dSignatureSectionWidth = parseFloat(JSON.parse(data.JsonDetails[19])[0].Width || 0);
        }

        this.dTotFooterAmountSectionWidth = this.dFooterAmountSectionWidth + this.dFooterAmountWordSectionWidth;

        this.fnBillPrint(this.ReturnNo, this.UniqueRetNo);

      });

  }


  async fnBillPrint(ReturnNo, UniqueNo) {

    var JsonIssueSubDetailsInfo: any;
    var varArguements = {};
    varArguements = { BillNo: ReturnNo, UniqueNo: UniqueNo, BranchId: this.dBranchId };

    var DictionaryObject = {};
    DictionaryObject['dictArgmts'] = varArguements;
    DictionaryObject['ProcName'] = '';
    let body = JSON.stringify(DictionaryObject);

    await this.appService.fnApiPost(this.ApiUrl + '/Sales/fnSalesReturn_Copy', body).toPromise()
      .then(data => {

        JsonIssueSubDetailsInfo = JSON.parse(data.JsonIssueSubDetailsInfo);
        this.JsonIssueTaxInfo = JSON.parse(data.JsonIssueTaxInfo);
        this.JsonBranchInfo = JSON.parse(data.JsonBranchInfo)[0];
        this.JsonIssueInfo = JSON.parse(data.JsonIssueInfo)[0];

      });


    this.argTaxIds.forEach(taxarg => {

      taxarg.Amount = null;
      taxarg.TaxAmount = null;
      taxarg.SGSTTaxAmount = null;
      taxarg.CGSTTaxAmount = null;
      taxarg.IGSTTaxAmount = null;
      taxarg.AdditionalCessAmt = null;

      this.JsonIssueTaxInfo.forEach(element => {

        if (taxarg.TaxID == element.TaxId) {
          taxarg.Amount = element.Amount;
          taxarg.TaxAmount = element.TaxAmount;
          taxarg.SGSTTaxAmount = element.SGSTTaxAmount;
          taxarg.CGSTTaxAmount = element.CGSTTaxAmount;
          taxarg.IGSTTaxAmount = element.IGSTTaxAmount;
          taxarg.AdditionalCessAmt = element.AdditionalCessAmt;
        }

      });

    });

    this.strBillNo = this.JsonIssueInfo.IssueRetSlNo

    if (this.JsonIssueInfo.Prefix != '') {

      this.strBillNo = this.JsonIssueInfo.Prefix + '-' + this.JsonIssueInfo.IssueRetSlNo;

    }

    this.strBillDate = String(this.JsonIssueInfo.IssueRetDate).split('-').reverse().join('/');

    let count = 1;
    let dBillRowTotal = 0;
    let dBillRowTotalBeforeTotDis = 0;

    // if (this.JsonIssueInfo.Issue_SaleType == '2') {
    //   this.strPTRHeaderName = 'RATE';
    //   this.strPTWHeaderName = 'PTW';
    // }

    if (this.JsonBranchInfo.ComImage != '') {

      this.strLogoImageName = 'https://s3.ap-south-1.amazonaws.com/codeappsimageerp/' + this.JsonBranchInfo.ComImage;

    }

    var PTW;
    var PTR;
    PTW = 0;

    var dRatePlusTax = 0;
    var dActualRate = 0;
    var strRateDisplay = '';

    JsonIssueSubDetailsInfo.forEach(element => {

      this.TotTaxAmt += parseFloat(element.IssueSub_TaxAmt);

      this.TotQty += parseFloat(element.IssueSub_RQty);
      this.TotFQty += parseFloat(element.IssueSub_RFreeQty);
      this.TotCessAmt += parseFloat(element.IssueSub_CessAmt);
      this.TotRowDisAmt += parseFloat(element.IssueSub_ProdDisAmt);
      this.TotAmtBeforeTax += parseFloat(element.IssueSub_RQty) * parseFloat(element.IssueSub_ActualRate);
      dBillRowTotal = parseFloat(element.IssueSub_Amount);
      dBillRowTotalBeforeTotDis = dBillRowTotal + ((parseFloat(element.IssueSub_ActualRate) * (parseFloat(element.IssueSub_RQty)) * parseFloat(this.JsonIssueInfo.Issue_DisPers)) / 100);


      this.dTotBillRowTotal += dBillRowTotal;
      this.dTotAmtBeforeTotDis += dBillRowTotalBeforeTotDis;
      this.TotSGstTotal += parseFloat(element.IssueSub_SGSTTaxAmount);
      this.TotCGstTotal += parseFloat(element.IssueSub_CGSTTaxAmount);
      this.TotIGstTotal += parseFloat(element.IssueSub_IGSTTaxAmount);
      this.TotDisAmt += parseFloat(element.IssueSub_ProdDisAmt);

      dRatePlusTax = parseFloat(element.IssueSub_OriginalRate);

      if (element.Field2 != "Yes") {

        dRatePlusTax = dRatePlusTax + (dRatePlusTax * parseFloat(element.IssueSub_TaxPers || 0)) / 100;
        strRateDisplay = parseFloat(element.IssueSub_OriginalRate).toFixed(2);
        this.GrossValue = parseFloat(element.IssueSub_RQty) * parseFloat(element.IssueSub_ActualRate);
        this.TotGrossValue += this.GrossValue;

      } else {

        dActualRate = parseFloat(element.IssueSub_OriginalRate);
        dActualRate = parseFloat(element.IssueSub_OriginalRate) - ((parseFloat(element.IssueSub_OriginalRate) * parseFloat(element.IssueSub_TaxPers)) / (100 + parseFloat(element.IssueSub_TaxPers)));
        strRateDisplay = eval(dActualRate.toFixed(5));
        this.GrossValue = parseFloat(element.IssueSub_RQty) * (dActualRate);
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
        IssueSub_TaxPers: parseInt(element.IssueSub_TaxPers).toFixed(), IssueSub_Qty: parseFloat(element.IssueSub_RQty).toFixed(this.dQtyDecimalPlace),
        IssueSub_OriginalRate: (dRatePlusTax).toFixed(2),
        CashDisc: parseFloat(element.IssueSub_PdodDis).toFixed(2), GrossValue: (this.GrossValue).toFixed(2),
        Rate: strRateDisplay, IssueSub_TaxAmt: parseFloat(element.IssueSub_TaxAmt).toFixed(2),
        RowTotal: dBillRowTotal.toFixed(2), IssueSub_Mrp: parseFloat(element.IssueSub_Mrp).toFixed(2)
        , Unit: element.Unit, Batch: element.IssueSub_Batch, ExpDate: this.DateRetExpiryFormat(element.IssueSub_ExpDate),
        IssueSub_FreeQty: parseFloat(element.IssueSub_FreeQty).toFixed(this.dQtyDecimalPlace), SchemAmt: parseFloat(element.IssueSub_SchmAmt).toFixed(2)
        , MFR: element.MFRNo, PTR: parseFloat(element.IssueSub_ActualRate).toFixed(2), PTW: PTW,
        CessPers: parseFloat(element.IssueSub_CessPers).toFixed(2), CessAmt: '0',
        AmtBeforeTotDis: dBillRowTotalBeforeTotDis.toFixed(2), IssueSub_ProdDisAmt: parseFloat(element.IssueSub_ProdDisAmt).toFixed(2)
        , PurInvoiceNo: element.BillSerPrefix + '-' + element.Issue_SlNo, PurInvoiceDate: this.DateRet(element.Issue_BillDate)

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
            , PurInvoiceNo: '', PurInvoiceDate: ''
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
        Rate: (this.JsonIssueInfo.Issue_OtherCharge).toFixed(2), IssueSub_TaxAmt: parseFloat(this.JsonIssueInfo.Issue_OtherTaxAmt).toFixed(2),
        RowTotal: dBillRowTotal.toFixed(2), IssueSub_Mrp: parseFloat("0").toFixed(2)
        , Unit: '', Batch: '', ExpDate: '', IssueSub_FreeQty: "0", SchemAmt: "0"
        , MFR: "", PTR: '', PTW: '', CessPers: '', CessAmt: '', AmtBeforeTotDis: dBillRowTotalBeforeTotDis.toFixed(2), IssueSub_ProdDisAmt: ''
        , PurInvoiceNo: '', PurInvoiceDate: ''
      }

      this.JsonSubInfo.push(this.JsonSub);
      count = count + 1;
    }


    this.TotDisAmt += parseFloat(this.JsonIssueInfo.Issue_DisAmt);
    this.TotAfterDiscount = this.TotAmtBeforeTax - this.TotDisAmt;

    if (this.JsonIssueInfo.Remarks == '') {
      this.dProductDetailsHeight = this.dProductDetailsHeight + 15;
      this.nNoOfItemPerPage = this.nNoOfItemPerPage + 1;
    }

    if (this.JsonBranchInfo.BranchFtr1 == '') {
      this.dProductDetailsHeight = this.dProductDetailsHeight + 16.5;
      this.nNoOfItemPerPage = this.nNoOfItemPerPage + 1;
    }

    if (this.JsonBranchInfo.BranchFtr2 == '') {
      this.dProductDetailsHeight = this.dProductDetailsHeight + 16.5;
      this.nNoOfItemPerPage = this.nNoOfItemPerPage + 1;
    }

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
        , PurInvoiceNo: '', PurInvoiceDate: ''
      }
      if (arr1.length < this.nNoOfItemPerPage) {

        for (var j = arr1.length; j < this.nNoOfItemPerPage; j++) {
          arr1.push(this.JsonSub);
        }
      }
      this.oArray.push(arr1);
    }


    var ServiceParams = {};
    ServiceParams['strProc'] = 'fnNumToWords_GetValue';

    let oProcParams = [];
    let ProcParams = {};

    ProcParams['strKey'] = 'Value';
    ProcParams['strArgmt'] = String(parseFloat(this.JsonIssueInfo.Issue_CrAmt));
    oProcParams.push(ProcParams);

    ServiceParams['oProcParams'] = oProcParams;

    var headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf-8');
    await this.appService.fnApiPost(this.ApiUrl + '/CommonQuery/fnGetDataReport', ServiceParams).toPromise()
      .then(data => {

        var jsonobj = JSON.parse(data);
        this.strAmtInwords = jsonobj[0].Words;
        console.log(this.strAmtInwords);
      }, error => console.error(error));



    // console.log(this.JsonIssueInfo.AmtInWords);
    // setTimeout(() => {
    //   window.print();
    // }, 700);

  }

  DateRet(value) {

    var BillDate = value;
    var BillDate1 = BillDate.split('-');
    var Dates = BillDate1[2] + '/' + BillDate1[1] + '/' + BillDate1[0];
    return Dates;

  }

  CalcColSpaces(strValue, nPadLength) {
    if (strValue == null) {
      strValue = '';
    }
    if (strValue.length > nPadLength) {
      strValue = strValue.substring(0, nPadLength - 1);
    }
    return strValue;

  }

  DateRetExpiryFormat(value) {

    var BillDate = value;
    var BillDate1 = BillDate.split('-');
    var Dates = BillDate1[1] + '/' + BillDate1[0].substring(2, 4);
    return Dates;

  }

  fnPrintpage() {
    // let popupWinindow ;
    // const innerContents = document.getElementById('printer-content').innerHTML;
    // popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    // popupWinindow.document.open();
    // popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="../assets/css/print-modalone.css" /></head><body onload="window.print()">' + innerContents + '</html>');
    // popupWinindow.document.close();
    // return;

    setTimeout(() => {
      // file:///android_asset/www/<link rel="stylesheet" type="text/css" href="assets/css/print-modalone.css" />
      const content = document.getElementById('printer-content').innerHTML;
      
      const page = `body {
        font-family: Arial;
      }    
  .water_mark {
    position: absolute;
    width: 100%;
    height: 46%;
    margin: 0 auto;
    left: 0;
    right: 0;
    top: 300px;
    opacity: 0.12;
    margin-top: 10px;
    z-index: 1;
  }

  .ClsPrintHeader {
    position: absolute;
    top: 25px;
    right: 16px;
    font-size: 12px;
  }

  .Page {
    overflow: hidden;
    position: relative;
    background-color: #fff;
    width: 195mm;
    min-height: 28.2cm;
    max-height: 28.2cm;
    margin: 0cm auto;
    page-break-after: always;
  }

  .subpage {
    overflow: hidden;
    position: relative;
    background-color: #fff;
    width: 195mm;
    min-height: 28cm;
    max-height: 28cm;
    margin: 0cm auto;
    padding-top: 18px;
  }

  .corner {
    position: absolute;
    margin-top: 3px;
    margin-left: 3px;
    margin-bottom: 5px;
    margin-right: 9px;
    width: 80px;
    height: 83px;
    left: 15px;
  }

  .image {
    background: #ccc;
    width: 100%;
    height: 100%;
    position: relative;
  }

  span {
    white-space: nowrap;
  }


  .Header {
    text-align: center;
    height: 107px;
    padding-bottom: 2px;
    border: $border;
    border-bottom: none;
    width: 100%;
    white-space: nowrap;
    overflow: hidden;
    color: $primary-color;
  }

  .Header  .clsCompanyDetails {
      width: 100%;
      height: 100%;
      float: left;
      white-space: nowrap;
      overflow: hidden;
  }
  .Header  .clsCompanyDetails  img {
        height: 94%;
        width: 98%;
        padding-top: 3px;
      }

      .Header  .clsCompanyDetails    .headerfont {
        font-size: 20px;
        text-align: left;
        width: 100%;
        float: left;
        white-space: nowrap;
        overflow: hidden;
        font-weight: 600;
      }

      .Header  .clsCompanyDetails    .addressfont {
        font-size: 12px;
        text-align: left;
        width: 100%;
        float: left;
        white-space: nowrap;
        overflow: hidden;
      }

      .Header  .clsCompanyDetails    .clsComState {
        top: 79px;
        position: absolute;
        margin-left: 530px;
        display: table;
        font-size: 12px;
      }

      .Header  .clsCompanyDetails  .clsComStateCode {
        top: 110px;
        position: absolute;
        margin-left: 560px;
        display: table;
      }

      .Header  .clsCompanyDetails  .clComGstTin {
        top: 96px;
        position: absolute;
        margin-left: 530px;
        display: table;
        font-size: 12px;
        font-weight: bold;
      }

      .Header  .clsCompanyDetails .clFssai {
        top: 62px;
        position: absolute;
        margin-left: 530px;
        display: table;
        font-size: 12px;
      }



      .Header  .clsCompanyDetails   .clsTinDetails {
      height: 100%;
      border: 1px solid #302d2d;
      border-right: none;
      border-top: none;
      border-bottom: none;
      float: left;
      width: 300px;
      white-space: nowrap;
      overflow: hidden;
      padding-top: 9px;      
    }

    .Header  .clsCompanyDetails .clsTinDetails .spanleft {
      float: left;
      width: 74px;
      text-align: left;
      padding-left: 3px;
      white-space: nowrap;
      overflow: hidden;
    }
    .Header  .clsCompanyDetails   .clsTinDetails .spanright {
      float: left;
      width: 200px;
      text-align: left;
      padding-left: 3px;
      white-space: nowrap;
      overflow: hidden;
    }

    .Header  .clsCompanyDetails .headerfont {
    font-size: 20px;
    text-align: center;
    width: 100%;
    float: left;
    white-space: nowrap;
    overflow: hidden;
  }

  .Header  .clsCompanyDetails .addressfont {
    font-size: 16px;
    text-align: center;
    width: 100%;
    float: left;
    white-space: nowrap;
    overflow: hidden;
  }

  .Header  .clsCompanyDetails .divcomgstdetails {
    height: 20px;
    width: 100%;
    padding-top: 3px;
    border: 1px solid #302d2d;
    border-left: none;
    border-right: none;
    border-bottom: none;
    white-space: nowrap;
    overflow: hidden;
    color: $primary-color;
  }

  .Header  .clsCompanyDetails .divbilldatebox {
    height: 24px;
    width: 100%;
    padding-top: 1px;
    font-size: 14px;
    border: 1px solid #302d2d;
    border-bottom: none;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
  }

  .customerdetails {
    
    height: 125px;
    width: 100%;
    overflow: hidden;
    border: 1px solid #302d2d;
  }
  .customerdetails   span {
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      color: $primary-color;
    }

    .customerdetails  .form1 {
      padding-top: 3px;
      // width: 344px;
      float: left;
      border: 1px solid #302d2d;
      border-left: none;
      border-top: none;
      border-bottom: none;
      border-right: none;
      height: 100%;
      overflow: hidden;
    }
    .customerdetails  .form1  .clsCustomer1divspan {
        float: left;
        padding-left: 3px;
        white-space: nowrap;
        overflow: hidden;
        height: 16px;
        width: 100%;
      }

      .customerdetails .form2 {
      padding-top: 3px;
      width: 205px;
      float: left;
      border: 1px solid #302d2d;
      border-left: none;
      border-top: none;
      border-right: none;
      height: 100%;
      border-bottom: none;
      overflow: hidden;
    }
    .customerdetails .form2  .clsCustomer2divspan {
        float: left;
        padding-left: 3px;
        white-space: nowrap;
        overflow: hidden;
        color: $primary-color;
        width: 100%;
    }
  

    .customerdetails .form3 {
      padding-top: 3px;
      width: 180px;
      float: left;
      border: 1px solid #302d2d;
      border-left: none;
      border-right: none;
      border-top: none;
      height: 100%;
      border-bottom: none;
      overflow: hidden;
      color: $primary-color;
    }

  .ProductDetails {
    width: 100%;
    border: 1px solid #302d2d;
    border-top: none;
    border-bottom: none;
  }

  .ProductDetails th {
    background-color: $backgroundcolor;
    font-weight: bold;
    color: $primary-color;
  }

  .FotterSection {
    width: 100%;
    height: 124;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
  }
  .FotterSection  .taxdetails {
      padding-top: 3px;
      width: 493px;
      float: left;
      border: 1px solid #302d2d;
      border-left: none;
      border-top: none;
      height: 122px;
      overflow: hidden;
      font-size: 11px;
      border-bottom: none;
      border-right: none;
    }
    .FotterSection .divOutstanding {
      width: 492px;
      height: 19px;
      padding-top: 2px;
      padding-bottom: 2px;
      border: 1px solid #555;
      border-left: none;
      border-bottom: none;
      border-right: none;
      bottom: -10px;
      margin-bottom: 172px;
      position: absolute;
      bottom: 0;
      text-align: left;
      width: 100%;
    }

    .FotterSection .BankDetails {
      border: 1px solid #302d2d;
      border-left: none;
      border-right: none;
      height: 40px;
      padding-top: 0px;
      float: left;
      text-align: left;
      font-size: 12px;
      width: 100%;
      border-bottom: none;
    }

    .FotterSection .BankDetails  .in-bottom {
        border-top: 1px solid;
        padding-left: 14px;
      }

      .FotterSection .worddeclartion {
      width: 376px;
      float: left;
      border: $border;
      border-left: none;
      border-top: none;
      height: 122px;
      border-bottom: none;
      }
      .FotterSection .worddeclartion .clsDeclaration {
        border: 1px solid #302d2d;
        border-left: none;
        border-top: none;
        border-right: none;
        height: 40px;
      }

      .FotterSection .worddeclartion span {
        text-align: left;
        padding-left: 3px;
        font-size: 9px;
        width: 100%;
      }

    .clsAmtWordSection {
      float: left;
      border: 1px solid #302d2d;
      border-top: none;
      border-left: none;
      height: 122px;
      overflow: hidden;
      font-size: 11px;
      border-bottom: none;
      border-right: none;
    }

   .clsAmtWordSection   table {
        width: 100%;
   }
   .clsAmtWordSection   table      td,
        th {
          padding: 1px;
          // border: $border;
          white-space: nowrap;
          border: 1px solid #302d2d;
        }
        .clsAmtWordSection   table    tr {
          height: 25px;
        }

    .clsAmtSection {
      border: 1px solid #302d2d;
      border-left: none;
      border-top: none;
      height: 122px;
      overflow: hidden;
      font-size: 11px;
      border-bottom: none;
      border-right: none;
    }
    .clsAmtSection   table {
      
        width: 100%;
    }
    .clsAmtSection   table      td,
        th {
          padding: 1px;
          white-space: nowrap;
          border: 1px solid #302d2d;
        }

        .clsAmtSection   table      tr {
          height: 25px;
        }

    .FooterTotalSection {
      width: 100%;
      border: 1px solid #302d2d;
      border-left: none;
      border-bottom: none;
      border-right: none;
      float: left;
      background-color: #ccc;
    }

    .FooterTotalSection  .AmtInWords {
        width: 493px;
        text-align: left;
        overflow: hidden;
        padding-left: 4px;
        float: left;
        padding-top: 3px;
        padding-bottom: 3px;
        border: 1px solid #302d2d;
        border-left: none;
        border-top: none;
        border-bottom: none;
        color: $primary-color;
      }

      .FooterTotalSection .GrandTotalLabel {
        width: 112px;
        text-align: left;
        overflow: hidden;
        padding-left: 4px;
        float: left;
        font-size: 16px;
      }

      .FooterTotalSection .GrandTotalAmount {
        width: 130px;
        text-align: right;
        overflow: hidden;
        padding-left: 4px;
        float: right;
        font-size: 16px;
      }

  .DeclareSection {

    height: 78px;
    width: 100%;
    float: left;
    padding-top: 4px;
    border: 1px solid #302d2d;
    border-top: none;
  }

  .DeclareSection  .DeclareDetails {
      float: left;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      font-size: 10px;
      padding-left: 4px;
    }

    .DeclareSection  .SignatureSection {
      float: left;
      text-align: center;
      overflow: hidden;
    }

  hr {
    display: block;
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    margin-left: auto;
    margin-right: auto;
    border-width: 1px;    
    float: left;
    width: 100%;
  }

  #pre-loader {
    display: none;
  }

  .tblNo {
    min-width: 33px;
    max-width: 33px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
    
  }

  .tblItemCode {
    width: 74px;
    min-width: 74px;
    max-width: 74px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .tblProduct {
    width: 306px;
    min-width: 306px;
    max-width: 306px;
    overflow: hidden;
    text-align: left;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .HSNCode {
    width: 30px;
    max-width: 30px;
    min-width: 30px;
    overflow: hidden;
    text-align: left;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .MFRNo {
    width: 30px;
    max-width: 30px;
    min-width: 30px;
    overflow: hidden;
    text-align: left;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .RateofTax {
    width: 40px;
    max-width: 40px;
    min-width: 40px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .Unit {
    width: 65px;
    max-width: 65px;
    min-width: 65px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }
  .ExpDate {
    width: 55px;
    max-width: 55px;
    min-width: 55px;
    overflow: hidden;
    text-align: center;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }
  .Batch {
    width: 70px;
    max-width: 70px;
    min-width: 70px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }
  .UnitPrice {
    width: 60px;
    max-width: 60px;
    min-width: 60px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .PTR {
    width: 60px;
    max-width: 60px;
    min-width: 60px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .PTW {
    width: 60px;
    max-width: 60px;
    min-width: 60px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .PricePlusTax {
    width: 60px;
    max-width: 60px;
    min-width: 60px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .Mrp {
    width: 60px;
    max-width: 60px;
    min-width: 60px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .Qty {
    width: 48px;
    max-width: 48px;
    min-width: 48px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .Free {
    width: 35px;
    max-width: 35px;
    min-width: 35px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .GrossValue {
    width: 60px;
    max-width: 60px;
    min-width: 60px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .GstAmount {
    width: 55px;
    max-width: 55px;
    min-width: 55px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .CashDisc {
    width: 55px;
    max-width: 55px;
    min-width: 55px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .DiscAmt {
    width: 55px;
    max-width: 55px;
    min-width: 55px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .Tax {
    width: 35px;
    max-width: 35px;
    min-width: 35px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .SchemAmt {
    width: 50px;
    max-width: 50px;
    min-width: 50px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .Amount {
    width: 75px;
    max-width: 75px;
    min-width: 75px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-right: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .PurInvoiceNo {
    width: 50px;
    max-width: 50px;
    min-width: 50px;
    overflow: hidden;
    text-align: left;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
    padding-left: 2px;
  }

  .PurInvoiceDate {
    width: 50px;
    max-width: 50px;
    min-width: 50px;
    overflow: hidden;
    text-align: right;
    border: $border;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
    padding-left: 2px;
  }

  .CessPers {
    width: 75px;
    max-width: 75px;
    min-width: 75px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
  }

  .CessAmt {
    width: 75px;
    max-width: 75px;
    min-width: 75px;
    overflow: hidden;
    text-align: right;
    border: $border;
    border-left: none;
    border-bottom: none;
    border-top: none;
    white-space: nowrap;
    border: 1px solid #302d2d;
  }

  .AmtBeforeTotDis {
    width: 75px;
    max-width: 75px;
    min-width: 75px;
    overflow: hidden;
    text-align: right;
    border: 1px solid #302d2d;
    border-left: none;
    border-bottom: none;
    border-right: none;
    border-top: none;
    white-space: nowrap;
  }

  .tblTaxDetails {
    margin-left: 10px;
    margin-right: 3px;
    margin-top: 1px;
    margin-bottom: 3px;
    border: 1px solid #302d2d;
  }
 
  .tblTaxDetails td,
    th {
      padding: 1px;
      border: $border;
      width: 68px;
      text-align: center;
      font-size: 9px;
    }

  .tblAmountDetails {
    border-left: $border;
  }
  .tblTaxDetails  td,
    th {
      padding: 1px;
      white-space: nowrap;
      border: $border;
      color: $primary-color;
    }

    .tblTaxDetails  tr {
      height: 25px;
    }

  .clsQrDetails {
    height: 137px;
    float: left;
    border-left: 1px solid #635e5e;
    overflow: hidden;
  }
  .tblTaxDetails  img {
      height: 90%;
      width: 90%;
      margin-top: 1px;
    }

      .clsProductBottom {
        border-bottom: 1px solid #302d2d !important;
      }

    </style>
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

    }, 200);
  }

  async fnSharepage() {
    this.ctrlService.onLoading('Creating PDF file...');
    this.strLogoImageName = '';
    const element: any = document.getElementById('printer-content') as HTMLDivElement;
    const option = { allowTaint: true, useCORS: true };
    let content: HTMLDivElement = element.firstChild;

    await html2canvas(content, option)
      .then((canvas) => {
        if (canvas) {
          canvas.getContext('2d');
          const dataUrl = canvas.toDataURL('image/png');
          const doc = new jsPDF("p", "mm", "a4");
          const bufferX = 5;
          const bufferY = 5;
          const imgProps = (<any>doc).getImageProperties(dataUrl);
          const pdfWidth = doc.internal.pageSize.getWidth() - 2 * bufferX;
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
          doc.addImage(dataUrl, 'PNG', bufferX, bufferY, pdfWidth, pdfHeight, undefined, 'FAST');
          let pdfOutput = doc.output();
          let buffer = new ArrayBuffer(pdfOutput.length);
          let array = new Uint8Array(buffer);
          for (var i = 0; i < pdfOutput.length; i++) {
            array[i] = pdfOutput.charCodeAt(i);
          }
          this.onShareFiles(buffer)

        }
      }).catch((error) => {

        console.error('oops, something went wrong!', error);
        this.ctrlService.hideLoader();
      });

  }

  onShareFiles(buffer) {

    const directory = this.file.cacheDirectory;
    // const fileName = `invoiceBill_Bill.pdf`;
    let date = new Date().getTime();
    const fileName = `invoiceBill_new${date}.pdf`;
    let options: IWriteOptions = { replace: true };

    this.file.checkFile(directory, fileName).then((success) => {
      console.log(success);
      //Writing File to Device
      this.file.writeFile(directory, fileName, buffer, options)
        .then((success) => {
          console.log(success);
          this.ctrlService.hideLoader();

          setTimeout(() => {
            this.socialSharing.share('invoiceBillnew', null, directory + fileName, null);
          });
          console.log("File created Succesfully" + JSON.stringify(success));

        }).catch((error) => {
          this.ctrlService.hideLoader();
          console.log("Cannot Create File " + JSON.stringify(error));
        });
    }).catch((error) => {
      console.error(error);
      //Writing File to Device
      this.file.writeFile(directory, fileName, buffer)
        .then((success) => {

          console.log("File created Succesfully" + JSON.stringify(success));

          setTimeout(() => {
            this.socialSharing.share('invoiceBillnew', null, directory + fileName, null);
          });
          this.ctrlService.hideLoader();
        }).catch((error) => {

          console.error("Cannot Create File " + JSON.stringify(error));
          this.ctrlService.hideLoader();
        });
    });
  }

  fnClose() {
    this.modalpage.dismiss();
  }

}
