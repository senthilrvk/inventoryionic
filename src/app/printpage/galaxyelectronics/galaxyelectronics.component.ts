import { IssueTax } from './../../models/IssueTax';
import { Component, OnInit, Input, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { PrintOptions, Printer } from '@ionic-native/printer/ngx';
import { ModalController, NavParams } from '@ionic/angular';
import { Http, Headers } from '@angular/http';
import { IssueSub } from '../../models/IssueSub';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { File, IWriteOptions } from '@ionic-native/file/ngx';

import { jsPDF } from "jspdf";
import { PrinterService } from '../printer.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-galaxyelectronics',
  templateUrl: './galaxyelectronics.component.html',
  // styleUrls: ['./galaxyelectronics.component.css'],
  providers: []
})

export class GalaxyelectronicsComponent implements OnInit {
  @Input() BillNo: string;
  @Input() BillserId: string;
  @Input() UniqueNo: string;

  ApiUrl: string;
  branchId: any;
  objIssueSub: IssueSub;
  strAmtInwords: string;
  IssueTaxInfo: Array<IssueTax> = [];
  TotDisAmt: number;
  TotAmtBeforeTax: number;
  TotSGstTotal: number;
  TotCGstTotal: number;
  dTotCessAmt: number;
  TotIGstTotal: number;
  TotQty: number;
  TotGrossValue: number;
  todays: any;
  IssueInfo: any;

  BranchInfo: any;

  IssueSubDetailsInfo = [];
  endCount = [];
  count = 0;
  SalesIssue = [];
  private _unsubscribeAll: Subject<any>;
  constructor(private printer: Printer, private modalpage: ModalController, private http: Http,
              public navParams: NavParams, private cd: ChangeDetectorRef,
    private socialSharing: SocialSharing, private file: File,
    private printService: PrinterService,
              public ctrlService: ControlService) {
    this.BillNo = navParams.get('BillNo');
    this.BillserId = navParams.get('BillserId');
    this.UniqueNo = navParams.get('UniqueNo');

    this.ctrlService.get('sessionInvenBranchId').then((val) => {
      if (val != null) {
        this.branchId = val;
      }
    });

    this.ctrlService.get('sessionsurl').then((val) => {
      if (val != null) {
        this.ApiUrl = val;
        setTimeout(() => {
          this.fngetPrint();
        }, 1000);
      }
    });


  }

  ngOnInit() {
    this._unsubscribeAll = new Subject();
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
      //  const fileName = `invoiceBill_${this.IssueInfo.BillSerPrefix}-${this.IssueInfo.Issue_SlNo}.pdf`;
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

  fngetPrint() {
    const BillSerId = this.BillserId;
    const BillNo = this.BillNo;
    const UniqueNo = this.UniqueNo;
    const BranchId = this.branchId;
    this.printService.onIssuePrint(BillSerId, BillNo,UniqueNo, BranchId, this.ApiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {

        const JsonIssueSubDetailsInfo = JSON.parse(data.JsonIssueSubDetailsInfo);
        const JsonIssueTaxInfo = JSON.parse(data.JsonIssueTaxInfo);
        const JsonBranchInfo = JSON.parse(data.JsonBranchInfo);
        const JsonIssueInfo = JSON.parse(data.JsonIssueInfo);

        this.IssueSubDetailsInfo = JsonIssueSubDetailsInfo;
        this.IssueInfo = JsonIssueInfo[0];
        this.BranchInfo = JsonBranchInfo[0];

        for (let i = 0; i < JsonIssueTaxInfo.length; i++) {
          // tslint:disable-next-line:prefer-const
          let issueTaxobj = new IssueTax();
          issueTaxobj.setTax(JsonIssueTaxInfo[i].IssueTaxId, JsonIssueTaxInfo[i].TaxId, JsonIssueTaxInfo[i].TaxAmount,
            JsonIssueTaxInfo[i].Amount, JsonIssueTaxInfo[i].SGSTTaxPers, JsonIssueTaxInfo[i].SGSTTaxAmount,
            JsonIssueTaxInfo[i].SGSTAmount, JsonIssueTaxInfo[i].CGSTTaxPers, JsonIssueTaxInfo[i].CGSTTaxAmount,
            JsonIssueTaxInfo[i].CGSTAmount, JsonIssueTaxInfo[i].IGSTTaxPers, JsonIssueTaxInfo[i].IGSTTaxAmount,
            JsonIssueTaxInfo[i].IGSTAmount, JsonIssueTaxInfo[i].CessAmt);
          this.IssueTaxInfo.push(issueTaxobj);
        }
        let PageLength;
        const Prodlength = this.IssueSubDetailsInfo.length;
        const pageDivide = Prodlength / 24;
        const totalLength = pageDivide.toFixed();

        if (totalLength === '0') {
          PageLength = 1;
        } else {
          PageLength = totalLength;
        }

        for (let index = 0; index < PageLength; index++) {
          this.endCount.push({ count: index });
        }

      }).finally(() => {
        // this.fngetTaxTotal();
      })
  }

  DateRet(value) {
    const BillDate = value;
    const BillDate1 = BillDate.split('-');
    const Dates = BillDate1[2] + '/' + BillDate1[1] + '/' + BillDate1[0];
    return Dates;
  }

  fnGetRowCount() {
    const Prodlength = this.IssueSubDetailsInfo.length;
    const pageDivide = Prodlength / 25;
    const totalLength = Number(pageDivide.toFixed());
    if (totalLength === 0) {
      this.SalesIssue = this.IssueSubDetailsInfo;
    } else {
      let countEnd = 25;
      for (let index = 0; index < totalLength; index++) {
          for (let i = this.count; i < countEnd; i++) {
            this.SalesIssue.push(this.IssueSubDetailsInfo[i]);
          }
          if (Prodlength < this.count) {
             countEnd = Prodlength;
          } else {
            countEnd = countEnd + 25;
          }
          this.count = this.SalesIssue.length;
          this.endCount.push({ count: index });

      }
    }

  }

  fngetTaxTotal() {
    this.dTotCessAmt = 0;
    // tslint:disable-next-line:prefer-const
    let dCessAmt1 = 0, dCessAmt2 = 0, dCessAmt3 = 0, dCessAmt4 = 0, dCessAmt5 = 0, dCessAmt6 = 0, dCessAmt7 = 0, dCessAmt8 = 0, dCessAmt9 = 0, dCessAmt10 = 0;
    let Amt0 = 0, Amt1 = 0, Amt5 = 0, Amt14 = 0, Amt20 = 0;
    let Amt12 = 0, Amt18 = 0, Amt28 = 0;
    let Tax1 = 0, Tax5 = 0, Tax14 = 0, Tax20 = 0;
    let Tax12 = 0, Tax18 = 0, Tax28 = 0;

    const dSGSTTaxAmt = 0, dCGSTTaxAmt = 0, dIGSTTaxAmt = 0, dSGSTAmt = 0, dCGSTAmt = 0, dIGSTAmt = 0;
    let dSGSTTaxAmt1 = 0, dSGSTTaxAmt2 = 0, dSGSTTaxAmt3 = 0, dSGSTTaxAmt4 = 0, dSGSTTaxAmt5 = 0, dSGSTTaxAmt6 = 0, dSGSTTaxAmt7 = 0, dSGSTTaxAmt8 = 0,
      // tslint:disable-next-line:prefer-const
      dSGSTTaxAmt9 = 0, dSGSTTaxAmt10 = 0, dSGSTTaxAmt11 = 0, dSGSTTaxAmt12 = 0, dSGSTTaxAmt13 = 0, dSGSTTaxAmt14 = 0, dSGSTTaxAmt15 = 0;
    let dCGSTTaxAmt1 = 0, dCGSTTaxAmt2 = 0, dCGSTTaxAmt3 = 0, dCGSTTaxAmt4 = 0, dCGSTTaxAmt5 = 0, dCGSTTaxAmt6 = 0, dCGSTTaxAmt7 = 0, dCGSTTaxAmt8 = 0,
      // tslint:disable-next-line:prefer-const
      dCGSTTaxAmt9 = 0, dCGSTTaxAmt10 = 0, dCGSTTaxAmt11 = 0, dCGSTTaxAmt12 = 0, dCGSTTaxAmt13 = 0, dCGSTTaxAmt14 = 0, dCGSTTaxAmt15 = 0;
    let dIGSTTaxAmt1 = 0, dIGSTTaxAmt2 = 0, dIGSTTaxAmt3 = 0, dIGSTTaxAmt4 = 0, dIGSTTaxAmt5 = 0, dIGSTTaxAmt6 = 0, dIGSTTaxAmt7 = 0, dIGSTTaxAmt8 = 0,
      // tslint:disable-next-line:prefer-const
      dIGSTTaxAmt9 = 0, dIGSTTaxAmt10 = 0, dIGSTTaxAmt11 = 0, dIGSTTaxAmt12 = 0, dIGSTTaxAmt13 = 0, dIGSTTaxAmt14 = 0, dIGSTTaxAmt15 = 0;

    this.IssueTaxInfo.forEach(tax => {

      if (tax.TaxId === 1) {
        Amt0 = tax.Amount;
        dSGSTTaxAmt1 = tax.SGSTTaxAmount;
        dCGSTTaxAmt1 = tax.CGSTTaxAmount;
        dIGSTTaxAmt1 = tax.IGSTTaxAmount;
        dCessAmt1 = (tax.CessAmt);
      } else if (tax.TaxId === 2) {
        Amt1 = tax.Amount;
        Tax1 = tax.TaxAmount;
        dSGSTTaxAmt2 = tax.SGSTTaxAmount;
        dCGSTTaxAmt2 = tax.CGSTTaxAmount;
        dIGSTTaxAmt2 = tax.IGSTTaxAmount;
        dCessAmt2 = (tax.CessAmt);
      } else if (tax.TaxId === 3) {
        Amt5 = tax.Amount;
        Tax5 = tax.TaxAmount;
        dSGSTTaxAmt3 = tax.SGSTTaxAmount;
        dCGSTTaxAmt3 = tax.CGSTTaxAmount;
        dIGSTTaxAmt3 = tax.IGSTTaxAmount;
        dCessAmt3 = (tax.CessAmt);
      } else if (tax.TaxId === 4) {
        Amt14 = tax.Amount;
        Tax14 = tax.TaxAmount;
        dSGSTTaxAmt4 = tax.SGSTTaxAmount;
        dCGSTTaxAmt4 = tax.CGSTTaxAmount;
        dIGSTTaxAmt4 = tax.IGSTTaxAmount;
        dCessAmt4 = (tax.CessAmt);
      } else if (tax.TaxId === 5) {
        Amt20 = tax.Amount;
        Tax20 = tax.TaxAmount;
        dSGSTTaxAmt5 = tax.SGSTTaxAmount;
        dCGSTTaxAmt5 = tax.CGSTTaxAmount;
        dIGSTTaxAmt5 = tax.IGSTTaxAmount;
        dCessAmt5 = (tax.CessAmt);
      } else if (tax.TaxId === 6) {
        Amt12 = tax.Amount;
        Tax12 = tax.TaxAmount;
        dSGSTTaxAmt6 = tax.SGSTTaxAmount;
        dCGSTTaxAmt6 = tax.CGSTTaxAmount;
        dIGSTTaxAmt6 = tax.IGSTTaxAmount;
        dCessAmt6 = (tax.CessAmt);
      } else if (tax.TaxId === 7) {
        Amt18 = tax.Amount;
        Tax18 = tax.TaxAmount;
        dSGSTTaxAmt7 = tax.SGSTTaxAmount;
        dCGSTTaxAmt7 = tax.CGSTTaxAmount;
        dIGSTTaxAmt7 = tax.IGSTTaxAmount;
        dCessAmt7 = (tax.CessAmt);
      } else if (tax.TaxId === 8) {
        Amt28 = tax.Amount;
        Tax28 = tax.TaxAmount;
        dSGSTTaxAmt8 = tax.SGSTTaxAmount;
        dCGSTTaxAmt8 = tax.CGSTTaxAmount;
        dIGSTTaxAmt8 = tax.IGSTTaxAmount;
        dCessAmt8 = (tax.CessAmt);
      }
    });
    this.dTotCessAmt = dCessAmt1 + dCessAmt2 + dCessAmt3 + dCessAmt4 + dCessAmt5 + dCessAmt6 + dCessAmt7 + dCessAmt8 + dCessAmt9 + dCessAmt10;
    this.TotAmtBeforeTax = Amt0 + Amt5 + Amt12 + Amt14 + Amt18;


      this.fngetTotal();



  }

  fngetTotal() {

    this.TotQty = 0;
    this.TotGrossValue = 0;
    this.TotSGstTotal = 0;
    this.TotCGstTotal = 0;
    this.TotIGstTotal = 0;
    // this.TotAmtBeforeTax = 0;
    this.TotDisAmt = 0;
    let GrossValue = 0;
    this.IssueSubDetailsInfo.forEach(element => {
      GrossValue = (element.IssueSub_Qty) * (element.IssueSub_ActualRate);
      this.TotGrossValue += GrossValue;
      this.TotQty += (element.IssueSub_Qty);
      this.TotDisAmt += (element.IssueSub_ProdDisAmt);
      // this.TotAmtBeforeTax    += parseFloat(element.IssueSub_Amount) - parseFloat(element.IssueSub_TaxAmt);
      this.TotSGstTotal += (element.IssueSub_SGSTTaxAmount);
      this.TotCGstTotal += (element.IssueSub_CGSTTaxAmount);
      this.TotIGstTotal += (element.IssueSub_IGSTTaxAmount);

    });
    this.getAmountInwords();
  }

  async getAmountInwords() {
    const ServiceParams = { strProc: '', oProcParams: [] };
    ServiceParams.strProc = 'fnNumToWords_GetValue';

    const oProcParams = [];
    const ProcParams = { strKey: '', strArgmt: 0 };
    ProcParams.strKey = 'Value';
    ProcParams.strArgmt = (this.IssueInfo.Issue_Total);
    oProcParams.push(ProcParams);
    ServiceParams.oProcParams = oProcParams;

    const body = JSON.stringify(ServiceParams);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf-8');
    await this.http.post(this.ApiUrl + '/CommonQuery/fnGetDataReport', body, { headers })
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise()
      .then(data => {
        const jsonobj = JSON.parse(data.json());
        this.strAmtInwords = jsonobj[0].Words;
        setTimeout(() => {
          this.cd.detectChanges();
          // console.log('detected');
        }, 100);
      }, error => console.error(error));
  }


  fnPrintpage() {

    // let popupWinindow ;
    // const innerContents = document.getElementById('printer_content').innerHTML;
    // popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    // popupWinindow.document.open();
    // popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + innerContents + '</html>');
    // popupWinindow.document.close();
    // return;
    setTimeout(() => {
      const content = document.getElementById('printer_content').innerHTML;
      const options: PrintOptions = {
        name: 'vansales',

        duplex: false,
        orientation: 'portrait',

      };

      this.printer.print(content, options).then(onError => {
        console.log(onError);
      });
    }, 200);


  }

  fnClose() {
    this.modalpage.dismiss();
  }


ngOnDestroy(): void {

  this._unsubscribeAll.next();
  this._unsubscribeAll.complete();
}
}
