import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PrintOptions, Printer } from '@ionic-native/printer/ngx';
import {  ModalController, NavParams } from '@ionic/angular';

import { AppService } from 'src/app/app.service';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import domtoimage from 'dom-to-image';
import  jsPDF from 'jspdf';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-textile-estimate-a5',
  templateUrl: './textile-estimate-a5.component.html',
  styleUrls: ['../../../assets/css/print_style.css'],
})
export class TextileEstimateA5Component implements OnInit {
  @Input() BillNo: string;
  @Input() BillserId: string;
  @Input() UniqueNo: string;
  @Input() PrintFrom: string;
  ApiUrl: string;
  branchId: any;
  JsonBranchInfo: any;
  JsonIssueInfo: any;
  JsonIssueTaxInfo: any;
  strBillNo: string;
  strBillDate: string;
  strOrderDate: string;
  dBillBalance: number = 0;
  strImageSave: string;
  strLogoImageName: string;
  baseImageUrl: string;
  JsonSubInfo: any[] = [];
  nNoOfItemPerPage: number = 28;
  oArray = new Array();
  TotDisAmt: number = 0;
  TotAfterDiscount: number = 0;
  TotAmtBeforeTax: number = 0;
  GrossValue: number = 0;
  TotGrossValue: number = 0;
  TotTaxAmt: number = 0;
  NetValue: number = 0;
  TotNetValue: number = 0;
  TotQty: number = 0;
  TotFQty: number = 0;
  TotCessAmt: number = 0;
  dTotBillRowTotal: number = 0;
  TotCGstTotal: number = 0;
  TotSGstTotal: number = 0;
  TotIGstTotal: number = 0;
  dTotDisGrossValue: number = 0;
  bProductNextLine: any;
  private _unsubscribeAll: Subject<any>;
  JsonSub = {
    SlNo: '', ItemDesc: '', HSNCode: '', IssueSub_TaxPers: '', IssueSub_Qty: '', IssueSub_OriginalRate: '', CashDisc: '', GrossValue: '',
    Rate: '', IssueSub_TaxAmt: '', RowTotal: '', IssueSub_Mrp: '', Unit: '', Batch: '', ExpDate: '', IssueSub_FreeQty: '',
    SchemAmt: '',DisRate:'',DisGrossValue :''
  }
  ItemDescLen: number = 30;
  PrintItemColumnDetails: any;
  bPrintLogo: boolean;
  bPrintHeaderImage: boolean;

  constructor(private printer: Printer, private modalpage: ModalController,
    public cd: ChangeDetectorRef,
    private socialSharing: SocialSharing,
    private file: File,
    navParams: NavParams, private appService: AppService,
    public ctrlService: ControlService) {
      this.BillNo = navParams.get('BillNo');
      this.BillserId = navParams.get('BillserId');
    this.UniqueNo = navParams.get('UniqueNo');
    this.strImageSave = navParams.get('ImageSave');


    this.ctrlService.get('sessionInvenBranchId').then((val) => {
      if (val != null) {
        this.branchId = val;
      }
    });

    this.ctrlService.get('sessionsurl').then((val) => {
      if (val != null) {
        this.ApiUrl = val;
        this.fnPrintDisplaySetting()
      }
    });


     }

  ngOnInit() {  this._unsubscribeAll = new Subject(); }


  fnPrintDisplaySetting() {
    let ServiceParams = {};
    ServiceParams['strProc'] = 'PrintDisplaySettings_Gets';
    ServiceParams['JsonFileName'] = 'JsonArrayScriptFour';

    let oProcParams = [];
    let ProcParams = {};

    ProcParams['strKey'] = '@ParamsPrintName';
    ProcParams['strArgmt'] = 'TextilesEstimateAFive';
    oProcParams.push(ProcParams);
    ServiceParams['oProcParams'] = oProcParams;
    let body = JSON.stringify(ServiceParams);
    this.appService.fnApiPost(this.ApiUrl + '/CommonQuery/fnGetDataReportFromScriptJsonFile', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        this.PrintItemColumnDetails = JSON.parse(data.JsonDetails[0]);


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
        this.fnBillPrint();
      });
  }

  fnBillPrint() {
    let varArguements = {};
    varArguements = {
      BillSerId: this.BillserId, BillNo: this.BillNo,
      UniqueNo: this.UniqueNo, BranchId: this.branchId
    };

    let DictionaryObject = {};
    DictionaryObject['dictArgmts'] = varArguements;
    DictionaryObject['ProcName'] = '';

    let strUrlName = "Sales/Sales_CopyPrint";
    if (this.PrintFrom == "DummyBill") {
      strUrlName = "Sales/SalesBillDummy_CopyPrint";
    }
    let body = JSON.stringify(DictionaryObject);
    this.appService.fnApiPost(`${this.ApiUrl}/${strUrlName}`, body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {

        this.JsonBranchInfo = JSON.parse(data.JsonBranchInfo)[0];
        this.JsonIssueInfo = JSON.parse(data.JsonIssueInfo)[0];
        let JsonIssueSubDetailsInfo = JSON.parse(data.JsonIssueSubDetailsInfo);
        this.JsonIssueTaxInfo = JSON.parse(data.JsonIssueTaxInfo);
        let issueOutstandingInfo = JSON.parse(data.JsonOutstanding);
        this.strBillNo = this.JsonIssueInfo.BillSerPrefix + '-' + this.JsonIssueInfo.Issue_SlNo
        this.strBillDate = String(this.JsonIssueInfo.Issue_BillDate).split('-').reverse().join('/');
        this.strOrderDate = String(this.JsonIssueInfo.Issue_OrderDate).split('-').reverse().join('/');
        let count = 1;
        let dBillRowTotal = 0;
        this.dBillBalance  =  parseFloat(this.JsonIssueInfo.OldBalance) ;

        if(this.JsonIssueInfo.Issue_PayTerms == 'CREDIT'){
          this.dBillBalance  =  parseFloat(this.JsonIssueInfo.OldBalance) + parseFloat(this.JsonIssueInfo.Issue_Total)
        }

        if (this.JsonBranchInfo.ComImage != '') {

          if (this.strImageSave == 'ONLINE') {
            this.strLogoImageName = 'https://s3.ap-south-1.amazonaws.com/codeappsimageerp/' + this.JsonBranchInfo.ComImage;
          } else {
            this.strLogoImageName = this.baseImageUrl + '/ImagesUploaded/' + this.JsonBranchInfo.ComImage;
          }

        }

        var dRatePlusTax = 0;
        var dDiscountRate = 0, dDisGrossValue = 0;

        JsonIssueSubDetailsInfo.forEach(element => {


          dDiscountRate =0;
          this.GrossValue = parseFloat(element.IssueSub_Qty) * parseFloat(element.IssueSub_ActualRate);
          this.TotGrossValue += this.GrossValue;
          this.TotTaxAmt += parseFloat(element.IssueSub_TaxAmt);
          this.NetValue = this.GrossValue - parseFloat(element.IssueSub_ProdDisAmt)
          this.TotNetValue += this.NetValue;
          this.TotQty += parseFloat(element.IssueSub_Qty || 0);
          this.TotFQty += parseFloat(element.IssueSub_FreeQty || 0);
          this.TotCessAmt += parseFloat(element.IssueSub_CessAmt);

          this.TotAmtBeforeTax += parseFloat(element.IssueSub_Qty) * parseFloat(element.IssueSub_ActualRate);
          dBillRowTotal = parseFloat(element.IssueSub_Amount) - parseFloat(element.IssueSub_CessAmt);
          this.dTotBillRowTotal += dBillRowTotal;
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
          }

          dDiscountRate  =   parseFloat(element.IssueSub_OriginalRate) - (( parseFloat(element.IssueSub_OriginalRate) *parseFloat(element.IssueSub_PdodDis))/100);
          dDisGrossValue =   parseFloat(element.IssueSub_Qty) * dDiscountRate

          this.dTotDisGrossValue +=  dDisGrossValue;

          this.JsonSub = {
            SlNo: count.toFixed(), ItemDesc: this.CalcColSpaces(element.ItemDesc, this.ItemDescLen), HSNCode: element.HSNCode,
            IssueSub_TaxPers: parseInt(element.IssueSub_TaxPers).toFixed(), IssueSub_Qty: parseFloat(element.IssueSub_Qty).toFixed(2),
            IssueSub_OriginalRate: (dRatePlusTax).toFixed(2),
            CashDisc: parseFloat(element.IssueSub_PdodDis).toFixed(2), GrossValue: (this.GrossValue).toFixed(2),
            Rate: parseFloat(element.IssueSub_ActualRate).toFixed(2), IssueSub_TaxAmt: parseFloat(element.IssueSub_TaxAmt).toFixed(2),
            RowTotal: dBillRowTotal.toFixed(2), IssueSub_Mrp: parseFloat(element.IssueSub_Mrp).toFixed(2)
            , Unit: element.Unit, Batch: element.IssueSub_Batch, ExpDate: this.DateRetExpiryFormat(element.IssueSub_ExpDate),
            IssueSub_FreeQty: parseFloat(element.IssueSub_FreeQty).toFixed(2), SchemAmt: parseFloat(element.IssueSub_SchmAmt).toFixed(2),
            DisRate:dDiscountRate.toFixed(2),DisGrossValue :dDisGrossValue.toFixed(2)
          }

          this.JsonSubInfo.push(this.JsonSub);

          if (this.bProductNextLine) {
            if (element.ItemDesc.length > this.ItemDescLen) {

              this.JsonSub = {
                SlNo: '', ItemDesc: this.CalcColSpaces(element.ItemDesc.substring(this.ItemDescLen - 1, element.ItemDesc.length), this.ItemDescLen), HSNCode: '',
                IssueSub_TaxPers: '', IssueSub_Qty: '',
                IssueSub_OriginalRate: '',
                CashDisc: '', GrossValue: '',
                Rate: '', IssueSub_TaxAmt: '',
                RowTotal: '', IssueSub_Mrp: ''
                , Unit: '', Batch: '', ExpDate: '',
                IssueSub_FreeQty: '', SchemAmt: '',DisRate:'',DisGrossValue :''
              }
              this.JsonSubInfo.push(this.JsonSub);
            }
          }

          count = count + 1;

        });

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
            SchemAmt: '',DisRate:'',DisGrossValue :''
          }
          if (arr1.length < this.nNoOfItemPerPage) {

            for (var j = arr1.length; j < this.nNoOfItemPerPage; j++) {
              arr1.push(this.JsonSub);
            }

          }

          this.oArray.push(arr1);
        }
        setTimeout(() => {
          this.cd.detectChanges();
        });

      });
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
  fnClose() {
    this.modalpage.dismiss();
  }

  fnPrintpage() {

    // let popupWinindow ;
    // const innerContents = document.getElementById('printer_content').innerHTML;
    // popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    // popupWinindow.document.open();
    // popupWinindow.document.write(`<html><head><link rel="stylesheet/scss" type="text/css" href="src/app/printpage/textile-estimate-a5/textile-estimate-a5.component.scss" /></head><body onload="window.print()">${innerContents}</html>`);
    // popupWinindow.document.close();
    // return;

      const content = document.getElementById('printer_content').innerHTML;
      const page = `<html>
      <head>
      <link rel="stylesheet" type="text/css" href="../assets/css/print_style.css" />
      </head>
      <body>
      ${content}
      </body>
      </html>`
      const options: PrintOptions = {
        name: 'vansales',
        duplex: false,
        orientation: 'portrait',
      };

      this.printer.pick().then(() => {

        this.printer.print(page, options).then(res => {
          console.log(res);
        }).catch((onError) => console.error(onError));

      });
  }



  async fnSharepage() {

    this.ctrlService.onLoading('Creating PDF file...');

    const element:any = document.getElementById('printer_content') as HTMLDivElement;
    const option = { allowTaint: true, useCORS: true };
    let content:HTMLDivElement = element.firstChild;

    await html2canvas(content, option).then((canvas) => {
      if (canvas) {
        canvas.getContext('2d');
        const dataUrl = canvas.toDataURL('image/png');
        const doc = new jsPDF("p","mm","a4");
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
      }
     }).catch(function (error) {
      this.ctrlService.hideLoader();
       console.error('oops, something went wrong!', error);
     });

   }


ngOnDestroy(): void {

  this._unsubscribeAll.next();
  this._unsubscribeAll.complete();
}
}
