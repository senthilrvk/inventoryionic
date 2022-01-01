import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { SalesPageService } from 'src/app/sales-billing/sales-page.service';
import { PrintSettings } from 'src/app/printpage/print-settings/print-settings.model';
import { PrinterService } from 'src/app/printpage/printer.service';

@Component({
  selector: 'app-inventry-list',
  templateUrl: './inventry-list.component.html',
  styleUrls: ['./inventry-list.component.scss'],
})
export class InventryListComponent implements OnInit {
  billSeriesJson: any[] = [];
  dataGetList: any[] = [];
  acId: any;
  branchId: any;
  apiUrl: any;
  dCopyBillSerId: any;
  loading: boolean;
  fromdate: any;
  Todate: any;
  searchkey:string = '';
  ncount = 5;
  thermalPrintOption: PrintSettings;
  private _unsubscribeAll: Subject<any>;
  public storage = new Storage()
  constructor(private modalController: ModalController,
    public toastCtrl: ToastController,
    private thermalPrint: PrinterService,
    private ctrlService: ControlService,
    private salesService: SalesPageService) {
      this.storage.create();
    this.storage.forEach((value, key) => {
      if (key == 'sessionInvenStaffId') {
        this.acId = value;
      } else if (key == 'sessionInvenBranchId') {
        this.branchId = value;
      } else if (key == 'sessionsurl') {
        this.apiUrl = value;
      } else if (key == 'printer') {
        this.thermalPrintOption = value;
      }

    }).finally(() => {
      this.fnBillSeries_Gets();
      const date: Date = new Date();
    date.setDate(1);
    this.fromdate = this.DateReverse(date.toISOString());
    const dates: Date = new Date();
    this.Todate = this.DateReverse(dates.toISOString());
    })
  }

  ngOnInit() {
    this._unsubscribeAll = new Subject();
    this.thermalPrint.onPrinterGet()
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(res => {
    this.thermalPrintOption = res;
    })

   }

  async fnBillSeries_Gets() {

    await this.salesService.onBillSeriesGets(this.acId, this.branchId, this.apiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(async data => {
        this.billSeriesJson = JSON.parse(data);
        let _params = this.billSeriesJson[0];
        this.dCopyBillSerId = _params.BillSerId;
      });
  }


   fnBillCopyChangeBillSeries(event) {

    this.dCopyBillSerId = event.detail.value;
    this.fnBillGets();
    // this.printFileName = this.BillSeriesJson.find(res => res.BillSerId == this.dCopyBillSerId).BillwithTIN;
  }

  fnBillGets() {
    const keyword =  this.searchkey
    this.loading = true;
    const isFromdate = this.fromdate;
    const isTodate = this.Todate;
    const StaffId = this.acId;
    const nBillSerId = this.dCopyBillSerId;

    let varArguements = {};
    varArguements = { BillNo: keyword, BillSerId: nBillSerId, FromDate: isFromdate, ToDate: isTodate, BranchId: this.branchId };

    this.salesService.onBillGets(varArguements, this.apiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        this.dataGetList = JSON.parse(data);
        this.loading = false;
      }, err => {
        this.fnBillGets();
        this.loading = false;
      });
  }



  async anchorClick(item, click) {

    this.loading = true;
    let objIssueInfo: any;
    let objIssueSubDetailsInfo: any;
    let objIssueTaxInfo: any;

    const varArguements = {
      BillSerId: item.BillSerId, BillNo: item.Issue_SlNo,
      UniqueNo: item.UniqueBillNo, BranchId: this.branchId
    };
    await this.salesService.onAnchorClick(varArguements, this.apiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise()
      .then(data => {
        const jsonobj = data;

        objIssueInfo = JSON.parse(jsonobj.JsonIssueInfo);
        objIssueSubDetailsInfo = JSON.parse(jsonobj.JsonIssueSubDetailsInfo);
        objIssueTaxInfo = jsonobj.JsonIssueTaxInfo;

        const params = objIssueInfo[0];
        let props = {
          Issue_SlNo:params.Issue_SlNo, BillSerId:params.BillSerId,  UniqueBillNo:params.UniqueBillNo
        }
        this.loading = false;

        if (click === 'anchor') {
          let props = {
            main: objIssueInfo[0],
            sub: objIssueSubDetailsInfo,
            tax: objIssueTaxInfo
          }
          this.modalController.dismiss(props)
        } else if (click === 'print') {
          this.fnPrintTable(props);
        }

      }, err => {
        const subs = setInterval(() => {
          let count = this.onCount();
          this.ncount = count;
      this.alertToast(`Server busy try again (${count})`);
       if (count == 0) {
        clearInterval(subs)
       }
        }, 1000);

      });
  }



  onCount() {
    return this.ncount - 1;
  }

  fnPrintTable(props) {
    // this.thermalPrintOption.btAddress = 'saf'
    // this.thermalPrintOption.arabic = true
    if (this.thermalPrintOption && this.thermalPrintOption.defaultPrint && this.thermalPrintOption.btAddress)
      this.thermalPrint.invoicePRint(props, this.branchId, this.apiUrl, this.thermalPrintOption);
    else
      this.alertToast('Printer is offline..')
}

  onDissmiss(event) {
    this.modalController.dismiss();
    event.preventDefault();
  }

  calenderPicker(val) {
    if (val === 'from') {
      this.ctrlService.onDatePicker(this.fromdate, val).then(
        date => {
          this.fromdate = this.dateFormat(date);
          this.fnBillGets();
        },
        err => console.log('Error occurred while getting date: ', err)
      );
    } else {
      this.ctrlService.onDatePicker(this.Todate, val).then(date => {
        this.Todate = this.dateFormat(date);
        this.fnBillGets();
      },
        err => console.log('Error occurred while getting date: ', err)
      );

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


  DateReverse(value) {
    const dateFormat = value.split('T');
    const date = dateFormat[0].split('-').reverse().join('/');
    return date;
  }

  async alertToast(msg: string) {
    const toast = await this.toastCtrl.create({
      message: msg,
      duration: 3000,
    });
    await toast.present();
  }

  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();

  }
}
