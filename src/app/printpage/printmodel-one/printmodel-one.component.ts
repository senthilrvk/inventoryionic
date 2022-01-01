import { Component, OnInit, Input, ChangeDetectorRef, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { ModalController, NavParams } from '@ionic/angular';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';
import { PDFGenerator } from '@ionic-native/pdf-generator/ngx';
import { templateJitUrl } from '@angular/compiler';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-printmodel-one',
  templateUrl: './printmodel-one.component.html',
  styleUrls: ['./../../../assets/css/print-modalone.css'],
  encapsulation: ViewEncapsulation.None
})
export class PrintmodelOneComponent implements OnInit {

  @Input() BillNo: string;
  @Input() BillSerId: string;
  @Input() UniqueNo: string;

  title = 'app';
  elementType = 'url';
  strQRCode = '';

  bDiscountVisible = false;
  ImageName: string;
  Jurisdiction: string;
  strImageSave: string;
  strTopHeader: string;
  JsonIssueInfo: any;
  JsonBranchInfo: any;
  JsonIssueTaxInfo: any;
  strBillNo: any;
  strBillDate: any;
  TotAddCess = 0;
  JsonSubInfo = [];
  oArray = new Array();
  nNoOfItemPerPage = 30;
  dProductDetailsHeight = 497;
  GrossValue = 0; TotGrossValue = 0; TotTaxAmt = 0; NetValue = 0; TotNetValue = 0; TotQty = 0; TotFQty = 0;
  TotAmtBeforeTax = 0; TotSGstTotal = 0; TotCGstTotal = 0; TotIGstTotal = 0; TotDisAmt = 0; TotCessAmt = 0; dTotBillRowTotal = 0;
  strLogoImageName = "";
  PrintItemColumnDetails: any;
  bProductNextLine: boolean = false;
  bPrintLogo: boolean = false;
  bPrintHeaderImage: boolean = false;
  dBillBalance: number = 0;
  bShippingVisible: boolean = false;
  bSameItemPrintOneLine = false;
  dSignatureSectionWidth = 0;
  bBackgroundImageMask = false;
  bDeclarationFirstLineBold: boolean = false;
  nfromOneWidth = 549;
  argTaxIds: any;
  dAmtInWordsWidth = 0;
  dFotterTaxsectionWidth = 0;
  dFooterAmountSectionWidth = 0;
  dFooterAmountWordSectionWidth = 0;
  dTotFooterAmountSectionWidth = 0;
  bHeaderCenterPosition: boolean = false;
  dQRCodeWidth = 0;
  dCustomerBox1 = 0;
  dCustomerBox2 = 0;
  strHeaderImage = "";
  dCustomerBox3 = 0;
  dTotalBillTotal = 0;
  dCustomerDetailsHeight = 125;
  bEditWidth: boolean = false;
  bSupplyDate: boolean = false;
  strQrImage = "";
  bDeclaration: boolean = false;
  bSalesman: boolean = false;
  bAcknowledgement: boolean = false;
  bBankDisplay: boolean = false;
  strSupplyDate: any;
  strSupplyDateDisplayName = 'Supply Date';
  bPayTerms: boolean = false;
  bProductBorderLine: boolean = false;
  JsonSub = {
    SlNo: '', ItemDesc: '', HSNCode: '', IssueSub_TaxPers: '', IssueSub_Qty: '', IssueSub_OriginalRate: '', CashDisc: '', GrossValue: '',
    Rate: '', IssueSub_TaxAmt: '', RowTotal: '', IssueSub_Mrp: '', Unit: '', Batch: '', ExpDate: '', IssueSub_FreeQty: '',
    SchemAmt: '', MFR: '', PTR: '', PTW: '', CessPers: '', CessAmt: '', AmtBeforeTotDis: '',
    IssueSub_ProdDisAmt: '', ItemCode: ''
  }
  bHeaderVisible: boolean = false;
  TotAfterDiscount: number;
  dTotAmtBeforeTotDis: number = 0;
  bQRImageType: boolean = false;
  strOrderDate: string;
  dQtyDecimalPlace: number = 0;
  dRateDecimalPlace: number;
  ItemDescLen = 30;
  nNoOfPagesPrint: number;
  strPTRHeaderName: string = 'PTR'
  strPTWHeaderName: string = 'RATE'
  branchId: any;
  ApiUrl: any;
  dBranchBoxHeight = 107;
  bHeaderLine: boolean = false;
  strShippingAddressDisplayName = 'Shippping Address';
  dDeclareWordSectionWidth = 0;

  private _unsubscribeAll: Subject<any>;

  constructor(private appService: AppService, private printer: Printer,
    private modalpage: ModalController,
    public navParams: NavParams,
    private pdfGenerator: PDFGenerator, private cd: ChangeDetectorRef,
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
        this.fnTaxGets();
      }
    });

  }


  ngOnInit() {

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
          } else if (jsondata[i].KeyValue == 'ShippingAddressDisplayName') {
            this.strShippingAddressDisplayName = String(jsondata[i].Value);
          } else if (jsondata[i].KeyValue == 'SupplyDateDisplayName') {
            this.strSupplyDateDisplayName = String(jsondata[i].Value);
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
    ProcParams['strArgmt'] = 'PrintModelOne';
    oProcParams.push(ProcParams);
    ServiceParams['oProcParams'] = oProcParams;
    let body = JSON.stringify(ServiceParams);
    await this.appService.fnApiPost(`${this.ApiUrl}/CommonQuery/fnGetDataReportFromScriptJsonFile`, body)
      .pipe(takeUntil(this._unsubscribeAll))
      .toPromise()
      .then(data => {
        let result: any = data;
        this.PrintItemColumnDetails = JSON.parse(result.JsonDetails[0]);

        this.PrintItemColumnDetails.forEach(element => {

          if (element.ColumnName == 'Product') {
            this.ItemDescLen = (parseFloat(element.Width || 0) / 7);
            this.ItemDescLen = Math.round(this.ItemDescLen)
          }

        });

        if (JSON.parse(result.JsonDetails[2]).length > 0) {
          this.bPrintLogo = true;
        }
        if (JSON.parse(result.JsonDetails[1]).length > 0) {
          this.bPrintHeaderImage = true;
        }

        if (JSON.parse(result.JsonDetails[3]).length > 0) {
          this.bProductNextLine = true;
        }


        var JsonPrintFooterDetails = JSON.parse(result.JsonDetails[5]);
        JsonPrintFooterDetails.forEach(element => {
          if (element.ColumnName == 'FotterTaxsection') {
            this.dFotterTaxsectionWidth = element.Width;

          } else if (element.ColumnName == 'FooterAmountSection') {
            this.dFooterAmountSectionWidth = element.Width;

          } else if (element.ColumnName == 'FooterAmountWordSection') {
            this.dFooterAmountWordSectionWidth = element.Width;

          } else if (element.ColumnName == 'QRCodeWidth') {
            this.dQRCodeWidth = element.Width;
          }
        });
        this.dAmtInWordsWidth = Number(this.dFotterTaxsectionWidth || 0) + Number(this.dQRCodeWidth || 0) - 1;
        var JsonPrintCustomerDetails = JSON.parse(result.JsonDetails[6]);
        JsonPrintCustomerDetails.forEach(element => {
          if (element.ColumnName == 'CustomerBoxOne') {
            this.dCustomerBox1 = element.Width;

          } else if (element.ColumnName == 'CustomerBoxTwo') {
            this.dCustomerBox2 = element.Width;

          } else if (element.ColumnName == 'CustomerBoxThree') {
            this.dCustomerBox3 = element.Width;
          }
        });
        if (JSON.parse(data.JsonDetails[7]).length > 0) {
          this.bDeclaration = JSON.parse(data.JsonDetails[7])[0].bActive;
        }

        if (JSON.parse(data.JsonDetails[9]).length > 0) {
          this.bSupplyDate = JSON.parse(data.JsonDetails[9])[0].bActive;
        }

        if (JSON.parse(data.JsonDetails[10]).length > 0) {
          this.bAcknowledgement = JSON.parse(data.JsonDetails[10])[0].bActive;
        }
        if (JSON.parse(data.JsonDetails[11]).length > 0) {
          this.bBankDisplay = true;
        }
        if (JSON.parse(data.JsonDetails[13]).length > 0) {
          this.bSalesman = true;
        }

        if (JSON.parse(data.JsonDetails[14]).length > 0) {
          this.bPayTerms = true;
        }

        if (JSON.parse(data.JsonDetails[15]).length > 0) {
          this.dBranchBoxHeight = parseFloat(JSON.parse(data.JsonDetails[15])[0].Width || 0);
        }
        if (JSON.parse(data.JsonDetails[18]).length > 0) {
          this.dDeclareWordSectionWidth = parseFloat(JSON.parse(data.JsonDetails[18])[0].Width || 0);
        }

        if (JSON.parse(data.JsonDetails[21]).length > 0) {
          this.bHeaderLine = true;
        }
        if (JSON.parse(data.JsonDetails[23]).length > 0) {
          this.bDeclarationFirstLineBold = true;
        }

        if (JSON.parse(data.JsonDetails[19]).length > 0) {
          this.dSignatureSectionWidth = parseFloat(JSON.parse(data.JsonDetails[19])[0].Width || 0);
        }
        if (JSON.parse(data.JsonDetails[22]).length > 0) {
          this.bHeaderVisible = true;
        }
        if (JSON.parse(data.JsonDetails[24]).length > 0) {
          this.bDiscountVisible = true;

        }
        if (JSON.parse(data.JsonDetails[26]).length > 0) {
          this.bQRImageType = true;
        }
        if (JSON.parse(data.JsonDetails[27]).length > 0) {
          this.bProductBorderLine = true;
        }
        if (JSON.parse(data.JsonDetails[28]).length > 0) {
          this.bHeaderCenterPosition = true;
        }


        this.dTotFooterAmountSectionWidth = this.dFooterAmountSectionWidth + this.dFooterAmountWordSectionWidth

        this.fnBillPrint(this.BillSerId, this.BillNo, this.UniqueNo);

      });
  }

  async fnBillPrint(BillSerId, BillNo, UniqueNo) {

    var subtotal = 0;
    var taxamt = 0;
    var varArguements = {};
    varArguements = { BillSerId: BillSerId, BillNo: BillNo, UniqueNo: UniqueNo, BranchId: this.branchId };

    var DictionaryObject = {};
    DictionaryObject['dictArgmts'] = varArguements;
    DictionaryObject['ProcName'] = '';

    let strUrlName = "/Sales/Sales_CopyPrint";
    if (this.bSameItemPrintOneLine) {
      strUrlName = "/Sales/Sales_CopyPrintOne";
    }

    // if (this.PrintFrom == "DummyBill") {
    //   strUrlName = "/Sales/SalesBillDummy_CopyPrint";
    // }

    let body = JSON.stringify(DictionaryObject);

    await this.appService.fnApiPost(this.ApiUrl + strUrlName, body)
      .pipe(takeUntil(this._unsubscribeAll)).toPromise()
      .then(data => {
        var JsonIssueSubDetailsInfo = JSON.parse(data.JsonIssueSubDetailsInfo);
        this.JsonIssueTaxInfo = JSON.parse(data.JsonIssueTaxInfo);
        this.JsonBranchInfo = JSON.parse(data.JsonBranchInfo)[0];
        this.JsonIssueInfo = JSON.parse(data.JsonIssueInfo)[0];
        this.strBillNo = this.JsonIssueInfo.BillSerPrefix + '-' + this.JsonIssueInfo.Issue_SlNo
        this.strBillDate = String(this.JsonIssueInfo.Issue_BillDate).split('-').reverse().join('/');
        this.strOrderDate = String(this.JsonIssueInfo.Issue_OrderDate).split('-').reverse().join('/');
        this.strQRCode = this.JsonBranchInfo.Branch_QRCode;
        this.strSupplyDate = String(this.JsonIssueInfo.Issue_DispDate).split('-').reverse().join('/');

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
        if (this.JsonIssueInfo.DLNo2 == '') {

          this.dCustomerDetailsHeight = this.dCustomerDetailsHeight - 9;

        }

        if (this.JsonIssueInfo.DLNo1 == '') {

          this.dCustomerDetailsHeight = this.dCustomerDetailsHeight - 9;

        }
        if (this.JsonIssueInfo.Addr3 == '') {

          this.dCustomerDetailsHeight = this.dCustomerDetailsHeight - 11;

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

        if (this.JsonBranchInfo.ComImage != '') {

          if (this.strImageSave == 'ONLINE') {
            this.strLogoImageName = 'https://s3.ap-south-1.amazonaws.com/codeappsimageerp/' + this.JsonBranchInfo.ComImage;
          } else {
            let url = new URL(this.appService.Apiurl);
            if (url)
            this.strLogoImageName = url.origin + '/ImagesUploaded/' + this.JsonBranchInfo.ComImage;
          }

        }

        let PTW;
        let PTR;
        PTW = 0;7

        let dRatePlusTax = 0;
        let dActualRate = 0;
        let strRateDisplay = '';
        JsonIssueSubDetailsInfo.forEach(element => {

          this.TotTaxAmt += parseFloat(element.IssueSub_TaxAmt);

          this.TotQty += parseFloat(element.IssueSub_Qty);
          this.TotFQty += parseFloat(element.IssueSub_FreeQty);
          this.TotCessAmt += parseFloat(element.IssueSub_CessAmt);

          this.TotAmtBeforeTax += parseFloat(element.IssueSub_Qty) * parseFloat(element.IssueSub_ActualRate);
          dBillRowTotal = parseFloat(element.IssueSub_Amount) - parseFloat(element.IssueSub_CessAmt);
          dBillRowTotalBeforeTotDis = dBillRowTotal + ((parseFloat(element.IssueSub_ActualRate) * (parseFloat(element.IssueSub_Qty) - parseFloat(element.IssueSub_RQty)) * parseFloat(this.JsonIssueInfo.Issue_DisPers)) / 100);

          this.dTotBillRowTotal += dBillRowTotal;
          this.dTotAmtBeforeTotDis += dBillRowTotalBeforeTotDis;
          this.TotSGstTotal += parseFloat(element.IssueSub_SGSTTaxAmount);
          this.TotCGstTotal += parseFloat(element.IssueSub_CGSTTaxAmount);
          this.TotIGstTotal += parseFloat(element.IssueSub_IGSTTaxAmount);
          this.TotDisAmt += parseFloat(element.IssueSub_ProdDisAmt);
          this.TotAddCess += parseFloat(element.IssueSub_ExtraCessAmt);
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
            , MFR: element.MFRNo, PTR: parseFloat(PTR).toFixed(2), PTW: parseFloat(PTW).toFixed(2),
            CessPers: parseFloat(element.IssueSub_CessPers).toFixed(2), CessAmt: parseFloat(element.IssueSub_CessAmt).toFixed(2),
            AmtBeforeTotDis: dBillRowTotalBeforeTotDis.toFixed(2), IssueSub_ProdDisAmt: parseFloat(element.IssueSub_ProdDisAmt).toFixed(2),
            ItemCode: element.ItemCode

          }

          this.JsonSubInfo.push(this.JsonSub);

          if (this.bProductNextLine) {
            if (element.ItemDesc.length > this.ItemDescLen) {

              this.JsonSub = {
                SlNo: '', ItemDesc: this.CalcColSpaces(element.ItemDesc.substring(this.ItemDescLen - 1, element.ItemDesc.length), this.ItemDescLen), HSNCode: '',
                IssueSub_TaxPers: '', IssueSub_Qty: '', IssueSub_OriginalRate: '',
                CashDisc: '', GrossValue: '', Rate: '', IssueSub_TaxAmt: '',
                RowTotal: '', IssueSub_Mrp: '', Unit: '', Batch: '', ExpDate: '',
                IssueSub_FreeQty: '', SchemAmt: '', MFR: '', PTR: '', PTW: '', CessPers: '', CessAmt: '', AmtBeforeTotDis: '', IssueSub_ProdDisAmt: '', ItemCode: ''
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
            , MFR: "", PTR: '', PTW: '', CessPers: '', CessAmt: '', AmtBeforeTotDis: dBillRowTotalBeforeTotDis.toFixed(2),
            IssueSub_ProdDisAmt: '', ItemCode: ''
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
            Rate: (this.JsonIssueInfo.Issue_Freight).toFixed(2), IssueSub_TaxAmt: parseFloat(this.JsonIssueInfo.Issue_CourierTaxAmt).toFixed(2),
            RowTotal: dBillRowTotal.toFixed(2), IssueSub_Mrp: parseFloat("0").toFixed(2)
            , Unit: '', Batch: '', ExpDate: '', IssueSub_FreeQty: "0", SchemAmt: "0", MFR: "", PTR: '', PTW: ''
            , CessPers: '', CessAmt: '', AmtBeforeTotDis: dBillRowTotalBeforeTotDis.toFixed(2),
            IssueSub_ProdDisAmt: '', ItemCode: ''

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
            , CessPers: '', CessAmt: '', AmtBeforeTotDis: parseFloat(this.JsonIssueInfo.Issue_TCSAmt).toFixed(2),
            IssueSub_ProdDisAmt: '', ItemCode: ''

          }

          this.JsonSubInfo.push(this.JsonSub);

        }
        var CreditNoteAmt = parseFloat(this.JsonIssueInfo.Issue_ExpiryAmt || 0) + parseFloat(this.JsonIssueInfo.Issue_CrAmt || 0)
        if (CreditNoteAmt > 0) {

          dBillRowTotal = CreditNoteAmt;
          this.dTotBillRowTotal -= dBillRowTotal;

          this.JsonSub = {

            SlNo: "", ItemDesc: '', HSNCode: '',
            IssueSub_TaxPers: '', IssueSub_Qty: "", IssueSub_OriginalRate: '', CashDisc: '', GrossValue: '',
            Rate: '', IssueSub_TaxAmt: '', RowTotal: '', IssueSub_Mrp: ''
            , Unit: '', Batch: '', ExpDate: '', IssueSub_FreeQty: "0", SchemAmt: "0", MFR: "", PTR: '', PTW: ''
            , CessPers: '', CessAmt: '', AmtBeforeTotDis: '', IssueSub_ProdDisAmt: '', ItemCode: ''

          }

          this.JsonSubInfo.push(this.JsonSub);

          this.JsonSub = {

            SlNo: "", ItemDesc: this.CalcColSpaces('*** CREDIT NOTE ***', this.ItemDescLen), HSNCode: '',
            IssueSub_TaxPers: '', IssueSub_Qty: "", IssueSub_OriginalRate: '', CashDisc: '', GrossValue: '',
            Rate: '', IssueSub_TaxAmt: '', RowTotal: CreditNoteAmt.toFixed(2), IssueSub_Mrp: ''
            , Unit: '', Batch: '', ExpDate: '', IssueSub_FreeQty: "0", SchemAmt: "0", MFR: "", PTR: '', PTW: ''
            , CessPers: '', CessAmt: '', AmtBeforeTotDis: CreditNoteAmt.toFixed(2), IssueSub_ProdDisAmt: ''
            , ItemCode: ''
          }

          this.JsonSubInfo.push(this.JsonSub);

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
        if (this.bAcknowledgement) {
          this.dProductDetailsHeight = this.dProductDetailsHeight - 87;
          // this.nNoOfItemPerPage = this.nNoOfItemPerPage - 7;
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
            SchemAmt: '', MFR: '', PTR: '', PTW: '', CessPers: '', CessAmt: '', AmtBeforeTotDis: '', IssueSub_ProdDisAmt: '',
            ItemCode: ''
          }
          if (arr1.length < this.nNoOfItemPerPage) {

            for (var j = arr1.length; j < this.nNoOfItemPerPage; j++) {
              arr1.push(this.JsonSub);
            }
          }
          this.oArray.push(arr1);
        }

        this.dTotalBillTotal = parseFloat(this.JsonIssueInfo.Issue_Total || 0) - CreditNoteAmt;

        // if (this.ExportPdf == 'pdf' || this.ExportPdf == 'png') {
        //   setTimeout(() => {
        //     this.export(this.JsonIssueInfo);
        //   }, 700);
        //   return;
        // }

        // console.log(this.JsonIssueInfo.AmtInWords);


        // this.oArray.push(row);


      }, error => console.error(error));

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
      table {
        border-collapse: collapse;
      }
      *,
      :after,
      :before {
        box-sizing: border-box;
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
      .clsComState {
        top: 79px;
        position: absolute;
        margin-left: 540px;
        display: table;
        font-size: 12px;
      }
      .clComGstTin {

        top: 96px;
        position: absolute;
        margin-left: 540px;
        display: table;
        font-size: 12px;
        font-weight: bold;
      }
      .clFssai {

        top: 62px;
        position: absolute;
        margin-left: 540px;
        display: table;
        font-size: 12px;
      }
      .clsComStateCode {
        top: 110px;
        position: absolute;
        margin-left: 560px;
        display: table;
      }
      .ClsPrintHeader {
        position: absolute;
        top: 25px;
        right: 16px;
        font-size: 12px;
      }

      .Page {
        /* overflow: hidden; */
        position: relative;
        background-color: #fff;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
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
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        width: 195mm;
        min-height: 28cm;
        max-height: 28cm;
        margin: 0cm auto;
        padding-top: 18px;
      }

      .corner {
        position: absolute;
          width: 92px;
          height: 100px;
          left: 8px;
          margin: 3px 9px 5px 1px;
      }
      label {
        display: inline-block;
        max-width: 100%;
        margin-bottom: 5px;
      }
      .image {
        background: #ccc;
        width: 100%;
        height: 100%;
        position: relative;
      }

      span {
        white-space: nowrap;
        color: #635e5e;
      }

      .Header {
        text-align: center;
        border: 1px solid #302d2d;
        height: 107px;
        padding-bottom: 1px;
        border-bottom: none;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;

        color: #635e5e;
      }

      .Header .clsCompanyDetails {
        width: 100%;
        height: 100%;
        float: left;
        white-space: nowrap;
        overflow: hidden;
      }

      .Header .clsCompanyDetails img {
        height: 99%;
        width: 99%;
        padding: 1px;
      }

      .Header .clsCompanyDetails .headerfont {
        font-size: 20px;
              text-align: left;
              width: 100%;
              float: left;
              white-space: nowrap;
              overflow: hidden;
              font-weight: 600;
              color: #635e5e;


      }

      .Header .clsCompanyDetails .addressfont {
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        font-size: 12px;
        text-align: left;
        width: 100%;
        float: left;
        white-space: nowrap;
        overflow: hidden;
        color: #635e5e;
      }

      .Header .clsTinDetails {
        height: 100%;
        border: 1px solid #635e5e;
        border-right: none;
            border-top: none;
            border-bottom: none;
            float: left;
            width: 300px;
            white-space: nowrap;
            overflow: hidden;
            padding-top: 9px;
        color: #635e5e;
      }

      .Header .clsTinDetails .spanleft {
        float: left;
        width: 74px;
        text-align: left;
        padding-left: 3px;
        white-space: nowrap;
        overflow: hidden;
        color: #635e5e;
      }

      .Header .clsTinDetails .spanright {
        float: left;
              width: 200px;
              text-align: left;
              padding-left: 3px;
              white-space: nowrap;
              overflow: hidden;
        color: #635e5e;
      }

      .headerfont {
        font-family: Arial;
        color: #635e5e;
        font-size: 20px;
              text-align: left;
              width: 100%;
              float: left;
              white-space: nowrap;
              overflow: hidden;
              font-weight: 600;
      }

      .addressfont {
        font-family: Arial;

        color: #635e5e;

        font-size: 12px;
        text-align: left;
        width: 100%;
        float: left;
        white-space: nowrap;
        overflow: hidden;
      }

      .divcomgstdetails {
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        height: 20px;
        width: 100%;
        padding-top: 3px;
        border: 1px solid #635e5e;
        border-left: none;
        border-right: none;
        border-bottom: none;
        white-space: nowrap;
        overflow: hidden;
        color: #635e5e;
      }

      .divbilldatebox {
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        height: 24px;
        width: 100%;
        padding-top: 1px;
        font-size: 14px;
        border: 1px solid #635e5e;
        border-bottom: none;
        background-color: #c1bfbf78 !important;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        color: #635e5e;
      }

      .customerdetails {
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        height: 125px;
        width: 100%;
        overflow: hidden;
        border: 1px solid #635e5e;
        color: #635e5e;
      }

      .customerdetails span {
        text-align: left;
        white-space: nowrap;
        overflow: hidden;
        color: #302d2d;
      }

      .customerdetails .form1 {
        padding-top: 3px;
        float: left;
        border: 1px solid #635e5e;
        border-left: none;
        border-top: none;
        border-bottom: none;
        border-right: none;
        height: 100%;
        overflow: hidden;
        color: #635e5e;
      }

      .customerdetails .form1 .clsCustomer1divspan {
        float: left;
          padding-left: 3px;
          white-space: nowrap;
          overflow: hidden;
          height: 16px;
          color: #302d2d;
          width: 100%;
      }
      .customerdetails .form2 {
        padding-top: 3px;
        width: 205px;
        float: left;
        border: 1px solid #635e5e;
        border-left: none;
        border-top: none;
        border-bottom: none;
        border-right: none;
        height: 100%;
        overflow: hidden;
        color: #635e5e;
      }

      .customerdetails .form2 .clsCustomer2divspan {
        float: left;
        padding-left: 3px;
        white-space: nowrap;
        overflow: hidden;
        color: #635e5e;
        width: 100%;
      }

      .customerdetails .form3 {
        padding-top: 3px;
        width: 180px;
        float: left;
        border: 1px solid #635e5e;
        border-left: none;
        border-top: none;
        border-bottom: none;
        border-right: none;
        height: 100%;
        overflow: hidden;
        color: #635e5e;
      }

      .ProductDetails {
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        width: 100%;
        height: auto;
        border: 1px solid #635e5e;
        border-top: none;
        border-bottom: none;
        color: #635e5e;
      }

      .ProductDetails th {
        background-color: #c1bfbf78 !important;
        font-weight: bold;
        color: #635e5e;
      }

      .FotterSection {
        width: 100%;
        height: 166px;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        color: #635e5e;
      }

      .taxdetails {
        padding-top: 3px;
        width: 493px;
        float: left;
        border: 1px solid #635e5e;
        border-left: none;
        border-top: none;
        height: 144px;
        overflow: hidden;
        font-size: 11px;
        color: #635e5e;
        border-bottom: none;
        border-right: none;
      }

      .MessageDiv {
        color: #302d2d;
        border: 1px solid #302d2d;
        border-top: none;
        border-bottom: none;
        width: 100%;
        float: left;
        text-align: left;
      }

      .divOutstanding {
        padding-top: 2px;
        padding-left: 3px;
        width: 30%;
        float: left;
        font-size: 9px;
        font-weight: bold;
        overflow: hidden;
      }
      .divOutstanding span {
        width: 100%;
        float: left;
      }
      .BankDetails {
        border: 1px solid #635e5e;
        border-left: none;
        border-right: none;
        height: 40px;
        padding-top: 0px;
        color: #635e5e;
        float: left;
        text-align: left;

        width: 100%;
        border-bottom: none;
      }
      .banksection {
        width: 68%;
        padding-left: 14px;
        padding-top: 2px;
        float: left;
        font-weight: bold;
        font-size: 9px;
        overflow: hidden;
      }
      .BankDetails .in-bottom {
        border-top: 1px solid;
        padding-left: 14px;
      }
      .worddeclartion {
        width: 376px;
        float: left;
        border: 1px solid #635e5e;
        border-left: none;
        border-top: none;
        height: 137px;
        border-bottom: none;
        color: #635e5e;
      }

      .worddeclartion .clsDeclaration {
        border: 1px solid #635e5e;
        border-left: none;
        border-top: none;
        border-right: none;
        height: 40px;
        color: #635e5e;
      }

      .worddeclartion span {
        text-align: left;
        padding-left: 3px;
        font-size: 9px;
        width: 100%;
        color: #635e5e;
      }
      .clsAmtWordSection {
        float: left;
        border: 1px solid #302d2d;
        border-top: none;
        height: 144px;
        overflow: hidden;
        color: #302d2d;
        border-bottom: none;
        border-right: none;
      }
      .clsAmtWordSection table {
        width: 100%;
      }

      .clsAmtWordSection td,
      th {
        padding: 1px;

        white-space: nowrap;
        border: 1px solid #635e5e;
        color: #635e5e;
      }
      .clsAmtWordSection tr {
        height: 20px;
      }

      .clsAmtSection {
        border: 1px solid #302d2d;
        border-top: none;
        height: 144px;
        overflow: hidden;
        color: #302d2d;
        border-bottom: none;
        border-right: none;
      }

      .clsAmtSection table {
        width: 100%;
      }
      .clsAmtSection td,
      th {
        padding: 1px;
        white-space: nowrap;
        border: 1px solid #302d2d;
        color: #302d2d;
        border-left: none;
      }

      .clsAmtSection tr {
        height: 20px;
      }

      .FooterTotalSection {
        width: 100%;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-right: none;
        float: left;
        background-color: #c1bfbf78 !important;
        color: #635e5e;
      }

      .FooterTotalSection .AmtInWords {
        width: 493px;
        text-align: left;
        overflow: hidden;
        padding-left: 4px;
        float: left;
        padding-top: 3px;
        padding-bottom: 3px;
        border: 1px solid #635e5e;
        border-left: none;
        border-top: none;
        border-bottom: none;
        border-right: none;
        color: #635e5e;
      }
      .FooterTotalSection .GrandTotalLabel {
        text-align: left;
        overflow: hidden;
        padding-left: 4px;
        float: left;
        font-size: 16px;
        color: #635e5e;
        font-weight: 600;
        /*
        width: 112px;
        text-align: left;
        overflow: hidden;
        padding-left: 4px;
        float: left;
        font-size: 16px;
        color: #635e5e; */
      }

      .FooterTotalSection .GrandTotalAmount {
        width: 100%;
        text-align: right;
        overflow: hidden;
        padding-left: 4px;
        float: left;
        font-size: 16px;
        color: #635e5e;
        /*
        width: 130px;
        text-align: right;
        overflow: hidden;
        padding-left: 4px;
        font-size: 16px;
        color: #635e5e; */
      }

      .DeclareSection {
        height: 78px;
        width: 100%;
        float: left;
        padding-top: 4px;
        color: #635e5e;
        border: 1px solid #635e5e;
        border-top: none;
      }

      .DeclareSection .DeclareDetails {
        float: left;
          text-align: left;
          color: #302d2d;
          white-space: nowrap;
          overflow: hidden;
          font-size: 10px;
          padding-left: 4px;
      }
      .DeclareSection .SignatureSection {
        float: left;
        text-align: center;
        color: #302d2d;
        overflow: hidden;
      }

      .DeclareSection .MessageSection {
        width: 100%;
          float: left;
          padding-top: 0;
          color: #302d2d;
      }

      hr {
        display: block;
        margin-top: 0.5em;
        margin-bottom: 0.5em;
        margin-left: auto;
        margin-right: auto;
        border-width: 1px;
        border-color: #635e5e;
        float: left;
        width: 100%;
      }

      #pre-loader {
        display: none;
      }

      .tblNo {
        min-width: 33px;
        max-width: 33px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
        color: #635e5e;
      }

      .tblItemCode {
        width: 74px;
        min-width: 74px;
        max-width: 74px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
        color: #635e5e;
      }

      .tblProduct {
        width: 306px;
        min-width: 306px;
        max-width: 306px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: left;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .HSNCode {
        width: 30px;
        max-width: 30px;
        min-width: 30px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: left;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .MFRNo {
        width: 30px;
        max-width: 30px;
        min-width: 30px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: left;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .RateofTax {
        width: 40px;
        max-width: 40px;
        min-width: 40px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .Unit {
        width: 65px;
        max-width: 65px;
        min-width: 65px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }
      .ExpDate {
        width: 55px;
        max-width: 55px;
        min-width: 55px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: center;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }
      .Batch {
        width: 70px;
        max-width: 70px;
        min-width: 70px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .UnitPrice {
        width: 60px;
        max-width: 60px;
        min-width: 60px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .PTR {
        width: 60px;
        max-width: 60px;
        min-width: 60px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .PTW {
        width: 60px;
        max-width: 60px;
        min-width: 60px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .PricePlusTax {
        width: 60px;
        max-width: 60px;
        min-width: 60px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .Mrp {
        width: 60px;
        max-width: 60px;
        min-width: 60px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .Qty {
        width: 48px;
        max-width: 48px;
        min-width: 48px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .Free {
        width: 35px;
        max-width: 35px;
        min-width: 35px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .GrossValue {
        width: 60px;
        max-width: 60px;
        min-width: 60px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .GstAmount {
        width: 55px;
        max-width: 55px;
        min-width: 55px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .CashDisc {
        width: 55px;
        max-width: 55px;
        min-width: 55px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .Tax {
        width: 35px;
        max-width: 35px;
        min-width: 35px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }

      .SchemAmt {
        width: 50px;
        max-width: 50px;
        min-width: 50px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
      }
      .Amount {
        width: 75px;
        max-width: 75px;
        min-width: 75px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-right: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
        color: #635e5e;
      }

      .CessPers {
        width: 75px;
        max-width: 75px;
        min-width: 75px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
        color: #635e5e;
      }

      .CessAmt {
        width: 75px;
        max-width: 75px;
        min-width: 75px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-top: none;
        white-space: nowrap;
        color: #635e5e;
      }

      .AmtBeforeTotDis {
        width: 75px;
        max-width: 75px;
        min-width: 75px;
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        overflow: hidden;
        text-align: right;
        border: 1px solid #635e5e;
        border-left: none;
        border-bottom: none;
        border-right: none;
        border-top: none;
        white-space: nowrap;
        color: #635e5e;
      }

      .tblTaxDetails {
        border: 1px solid #302d2d;
          margin: 1px 3px 3px 10px;
          font-family: Arial;
          font-style: normal;
          font-variant: normal;
          font-size: 8pt;
          color: #302d2d;
      }

      .tblTaxDetails td,
      th {
        padding: 3px;
        border: 1px solid #635e5e;
        width: 68px;
        text-align: center;
        color: #635e5e;
        font-size: 9px;
      }

      .tblAmountDetails {
        font-family: Arial;
        color: #635e5e;
        font-size: 11px;
        font-weight: bold;
        border-left: 1px solid #635e5e;
      }

      .tblAmountDetails td,
      th {
        padding: 1px;

        white-space: nowrap;
        border: 1px solid #635e5e;
        color: #635e5e;
      }

      .tblAmountDetails tr {
        height: 23px;
      }

      .clsQrDetails {
        height: 144px;
        float: left;
        border-left: 1px solid #302d2d !important;
        overflow: hidden;
      }
      .clsQrDetails span {
        width: 100%;
        float: left;
        text-align: center;
        padding: 2px;
        font-weight: 600;
      }
      .clsQrDetails img {
        height: 90%;
        width: 98%;
        padding: 2px;
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

  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
