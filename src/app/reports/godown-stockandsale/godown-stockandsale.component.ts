
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { AppService } from 'src/app/app.service';
import * as XLSX from 'xlsx';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { DocShareService } from 'src/app/printpage/components/print-share-pdf/doc-share.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-godown-stockandsale',
  templateUrl: './godown-stockandsale.component.html',
  styleUrls: ['./godown-stockandsale.component.scss'],
})
export class GodownStockandsaleComponent implements OnInit {
  today = new Date().toISOString();
  fromdate: any;
  Todate: any;
  searchbar: boolean = false;
  content: boolean = false;
  BranchId: string = '';
  loginId: string = '';
  baseApiUrl: string = '';
  GodownList: any;
  searchtblList: any[] = [];
  dynamicColumns: any[] = [];
  dataRep: any[] = [];
  dGodownId: number = 0;
  private _unsubscribeAll: Subject<any>;
  constructor(
    private appservice: AppService, private router: Router,
    public actionSheetController: ActionSheetController,
    public file: File,
    public printer: Printer,
    private fileOpener: FileOpener,
    private sharePDF: DocShareService,
    public alertController: AlertController,
    private socialSharing: SocialSharing,
    private ctrlService: ControlService) {

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
        this.fnGodownGets();
      }
    });



  }

  ngOnInit() {
    const dates: Date = new Date();
    this.fromdate = this.DateReverse(dates.toISOString());
    this.Todate = this.DateReverse(dates.toISOString());
    this._unsubscribeAll = new Subject();
  }


  DateReverse(value) {
    const dateFormat = value.split('T');
    const date = dateFormat[0].split('-').reverse().join('/');
    return date;
  }

  async fnExport() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Export',
      mode:"ios",
      buttons: [{
        text: 'Print',
        icon: 'print',
        handler: () => {
          this.fnPrint();
        }
      }, {
        text: 'PDF',
        icon: 'share',
        handler: () => {
          this.sharePDF.fnSharepage('tblPrint', 'stockandsales');
        }
      },
      {
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
      this.presentToast('print SuccessFully!!!');
    }).catch(() => {
      this.presentToast('print Error!!');
    });

  }

  fnExcelExport = () => {
    const sheet = XLSX.utils.json_to_sheet(this.dataRep);
    const book = {
      SheetNames: ['GodownStockAndSalesReport'],
      Sheets: {
        'GodownStockAndSalesReport': sheet
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

    const blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' });
    const self = this;
    const options: IWriteOptions = { replace: true };
    const fileName = `GodownStockAndSalesReport${new Date().getTime()}.xlsx`;
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
            this.socialSharing.share('Report', ' GodownStockAndSalesReport', path, '');
          }
        }
      ]
    });

    await alert.present();
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

  onBack() {
    if (this.content) {
      this.content = false;
    } else {
      this.router.navigate(['reports/report']);
    }
  }

  calenderPicker(val) {
    if (val === 'from') {
      this.ctrlService.onDatePicker(this.fromdate, val)
        .then(date => {
          this.fromdate = this.dateFormat(date);
        });
    } else {
      this.ctrlService.onDatePicker(this.Todate, val)
        .then(date => {
          this.fromdate = this.dateFormat(date);
        })
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

  fnGodownGets() {

    let ServiceParams = {};
    ServiceParams['strProc'] = 'Godown_Gets';

    let oProcParams = [];

    let ProcParams = {};
    ProcParams['strKey'] = 'Search';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'BranchId';
    ProcParams['strArgmt'] = String(this.BranchId);
    oProcParams.push(ProcParams);
    ServiceParams['oProcParams'] = oProcParams;

    let body = JSON.stringify(ServiceParams)
    this.appservice.fnApiPost(this.baseApiUrl + '/CommonQuery/fnGetDataReportNew', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.GodownList = JSON.parse(res);

      })
  }


  fnClose(eve) {
    this.searchbar = false;
  }


  fnSearch(eve) {
    const keyword = eve.target.value;

    this.dataRep = this._filter(keyword);
  }

  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.searchtblList.filter(option => option.ProductName.toLowerCase().indexOf(filterValue) === 0);
  }

  fnGetReport() {
   
    let Book_FromDate = dateReverse(this.fromdate);
    let Book_ToDate = dateReverse(this.Todate);
    if (this.dGodownId == 0) {
      this.presentToast('choose vechicle number!!');
      return
    }

    let ServiceParams = {};
    ServiceParams['strProc'] = 'GodownwiseStockAndSales';
    ServiceParams['JsonFileName'] = 'JsonArrayScriptFive';
    let oProcParams = [];

    let ProcParams = {};
    ProcParams['strKey'] = '@ParamsFromDate';
    ProcParams['strArgmt'] = Book_FromDate;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = '@ParamsToDate';
    ProcParams['strArgmt'] = Book_ToDate;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = '@ParamsBranchId';
    ProcParams['strArgmt'] = String(this.BranchId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = '@ParamsGodownId';
    ProcParams['strArgmt'] = String(this.dGodownId);
    oProcParams.push(ProcParams);

    ServiceParams['oProcParams'] = oProcParams;
    let body = JSON.stringify(ServiceParams)
    
    
    this.appservice.fnApiPost(this.baseApiUrl + '/CommonQuery/fnGetDataReportFromScriptJsonFile', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        let jsonData = JSON.parse(data.JsonDetails[0]);
        if (jsonData && jsonData.length) {
          this.dataRep = jsonData;

          this.searchtblList = jsonData;
          let columsHeader = [];
          let columnsIn = jsonData[0];
          for (var key in columnsIn) {
            columsHeader.push(key)
          }
          this.dynamicColumns = columsHeader

          this.content = true;
        }

      })
  }
  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}

function dateReverse(date) {
  return date.split('/').reverse().join('/');
}
