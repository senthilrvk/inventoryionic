import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { Observable, of, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import * as XLSX from 'xlsx';
import { File, IWriteOptions } from '@ionic-native/file/ngx';
import { ToastController, AlertController, ActionSheetController } from '@ionic/angular';
import { FileOpener } from '@ionic-native/file-opener/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AppService } from 'src/app/app.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';

@Component({
  selector: 'app-stockandsales',
  templateUrl: './stockandsales.component.html',
  styleUrls: ['./stockandsales.component.scss'],


})
export class StockandsalesComponent implements OnInit {
  searchbar: boolean;
  content: boolean;
  today = new Date().toISOString();
  fromdate: any;
  Todate: any;
  manufacture: string;
  nameToggle: string;
  BranchId: any;
  loginId: any;
  baseApiUrl: any;
  jsonManafacture: any[] = [];
  itemEnter: any;
  colHeaders = 'Manufacture_Name';
  loding: boolean;
  manafactureId: any;
  StockChecked = true;
  SalesChecked = true;
  RateChecked = true;
  tblHeader: any[] = [];
  tblreport: any;
  searchtblList: any;
  strSoftwareName: any;
  bBranchStockNotification = false;
  private _unsubscribeAll: Subject<any>;
  constructor(private router: Router,
    public file: File,
    public printer: Printer,
    private fileOpener: FileOpener,
    public alertController: AlertController,
    private socialSharing: SocialSharing,
    private appService: AppService,
    private ctrlService: ControlService,
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
        this.fnSettings();
      }
    });


  }

  ngOnInit() {
    this._unsubscribeAll = new Subject();
    this.manafactureId = 0;
    this.nameToggle = 'Manufacture';
    const date: Date = new Date();
    date.setDate(1);
    this.fromdate = this.DateReverse(date.toISOString());
    const dates: Date = new Date();
    this.Todate = this.DateReverse(dates.toISOString());
  }

  fntoggle(eve) {
    this.manufacture = '';
    if (eve.detail.checked) {
      this.nameToggle = 'ManufactureGroup';
      this.colHeaders = 'CategoryDesc';
    } else {
      this.nameToggle = 'Manufacture';
      this.colHeaders = 'Manufacture_Name';
    }
  }
  fnSettings() {
    const dictArgmts = { ProcName: 'Settings_GetValues' };
    const body = JSON.stringify(dictArgmts);
    this.appService.fnApiPost(this.baseApiUrl + '/Master/fnSettings', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(result => {
        const settings = result;
        settings.forEach(ele => {
          if (ele.KeyValue == 'DecimalPlace') {
            // $('#txtDecimalPlaces').val(ele.Value);
          } else if (ele.KeyValue === 'ReportPrintType') {
            // $('#txtReportPrintType').val(ele.Value);
          } else if (ele.KeyValue === 'ProductName') {
            this.strSoftwareName = ele.Value;
          } else if (ele.KeyValue === 'BranchStockNotification') {
            if (ele.Value === 'Yes') {
              this.bBranchStockNotification = true;
            }
          }
        });
      })
  }
  fnGroupSearch = (keyword: any): Observable<any[]> => {
    let varArguements = {};
    varArguements = { Manufacture_Name: keyword };

    const DictionaryObject = { dictArgmts: {}, ProcName: '' };
    DictionaryObject.dictArgmts = varArguements;
    DictionaryObject.ProcName = 'Manufacture_Gets';

    const body = JSON.stringify(DictionaryObject);

    if (keyword) {
      return this.appService.fnApiPost(this.baseApiUrl + '/Master/Manufacture_Gets', body)
        .pipe(
          takeUntil(this._unsubscribeAll),
          map(res => {
            const json = res;
            return json;
          })
        );
    } else {
      return of([]);
    }
  }

  fnManafactureGroup = (keyword: any): Observable<any[]> => {
    const ServiceParams = { strProc: '', oProcParams: [] };
    ServiceParams.strProc = 'Category_GetOnTypeIdForShop';

    const oProcParams = [];

    let ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'Search';
    ProcParams.strArgmt = keyword;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'CategoryType';
    ProcParams.strArgmt = '16';
    oProcParams.push(ProcParams);
    ServiceParams.oProcParams = oProcParams;

    const body = JSON.stringify(ServiceParams);
    if (keyword) {
      return this.appService.fnApiPost(this.baseApiUrl + '/CommonQuery/fnGetDataReportNew', body)
        .pipe(
          takeUntil(this._unsubscribeAll),
          map(res => {
            const json = JSON.parse(res);
            return json;
          })
        );
    } else {
      return of([]);
    }
  }
  DateReverse(value) {
    const dateFormat = value.split('T');
    const date = dateFormat[0]
      .split('-')
      .reverse()
      .join('/');
    return date;
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
  onBack() {
    if (this.content) {
      this.content = false;
    } else {
      this.router.navigate(['reports/report']);
    }
  }
  dateRect(date) {
    const dates = date.split('/').reverse().join('-');
    return dates;
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

  fnSearch(eve) {
    const keyword = eve.target.value;
    this.tblreport = this._filter(keyword);
  }

  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.searchtblList.filter(option => option.ProductName.toLowerCase().indexOf(filterValue) === 0);
  }
  fnClose(event) {
    this.searchbar = false;
    this.tblreport = this.searchtblList;
  }

  fnManufactureSearch(event) {
    if (this.nameToggle === 'Manufacture') {
      this.fnGroupSearch(event.target.value)
      .pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {
        this.loding = true;
        this.jsonManafacture = data;
        this.loding = false;
      });
    } else {
      this.fnManafactureGroup(event.target.value)
      .pipe(takeUntil(this._unsubscribeAll)).subscribe(data => {
        this.loding = true;
        this.jsonManafacture = data;
        this.loding = false;
      });
    }

  }

  fnManafactureClick(element) {
    this.jsonManafacture = [];
    this.itemEnter = element;
    if (this.nameToggle === 'Manufacture') {
      this.manafactureId = element.Manufacture_Id;
      this.manufacture = element.Manufacture_Name;
    } else if (this.nameToggle === 'ManufactureGroup') {
      this.manafactureId = element.CategoryID;
      this.manufacture = element.CategoryDesc;
    }
  }

  fnReport() {
    this.tblHeader = [];
    let dManufactureId = 0;
    dManufactureId = this.manafactureId;

    const ServiceParams = { strProc: '', oProcParams: [] };
    ServiceParams.strProc = 'StockAndSalesReportNew';
    const oProcParams = [];

    let tblStockName = '',
      tblStoreName = '';

    const BillDate1 = this.dateRect(this.fromdate).split('-');
    // var BillDate1=11;
    let FromMM = 0;
    FromMM = parseFloat(BillDate1[1]) || 0;
    let FromYYYY = 0;
    FromYYYY = parseFloat(BillDate1[0]) || 0;

    if (FromMM === 1) {
      tblStockName = 'Stock' + 12 + (FromYYYY - 1);
      tblStoreName = 'Store' + 12 + (FromYYYY - 1);
    } else {
      tblStockName = 'Stock' + (FromMM - 1) + FromYYYY;
      tblStoreName = 'Store' + (FromMM - 1) + FromYYYY;
    }

    let ProcParams = { strKey: '', strArgmt: '' };

    if (this.nameToggle === 'Manufacture') {
      ProcParams = { strKey: '', strArgmt: '' };
      ProcParams.strKey = 'Type';
      ProcParams.strArgmt = 'Companywise';
      oProcParams.push(ProcParams);
    }

    if (this.nameToggle === 'ManufactureGroup') {
      ProcParams = { strKey: '', strArgmt: '' };
      ProcParams.strKey = 'Type';
      ProcParams.strArgmt = 'Groupwise';
      oProcParams.push(ProcParams);
    }

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'FromDate';
    ProcParams.strArgmt = this.dateRect(this.fromdate);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'ToDate';
    ProcParams.strArgmt = this.dateRect(this.Todate);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'Ids';
    ProcParams.strArgmt = dManufactureId.toString();
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'tblStockName';
    ProcParams.strArgmt = tblStockName;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'tblStoreName';
    ProcParams.strArgmt = tblStoreName;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'AddTaxStock';
    ProcParams.strArgmt = '';
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'BranchId';
    ProcParams.strArgmt = String(this.BranchId);
    oProcParams.push(ProcParams);

    ServiceParams.oProcParams = oProcParams;

    const body = JSON.stringify(ServiceParams);

    this.appService.fnApiPost(this.baseApiUrl + '/CommonQuery/fnGetDataReportNew', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        this.tblreport = JSON.parse(data);
        this.searchtblList = this.tblreport;

        // tslint:disable-next-line:forin
        for (const iterator of this.tblreport) {
          delete iterator.ProdId;
          delete iterator.ComId;
          delete iterator.CompanyName;
          delete iterator.BranchName;
          delete iterator.CityName;
          delete iterator.StateName;
          delete iterator.PrintFrom;
          if (this.strSoftwareName === 'WholeSalePharma' || this.strSoftwareName === 'RetailPharma' ||
            !this.bBranchStockNotification) {
            delete iterator.ST;
            delete iterator.STIn;
            delete iterator.STRetIn;
            delete iterator.StRout;
          }
          if (this.strSoftwareName === 'WholeSalePharma') {
            delete iterator.F8Key;
          }
          if (!this.StockChecked) {
            delete iterator.StockValue;
            delete iterator.StockValueGST;
          }
          if (!this.SalesChecked) {
            delete iterator.SaleValue;
          }
          if (!this.RateChecked) {
            delete iterator.PRate;
          }
        }
        const columnsIn = this.tblreport[0];
        // tslint:disable-next-line:forin
        for (const key in columnsIn) {
          this.tblHeader.push(key);
        }
        this.content = true;
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
    const sheet = XLSX.utils.json_to_sheet(this.tblreport);
    const book = {
      SheetNames: ['stockandSales'],
      Sheets: {
        'stockandSales': sheet
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
    const fileName = `stockandSales${new Date().getTime()}.xlsx`;
    this.getStoragePath().then((url) => {
      self.file.writeFile(url, fileName, blob, options).then(() => {

        this.shareFiles(`${url}${fileName}`);
        this.presentToast('Export SuccessFully!');
      }).catch(() => {
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
      name: 'StockAndSales',
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
  async presentToast(value) {
    this.ctrlService.presentToast('', value);
  }


  async shareFiles(path) {
    const alert = await this.alertController.create({
      header: 'Confirm',
      mode: "ios",
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
            this.socialSharing.share('Report', 'StockAndSales', path, '');
          }
        }
      ]
    });

    await alert.present();
  }


  async fnExport() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Export',
      mode: "ios",
      buttons: [{
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
