import { Router } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Printer } from '@ionic-native/printer/ngx';
import { Observable, of, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import {  ModalController, IonInput } from '@ionic/angular';
import { LoadingController } from '@ionic/angular';
import { OutstandingModalComponent } from './outstanding-modal/outstanding-modal.component';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import domtoimage from 'dom-to-image';
import jsPDF from 'jspdf';
import { AppService } from 'src/app/app.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';

@Component({
  selector: 'app-ledger',
  templateUrl: './ledger.component.html',
  styleUrls: ['./ledger.component.scss']
})
export class LedgerComponent implements OnInit {
  @ViewChild('lgrname',{static: false})  lgrnameElement: IonInput;
  searchbar: boolean;  content: boolean;  loading: any;
  today = new Date().toISOString();
  fromdate: any;  Todate: any;
  baseApiUrl: any;  loginId: any;
  BranchId: any;  acName: string;
  loding: boolean;  checkedAll: boolean;
  jsonAccountname: any[] = [];
  AcID: number;  dataRepTemp: any;
  eMail: any;
  private _unsubscribeAll: Subject<any>;
  constructor(private router: Router,
    public loadingController: LoadingController,private socialSharing: SocialSharing,
    private file: File,private appService: AppService,
    private ctrlService: ControlService, public modalController: ModalController) {
       
      this.ctrlService.get('sessionInvenBranchId').then((val) => {
        if (val != null) {
          this.BranchId = val;
        }
      });
    
      this.ctrlService.get('SessionBranchId').then((val) => {
        if (val != null) {
          this.BranchId = val;
        }
      });
    
      this.ctrlService.get('SessionSalesmanId').then((val) => {
        if (val != null) {
          this.loginId = val;
        }
      });
    
    
      this.ctrlService.get('sessionInvenStaffId').then((val) => {
        if (val != null) {
          this.loginId = val;
        }
      });
    
      this.ctrlService.get('sessionsurl').then((val) => {
        if (val != null) {
          this.baseApiUrl = val;
        }
      });
    
    
  }

  ngOnInit() {
    this._unsubscribeAll = new Subject();
    const date: Date = new Date();
    date.setDate(1);
    this.fromdate = this.DateReverse(date.toISOString());
    const dates: Date = new Date();
    this.Todate = this.DateReverse(dates.toISOString());
    this.checkedAll = true;
    this.AcID = 0;
    setTimeout(() => {
      this.lgrnameElement.setFocus();
    }, 400);
    
  }

  DateReverse(value) {
    const dateFormat = value.split('T');
    const date = dateFormat[0]
      .split('-')
      .reverse()
      .join('/');
    return date;
  }

  calenderPicker(val) {
    
    if (val === 'from') {
      this.ctrlService.onDatePicker(this.fromdate, val)
        .then(
          date => {
            this.fromdate = this.dateFormat(date);
          },
          err => console.log('Error occurred while getting date: ', err)
        );
    } else {
      this.ctrlService.onDatePicker(this.Todate, val)
        .then(
          date => {
            this.Todate = this.dateFormat(date);
          },
          err => console.log('Error occurred while getting date: ', err)
        );
    }
  }

  fnFindname() {

    this.OnAcName(this.acName).subscribe(data => {
      this.loding = true;
      this.jsonAccountname = data;
      this.loding = false;
    });

  }

  fnNameClick(element) {
    this.jsonAccountname = [];
    this.acName = element.AC_Name;
    this.eMail = element.Email;
    this.AcID = element.AC_Id;
    // AC_Id: 4214, AC_Name;   
  }

  OnAcName = (keyword: any): Observable<any[]> => {

    let ServiceParams = {};
    ServiceParams['strProc'] = 'AccountHead_SearchForLedger';
    ServiceParams['JsonFileName'] = 'JsonArrayScriptTwo';
    let oProcParams = [];

    let ProcParams = {};
    ProcParams['strKey'] = '@ParamsAC_Name';
    ProcParams['strArgmt'] = keyword;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = '@ParamsBranchId';
    ProcParams['strArgmt'] = String(this.BranchId);
    oProcParams.push(ProcParams);
    ServiceParams['oProcParams'] = oProcParams;

    let body = JSON.stringify(ServiceParams);

    if (keyword) {
      return this.appService.fnApiPost(this.baseApiUrl + '/CommonQuery/fnGetDataReportFromScriptJsonFile', body)
        .pipe(takeUntil(this._unsubscribeAll),map(res => {
          const json = res.JsonDetails;
          return JSON.parse(json);
        })
        );
    } else {
      this.loding = false;
      return of([]);
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

  fnClose(eve) {
    this.searchbar = false;

    // this.salesList = this.searchList;
    // this.tblReport = this.searchtblList;
  }

  async presentLoading(msg) {
    this.loading = await this.loadingController.create({
      message: msg,
      mode: "ios",
      backdropDismiss: true
    });
    return await this.loading.present();
  }


  async fnSharepage() {

    this.presentLoading('Creating PDF file...');
   
    const div = document.getElementById("printer_content");
      
    const options = { background: "white", height: div.clientWidth, width: div.clientHeight };
    
      domtoimage.toPng(div).then((dataUrl)=> {
       var doc = new jsPDF("p","mm","a4");
       doc.addImage(dataUrl, 'PNG', 5, 5, 0, 0);
       //Add image Url to PDF
       let pdfOutput = doc.output();
       let buffer = new ArrayBuffer(pdfOutput.length);
       let array = new Uint8Array(buffer);
       for (var i = 0; i < pdfOutput.length; i++) {
         array[i] = pdfOutput.charCodeAt(i);
       }   
      
       const directory = this.file.cacheDirectory ;
       const fileName = `ledgerReports.pdf`;
       let options: IWriteOptions = { replace: true };
 
       this.file.checkFile(directory, fileName).then((success)=> {
         //Writing File to Device
         this.file.writeFile(directory,fileName,buffer, options)
         .then((success)=> {
           
           this.loading.dismiss();
           console.log("File created Succesfully" + JSON.stringify(success));
           setTimeout(() => {
             this.socialSharing.share('ledgerReports', null, directory + fileName, null);
             
           });
           
         }).catch((error)=> {
           this.loading.dismiss();
           console.log("Cannot Create File " +JSON.stringify(error));
         });
       }).catch((error)=> {
         //Writing File to Device
         this.file.writeFile(directory,fileName,buffer)
         .then((success)=> {
           this.loading.dismiss();
           console.log("File created Succesfully" + JSON.stringify(success));
           setTimeout(() => {
             this.socialSharing.share('ledgerReports', null, directory + fileName, null);
           });
         }).catch((error)=> {
           
           this.loading.dismiss();
           console.log("Cannot Create File " +JSON.stringify(error));
         });
       });
     }).catch(function (error) {
       this.loading.dismiss();
       console.error('oops, something went wrong!', error);
     });
   
   }

   directMail() {
    const directory = this.file.cacheDirectory ;
    const fileName = `ledgerReports.pdf`;
    this.socialSharing.shareViaEmail('ledgerReports', null, this.eMail, null, null, directory + fileName)
   }
   
  async onclick() {
   

    let Book_FromDate = this.fromdate;
    let Book_ToDate = this.Todate;
  
    if (this.AcID == 0) {
      this.presentToast('Select AccountHead');
      return;
    }
  
    let ProcedureName = '';
    if (this.checkedAll) {
      ProcedureName = 'VoucherDetails_GetLeaderDetsilsFormatOne';
    } else {
      ProcedureName = 'VoucherDetails_GetLeaderDetsils';
    }
    
    var BranchName = '';

    var varArguements = {};
    varArguements = { FromDate: Book_FromDate, ToDate: Book_ToDate, AcId: this.AcID,
       bAllData: this.checkedAll, EntryHeadId: 0, 'strHeading': '',
        'strBranchName': BranchName, BranchId: this.BranchId,StaffId :0 };

    var DictionaryObject = {};
    DictionaryObject['dictArgmts'] = varArguements;
    DictionaryObject['ProcName'] = ProcedureName;

    let body = JSON.stringify(DictionaryObject);
    this.appService.fnApiPost(this.baseApiUrl + '/Accounts/fnLeader', body)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise()
    .then(data => {
      this.dataRepTemp = JSON.parse(data);
      this.content = true;
    }).catch((res) => {
      console.error(res)}
      );

  }

  onBack() {
    this.eMail = '';
    this.dataRepTemp = [];  
    if (this.content) {
      this.content = false;
      setTimeout(() => {
        this.lgrnameElement.setFocus();
      }, 400);
    } else {
      this.router.navigate(['reports/report']);
    }
    
  }

  fnSearch(eve) {

  }

  async presentToast(value) {
    this.ctrlService.presentToast('', value);
  }

  fnBillwiseOutstandingOnAcId() {

    var ServiceParams = {};
  
    ServiceParams['strProc'] = 'OutstandingSupplier_GetOnAcId';
  
    let oProcParams   = [];
    let ProcParams = {};
    ProcParams['strKey']   = 'AC_Id';
    ProcParams['strArgmt'] = String(this.AcID);
    oProcParams.push(ProcParams);
  
    ProcParams = {};
    ProcParams['strKey']   = 'BranchId';
    ProcParams['strArgmt'] =  String(this.BranchId);
    oProcParams.push(ProcParams);
  
    ServiceParams['oProcParams'] = oProcParams;
    let body = JSON.stringify(ServiceParams);
    this.appService.fnApiPost(this.baseApiUrl + '/CommonQuery/fnGetDataReportNew', body)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise().then(async data => {
     let jsonData = JSON.parse(data);
      const modal = await this.modalController.create({
        component: OutstandingModalComponent,
        mode: "ios",
        componentProps:  {item: jsonData}
      });
      return await modal.present();
    })
  }

  
ngOnDestroy(): void {

  this._unsubscribeAll.next();
  this._unsubscribeAll.complete();
}
}
