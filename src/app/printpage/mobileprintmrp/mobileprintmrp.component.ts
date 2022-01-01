import { Component, OnInit, Input } from '@angular/core';
import { PrintOptions, Printer } from '@ionic-native/printer/ngx';
import { ModalController, NavParams } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { PrinterService } from '../printer.service';

@Component({
  selector: 'app-mobileprintmrp',
  templateUrl: './mobileprintmrp.component.html',
  styleUrls: ['./mobileprintmrp.component.scss'],
})
export class MobileprintmrpComponent implements OnInit {
  @Input() BillNo: string;
  @Input() BillserId: string;
  @Input() UniqueNo: string;
  private _unsubscribeAll: Subject<any>;
  ApiUrl: string;
  branchId: any;
  BranchInfo: any;
  IssueInfo: any;
  IssueSubDetailsInfo: any;
  strAmtInwords: string;
  IssueTaxInfo: any;
  TotDisAmt: number;
  TotAmtBeforeTax: number;
  TotSGstTotal: number;
  TotCGstTotal: number;
  dTotCessAmt: number;
  TotIGstTotal: number;
  TotQty: number;
  TotGrossValue: number;

  constructor(private printer: Printer, private modalpage: ModalController,
    navParams: NavParams, private ctrlService: ControlService,
  private appService: AppService, private printService: PrinterService) {
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

  fngetPrint() {
    const BillSerId = this.BillserId;
    const BillNo = this.BillNo;
    const UniqueNo = this.UniqueNo;
    const BranchId = this.branchId;

    this.printService.onIssuePrint(BillSerId, BillNo,UniqueNo, BranchId, this.ApiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        const JsonIssueSubDetailsInfo = JSON.parse(data.JsonIssueSubDetailsInfo);
        const JsonIssueTaxInfo = JSON.parse(data.JsonIssueTaxInfo);
        const JsonBranchInfo = JSON.parse(data.JsonBranchInfo);
        const JsonIssueInfo = JSON.parse(data.JsonIssueInfo);

        this.IssueSubDetailsInfo = JsonIssueSubDetailsInfo;
        this.IssueTaxInfo = JsonIssueTaxInfo;
        this.BranchInfo = JsonBranchInfo[0];
        this.IssueInfo = JsonIssueInfo[0];
        this.getAmountInwords();
        this.fngetTaxTotal();
        this.fngetTotal();
        // console.log(this.IssueSubDetailsInfo);

        // console.log(JsonIssueSubDetailsInfo);
        // console.log(JsonIssueTaxInfo);

        // console.log(JsonIssueInfo);
      });
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
        dCessAmt1 = parseFloat(tax.CessAmt);
      } else if (tax.TaxId === 2) {
        Amt1 = tax.Amount;
        Tax1 = tax.TaxAmount;
        dSGSTTaxAmt2 = tax.SGSTTaxAmount;
        dCGSTTaxAmt2 = tax.CGSTTaxAmount;
        dIGSTTaxAmt2 = tax.IGSTTaxAmount;
        dCessAmt2 = parseFloat(tax.CessAmt);
      } else if (tax.TaxId === 3) {
        Amt5 = tax.Amount;
        Tax5 = tax.TaxAmount;
        dSGSTTaxAmt3 = tax.SGSTTaxAmount;
        dCGSTTaxAmt3 = tax.CGSTTaxAmount;
        dIGSTTaxAmt3 = tax.IGSTTaxAmount;
        dCessAmt3 = parseFloat(tax.CessAmt);
      } else if (tax.TaxId === 4) {
        Amt14 = tax.Amount;
        Tax14 = tax.TaxAmount;
        dSGSTTaxAmt4 = tax.SGSTTaxAmount;
        dCGSTTaxAmt4 = tax.CGSTTaxAmount;
        dIGSTTaxAmt4 = tax.IGSTTaxAmount;
        dCessAmt4 = parseFloat(tax.CessAmt);
      } else if (tax.TaxId === 5) {
        Amt20 = tax.Amount;
        Tax20 = tax.TaxAmount;
        dSGSTTaxAmt5 = tax.SGSTTaxAmount;
        dCGSTTaxAmt5 = tax.CGSTTaxAmount;
        dIGSTTaxAmt5 = tax.IGSTTaxAmount;
        dCessAmt5 = parseFloat(tax.CessAmt);
      } else if (tax.TaxId === 6) {
        Amt12 = tax.Amount;
        Tax12 = tax.TaxAmount;
        dSGSTTaxAmt6 = tax.SGSTTaxAmount;
        dCGSTTaxAmt6 = tax.CGSTTaxAmount;
        dIGSTTaxAmt6 = tax.IGSTTaxAmount;
        dCessAmt6 = parseFloat(tax.CessAmt);
      } else if (tax.TaxId === 7) {
        Amt18 = tax.Amount;
        Tax18 = tax.TaxAmount;
        dSGSTTaxAmt7 = tax.SGSTTaxAmount;
        dCGSTTaxAmt7 = tax.CGSTTaxAmount;
        dIGSTTaxAmt7 = tax.IGSTTaxAmount;
        dCessAmt7 = parseFloat(tax.CessAmt);
      } else if (tax.TaxId === 8) {
        Amt28 = tax.Amount;
        Tax28 = tax.TaxAmount;
        dSGSTTaxAmt8 = tax.SGSTTaxAmount;
        dCGSTTaxAmt8 = tax.CGSTTaxAmount;
        dIGSTTaxAmt8 = tax.IGSTTaxAmount;
        dCessAmt8 = parseFloat(tax.CessAmt);
      }
    });
    this.dTotCessAmt = dCessAmt1 + dCessAmt2 + dCessAmt3 + dCessAmt4 + dCessAmt5 + dCessAmt6 + dCessAmt7 + dCessAmt8 + dCessAmt9 + dCessAmt10;
    this.TotAmtBeforeTax = Amt0 + Amt5 + Amt12 + Amt14 + Amt18;

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
      GrossValue = parseFloat(element.IssueSub_Qty) * parseFloat(element.IssueSub_ActualRate);
      this.TotGrossValue += GrossValue;
      this.TotQty += parseFloat(element.IssueSub_Qty);
      this.TotDisAmt += parseFloat(element.IssueSub_ProdDisAmt);
      // this.TotAmtBeforeTax    += parseFloat(element.IssueSub_Amount) - parseFloat(element.IssueSub_TaxAmt);
      this.TotSGstTotal += parseFloat(element.IssueSub_SGSTTaxAmount);
      this.TotCGstTotal += parseFloat(element.IssueSub_CGSTTaxAmount);
      this.TotIGstTotal += parseFloat(element.IssueSub_IGSTTaxAmount);

    });
  }

  async getAmountInwords() {
    const ServiceParams = {strProc: '', oProcParams: []};
    ServiceParams.strProc = 'fnNumToWords_GetValue';

    const oProcParams = [];
    const ProcParams = {strKey: '', strArgmt: 0};
    ProcParams.strKey = 'Value';
    ProcParams.strArgmt = parseFloat(this.IssueInfo.Issue_Total);
    oProcParams.push(ProcParams);
    ServiceParams.oProcParams = oProcParams;

    const body = JSON.stringify(ServiceParams);
    
    await this.appService.fnApiPost(this.ApiUrl + '/CommonQuery/fnGetDataReport', body)
    .pipe(takeUntil(this._unsubscribeAll)).toPromise()
      .then(data => {
        const jsonobj = JSON.parse(data);
        this.strAmtInwords = jsonobj[0].Words;
      }, error => console.error(error));
  }


  fnPrintpage() {

    // let popupWinindow
    // let innerContents = document.getElementById('printer_content').innerHTML;
    // popupWinindow = window.open('', '_blank', 'width=600,height=700,scrollbars=no,menubar=no,toolbar=no,location=no,status=no,titlebar=no');
    // popupWinindow.document.open();
    // popupWinindow.document.write('<html><head><link rel="stylesheet" type="text/css" href="style.css" /></head><body onload="window.print()">' + innerContents + '</html>');
    // popupWinindow.document.close();
    // return;
    const content = document.getElementById('printer_content').innerHTML;
    const options: PrintOptions = {

      name: 'vansales',
      duplex: false,
      orientation: 'portrait',
    };


    this.printer.print(content, options).then(onError => {
      console.log(onError);
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
