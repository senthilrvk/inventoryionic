import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import { ToastController, AlertController, ActionSheetController } from '@ionic/angular';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { AppService } from 'src/app/app.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-customerremarks',
  templateUrl: './customerremarks.component.html',
  styleUrls: ['./customerremarks.component.scss'],
 
})
export class CustomerremarksComponent implements OnInit {
  searchbar: boolean;
  tblReport: any[];
  searchtblList: any;
  content: boolean;
  today = new Date().toISOString();
  fromdate: any;
  Todate: any;
  BranchId: any;
  loginId: any;
  baseApiUrl: any;
  loading: boolean;
  private _unsubscribeAll: Subject<any>;
  constructor(
    private appService: AppService,
    private ctrlService: ControlService,
    private router: Router,
    public file: File,
    public printer: Printer,
    private fileOpener: FileOpener,
   
    public alertController: AlertController,
    private socialSharing: SocialSharing,
    public actionSheetController: ActionSheetController) { 
    
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
    const date: Date = new Date();
    date.setDate(1);
    this.fromdate = this.DateReverse(date.toISOString());
    const dates: Date = new Date();
    this.Todate = this.DateReverse(dates.toISOString());
    this._unsubscribeAll = new Subject();
  }

  DateReverse(value) {
    const dateFormat = value.split('T');
    const date = dateFormat[0].split('-').reverse().join('/');
    return date;
  }

  onBack() {
    if (this.content) {
       this.content = false;
       this.loading = false;
    } else {
      this.router.navigate(['reports/report']);
    }
  }

  fnSearch(eve) {
    const keyword = eve.target.value;
    this.tblReport = this._filter(keyword);
    // console.log(AccountName SalesmanName);
  }

  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.searchtblList.filter(option => option.CustomerName.toLowerCase().indexOf(filterValue) === 0);
  }

  fnClose(eve) {
    this.searchbar = false;
    
  }

  calenderPicker(val) {
    if (val === 'from') {
      this.ctrlService.onDatePicker(this.fromdate, val)
     .then(date => {
            this.fromdate = this.dateFormat(date);
          }, err => console.log('Error occurred while getting date: ', err));
    } else {
      this.ctrlService.onDatePicker(this.Todate, val).then(date => {
            this.Todate = this.dateFormat(date);
          }, err => console.log('Error occurred while getting date: ', err));
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
  dateRect(date) {
    const dates = date.split('/').reverse().join('-');
    return dates;
  }

  fnUserLoginReport() {
    this.loading = true;
    let ServiceParams = {};
    ServiceParams['strProc'] = 'CustomerRouteRemarks_GetsFromSalesmanwise';
    ServiceParams['JsonFileName'] = 'JsonArrayScriptTwo';

    let oProcParams = [];

    let ProcParams        = {};
    ProcParams['strKey']   = '@ParamsFromDate';
    ProcParams['strArgmt'] =  this.dateRect(this.fromdate);
    oProcParams.push(ProcParams);

    ProcParams             = {};
    ProcParams['strKey']   = '@ParamsToDate';
    ProcParams['strArgmt'] = this.dateRect(this.Todate);
    oProcParams.push(ProcParams);

    ProcParams             = {};
    ProcParams['strKey']   = '@ParamsBranchId';
    ProcParams['strArgmt'] = String(this.BranchId);
    oProcParams.push(ProcParams);    

    ProcParams             = {};
    ProcParams['strKey']   = '@ParamsSalesmanId';
    ProcParams['strArgmt'] = String(this.loginId);
    oProcParams.push(ProcParams);  
    

    ServiceParams['oProcParams'] = oProcParams;

    let body = JSON.stringify(ServiceParams);

    var headers = new Headers();
    headers.append('Content-Type', 'application/json; charset=utf-8');
    this.appService.fnApiPost(`${this.baseApiUrl}/CommonQuery/fnGetDataReportFromScriptJsonFile`, body)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(data => {
      var dataRep = JSON.parse(data.JsonDetails[0]);
      this.loading = false;
      this.content = true;
      this.tblReport = dataRep;
      this.searchtblList = dataRep;
      
    }, err => console.error(err));
  }




  getStoragePath() {
    const file = this.file;
    return this.file.resolveDirectoryUrl(this.file.externalRootDirectory).then((directoryEntry) => {
        return file.getDirectory(directoryEntry, 'CodeAppsExcel', {
            create: true,
            exclusive: false
        }).then(() => {
            return directoryEntry.nativeURL + 'CodeAppsExcel/';
        });
    });
}

fnExcelExport = () => {
const sheet = XLSX.utils.json_to_sheet(this.tblReport);
const book = {
  SheetNames: ['customerRemark'],
  Sheets: {
      'customerRemark': sheet
  }
};

const wbout = XLSX.write(book, {
bookType: 'xlsx',
bookSST: false,
type: 'binary'
});

function s2ab(s) {
const buf = new ArrayBuffer(s.length);
const view = new Uint8Array(buf);
for (let i = 0; i !== s.length; ++i) { view[i] = s.charCodeAt(i) & 0xFF; }
return buf;
}

const blob = new Blob([s2ab(wbout)], {type: 'application/octet-stream'});
const self = this;
const options: IWriteOptions = { replace: true };
const fileName = `CustomerRemark${new Date().getTime()}.xlsx`;
this.getStoragePath().then((url) => {
        self.file.writeFile(url, fileName, blob, options).then(() => {
            // alert('file created at: ' + url);
        this.shareFiles(`${url}${fileName}`);
        // this.shareFiles.share('CSV file export', 'CSV export', stuff['nativeURL'], '');
        this.presentToast('Export SuccessFully!');
        }).catch(() => {
            // alert('error creating file at :' + url);
            this.presentToast('Export Replaced SuccessFully!');
        });
    });
}

fnPrint() {
// this.printer.isAvailable().then(() => {
//   this.presentToast('print avilable' );
// }).catch(() => {
//   this.presentToast('print notAvilable' );
// });
let options: PrintOptions = {
 name: 'CustomerRemark',
 duplex: false,
 orientation: 'portrait',
};

const content = document.getElementById('tblPrint').innerHTML;
this.printer.print(content, options).then(() => {
  this.presentToast('print SuccessFully!!!' );
}).catch(() => {
  this.presentToast('print Error!!' );
});

}
async presentToast(value) {
  this.ctrlService.presentToast('', value);
}


async shareFiles(path) {
const alert = await this.alertController.create({
  header: 'Confirm',
  mode:"ios",
  message: 'Do You want<strong> share this file.</strong>',
  buttons: [
    {
      text: 'Cancel',
      role: 'cancel',
      cssClass: 'secondary',
      handler: (blah) => {
        this.fileOpener.open(path, 'application/xlsx')
          .then(() => console.log('File is opened'))
          .catch(e => console.log('Error opening file', e));
      }
    }, {
      text: 'share',
      handler: () => {
        this.socialSharing.share('Report', 'CustomerRemark', path, '');
      }
    }
  ]
});

await alert.present();
}


async fnExport() {
const actionSheet = await this.actionSheetController.create({
  header: 'Export',
  mode:"ios",
  buttons: [ {
    text: 'Print',
    icon: 'print',
    handler: () => {
      this.fnPrint();
    }
  }, {
    text: 'Excel',
    icon: 'download',
    handler: () => {
      this.fnExcelExport();
    }
  }, {
    text: 'Cancel',
    icon: 'close',
    role: 'cancel',
    handler: () => {
      console.log('Cancel clicked');
    }
  }]
});
await actionSheet.present();
}


ngOnDestroy(): void {

  this._unsubscribeAll.next();
  this._unsubscribeAll.complete();
}

}
