import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { AppService } from 'src/app/app.service';

import { PrintOptions, Printer } from '@ionic-native/printer/ngx';
import { ModalController, NavParams } from '@ionic/angular';
 import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import  jsPDF from 'jspdf';
import { PrinterService } from '../printer.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-fatimainvoiceprint',
  templateUrl: './fatimainvoiceprint.component.html'
  // styleUrls: ['./fatimainvoiceprint.component.scss'],

})
export class FatimainvoiceprintComponent implements OnInit {
  private _unsubscribeAll: Subject<any>;

  @Input() BillNo: string;
  @Input() BillSerId: string;
  @Input() UniqueNo: string;

  branchId: any;
  ApiUrl: string;
  ImageName: string;
  Jurisdiction: string;
  strImageSave: string;
  strTopHeader: string;
  JsonIssueInfo:any;
  JsonBranchInfo:any;
  JsonIssueTaxInfo:any;
  strBillNo:any;
  strBillDate:any;
  JsonSubInfo=[];
  oArray = new Array();
  nNoOfItemPerPage = 21;
  GrossValue=0;TotGrossValue=0;TotTaxAmt=0;NetValue=0;TotNetValue=0;TotQty=0;TotFQty=0;
  TotAmtBeforeTax=0;TotSGstTotal=0;TotCGstTotal=0;TotIGstTotal=0;TotDisAmt=0;TotCessAmt=0;dTotBillRowTotal=0;
  strLogoImageName="";

  JsonSub = { SlNo:'',ItemDesc:'',HSNCode:'',IssueSub_TaxPers:'',IssueSub_Qty:'',IssueSub_OriginalRate:'',CashDisc:'',GrossValue:'',
  Rate:'', IssueSub_TaxAmt:'',RowTotal:'',IssueSub_Mrp:'' }
  TotAfterDiscount: number;

  IssueInfo: any;
  constructor(private appService: AppService, private printer: Printer, private modalpage: ModalController,
    private socialSharing: SocialSharing, private file: File,
    public ctrlService: ControlService,private printService: PrinterService,
     public navParams: NavParams, private cd: ChangeDetectorRef) {

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
        this.fnBillPrint();
      }
    });

  }

  ngOnInit() {
      // this.fnSettings();
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
       let pdfOutput = doc.output();
       let buffer = new ArrayBuffer(pdfOutput.length);
       let array = new Uint8Array(buffer);
       for (var i = 0; i < pdfOutput.length; i++) {
         array[i] = pdfOutput.charCodeAt(i);
       }

        const directory = this.file.cacheDirectory;
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
             this.socialSharing.share('invoiceBill', null, directory + fileName, null)
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



   async fnSettings() {

    var dictArgmts= {ProcName:'Settings_GetValues'};

    let body = JSON.stringify(dictArgmts);

     await this.appService.fnApiPost(this.ApiUrl + '/Master/fnSettings', body)
     .pipe(takeUntil(this._unsubscribeAll)).toPromise()
    .then(data => {
              var  jsondata:any = data;

               for (var i = 0; i < jsondata.length; i++) {


                if (jsondata[i].KeyValue == 'BankDetailsImg') {
                  this.ImageName = jsondata[i].Value;
              } else if (jsondata[i].KeyValue == 'Jurisdiction') {
                  this.Jurisdiction = jsondata[i].Value;
              } else if (jsondata[i].KeyValue == 'ImageSave') {
                this.strImageSave = jsondata[i].Value;
              }

    }

  }, error => console.error(error));

}
  async fnBillPrint() {

    const BillSerId = this.BillSerId;
    const BillNo = this.BillNo;
    const UniqueNo = this.UniqueNo;
    const BranchId = this.branchId;

    var ItemDescLen      = 30;
    var subtotal = 0;
    var taxamt = 0;
    await this.printService.onIssuePrint(BillSerId, BillNo,UniqueNo, BranchId, this.ApiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise()
    .then(data => {
      let jsonData:any = data;

     var JsonIssueSubDetailsInfo        = JSON.parse(jsonData.JsonIssueSubDetailsInfo);
     this.JsonIssueTaxInfo                = JSON.parse(jsonData.JsonIssueTaxInfo);
     this.JsonBranchInfo                 = JSON.parse(jsonData.JsonBranchInfo)[0];
     this.JsonIssueInfo                  = JSON.parse(jsonData.JsonIssueInfo)[0];
     this.IssueInfo = this.JsonIssueInfo;
     this.strBillNo   = this.JsonIssueInfo.BillSerPrefix + '-' + this.JsonIssueInfo.Issue_SlNo
     this.strBillDate = String(this.JsonIssueInfo.Issue_BillDate).split('-').reverse().join('/');
     let count   = 1;
     let dBillRowTotal = 0;
    if(this.JsonBranchInfo.ComImage !='') {

       if (this.strImageSave == 'ONLINE') {
          this.strLogoImageName = 'https://s3.ap-south-1.amazonaws.com/codeappsimageerp/' + this.JsonBranchInfo.ComImage;
       } else {
          // this.strLogoImageName = this.baseImageUrl+ '/ImagesUploaded/' + this.JsonBranchInfo.ComImage;
       }

    }

      // GrossValue=0,TotGrossValue=0,TotTaxAmt=0,NetValue=0,TotNetValue=0,TotQty=0,TotFQty=0;
      // TotAmtBeforeTax=0,TotSGstTotal=0,TotCGstTotal=0,TotIGstTotal=0,TotDisAmt=0;
      var dRatePlusTax = 0 ;

     JsonIssueSubDetailsInfo.forEach(element => {

        this.GrossValue = parseFloat(element.IssueSub_Qty) * parseFloat(element.IssueSub_ActualRate);
        this.TotGrossValue += this.GrossValue;
        this.TotTaxAmt += parseFloat(element.IssueSub_TaxAmt);
        this.NetValue = this.GrossValue - parseFloat(element.IssueSub_ProdDisAmt)
        this.TotNetValue += this.NetValue;
        this.TotQty += parseFloat(element.IssueSub_Qty);
        this.TotFQty += parseFloat(element.IssueSub_FreeQty);
        this.TotCessAmt += parseFloat(element.IssueSub_CessAmt);

        this.TotAmtBeforeTax += parseFloat(element.IssueSub_Qty) * parseFloat(element.IssueSub_ActualRate);
        dBillRowTotal = parseFloat(element.IssueSub_Amount) - parseFloat(element.IssueSub_CessAmt);
        this.dTotBillRowTotal += dBillRowTotal;
        this.TotSGstTotal     += parseFloat(element.IssueSub_SGSTTaxAmount);
        this.TotCGstTotal     += parseFloat(element.IssueSub_CGSTTaxAmount);
        this.TotIGstTotal     += parseFloat(element.IssueSub_IGSTTaxAmount);
        this.TotDisAmt        += parseFloat(element.IssueSub_ProdDisAmt);

        if(element.Color.length > 1 ) {
          element.ItemDesc = element.ItemDesc +' '+ String(element.Color);
        }

        dRatePlusTax = parseFloat(element.IssueSub_OriginalRate);

        if(element.Field2 != "Yes") {
          dRatePlusTax = dRatePlusTax + ( dRatePlusTax * parseFloat(element.IssueSub_TaxPers || 0) ) / 100;
        }

        this.JsonSub = { SlNo:count.toFixed(),ItemDesc:element.ItemDesc,HSNCode:element.HSNCode,
           IssueSub_TaxPers:parseInt(element.IssueSub_TaxPers).toFixed(),IssueSub_Qty:parseFloat(element.IssueSub_Qty).toFixed(3),
           IssueSub_OriginalRate: (dRatePlusTax).toFixed(2),
           CashDisc:parseFloat(element.IssueSub_ProdDisAmt).toFixed(2),GrossValue:(this.GrossValue).toFixed(2),
           Rate:parseFloat(element.IssueSub_ActualRate).toFixed(2),IssueSub_TaxAmt:parseFloat(element.IssueSub_TaxAmt).toFixed(2),
           RowTotal:dBillRowTotal.toFixed(2),IssueSub_Mrp:parseFloat(element.IssueSub_Mrp).toFixed(2)

          }

          this.JsonSubInfo.push(this.JsonSub);


        count = count + 1;

     });

     this.TotDisAmt += parseFloat(this.JsonIssueInfo.Issue_DisAmt);

     this.TotAfterDiscount = this.TotAmtBeforeTax -  this.TotDisAmt;
     var nRemainter = parseInt(<any>(this.JsonSubInfo.length % this.nNoOfItemPerPage));
     var nNoOfPage =  this.JsonSubInfo.length-nRemainter;
     nNoOfPage     =   nNoOfPage/ this.nNoOfItemPerPage;

     if(nRemainter>0){
        nNoOfPage  =   nNoOfPage  + 1;
     }

     var nStartNo = 0;
     var arr1:any;

     for( var i = 0;i<nNoOfPage;i++ ) {

        if( this.JsonSubInfo.length <= (i+1)*this.nNoOfItemPerPage ) {

          arr1 = this.JsonSubInfo.slice(nStartNo,this.JsonSubInfo.length);

        } else {

          arr1     = this.JsonSubInfo.slice(nStartNo,(i+1)*this.nNoOfItemPerPage);
          nStartNo = nStartNo+this.nNoOfItemPerPage;

        }

        this.JsonSub = { SlNo:'',ItemDesc:'',HSNCode:'',IssueSub_TaxPers:'',IssueSub_Qty:'',
        IssueSub_OriginalRate:'',CashDisc:'',GrossValue:'',Rate:'',IssueSub_TaxAmt:'',RowTotal:'',IssueSub_Mrp:'' }

         if(arr1.length < this.nNoOfItemPerPage) {

          for( var j = arr1.length;j<this.nNoOfItemPerPage;j++ ) {
            arr1.push(this.JsonSub);
          }

        }

        this.oArray.push(arr1);
     }
    // console.log(this.JsonIssueInfo.AmtInWords);

    // setTimeout(() => {
    //   window.print();
    // }, 100);

     // this.oArray.push(row);

     setTimeout(() => {
      this.cd.detectChanges();
      // console.log('detected');
    }, 100);
    }, error => console.error(error));

  }


  CalcColSpaces(strValue,  nPadLength) {
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
    // popupWinindow.document.write('<html><head><link rel="stylesheet/scss" type="text/css" href="fatimainvoiceprint.scss" /></head><body onload="window.print()">' + innerContents + '</html>');
    // popupWinindow.document.close();
    // return;
    setTimeout(() => {
      const content = document.getElementById('printer_content').innerHTML;
      const options: PrintOptions = {
        name: 'vansales',
        // printerId: 'printer008',
        duplex: false,
        // landscape: false,
        // grayscale: true
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
