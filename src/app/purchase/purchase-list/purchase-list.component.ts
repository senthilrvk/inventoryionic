import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { PurchasePageService } from '../purchase.service';

@Component({
  selector: 'app-purchase-list',
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.scss'],
})
export class PurchaseListComponent implements OnInit {
  today = new Date().toISOString();
  fromdate: any;
  todate: any;
  billSeries: any[] = [];
  public storages = { staffId: '', branchId: '', branchName: '', apiUrl: '' }
  private _unSubscribeAll = new Subject();
  billSerId: any;
  dataGetList: any;
  loading:boolean;
  search:string = "";

  constructor(private _purchaseService: PurchasePageService,private ctrlService: ControlService) { }

  ngOnInit() {
    const date: Date = new Date();
    date.setDate(1);
    this.fromdate = this.DateReverse(date.toISOString());
    const dates: Date = new Date();
    this.todate = this.DateReverse(dates.toISOString());

    this.ctrlService.storage.forEach((val, key) => {
      switch (key) {
        case 'sessionInvenStaffId':
          this.storages.staffId = val;
          break;
        case 'sessionInvenBranchId':
          this.storages.branchId = val;
          break;
        case 'sessionBranchName':
          this.storages.branchName = val;
          break;

        case 'sessionsurl':
          this.storages.apiUrl = val;
          break;
        default:
          break;
      }
    }).finally(() => {
      this.fnBillSeriesGet()
    })
  }


  calenderPicker(date, val) {

    this.ctrlService.onDatePicker(date, val).then(
      date => {
        if (val == "from")
          this.fromdate = this.dateFormat(date);
        if (val == "to")
          this.todate = this.dateFormat(date);
      },
      err => console.log('Error occurred while getting date: ', err)
    );

  }

  dateReverse(value) {
    const dateFormat = value.split('T');
    const date = dateFormat[0].split('-').reverse().join('/');
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

  DateReverse(value) {
    const dateFormat = value.split('T');
    const date = dateFormat[0].split('-').reverse().join('/');
    return date;
  }

  fnBillSeriesGet() {
    this._purchaseService.onBillSeries_Gets(this.storages)
      .pipe(takeUntil(this._unSubscribeAll))
      .subscribe(res => {
        this.billSeries = JSON.parse(res);
        this.billSerId = parseFloat(this.billSeries[0].PurBillSerId || 0);
      })
  }


  fnPurchaseGets() {
    const isFromdate = this.fromdate.split('/').reverse().join('-');
    const isTodate = this.todate.split('/').reverse().join('-');
     this._purchaseService.onPurchaseGets(this.search, isFromdate, isTodate, this.billSerId, this.storages)
      .toPromise().then(res => {
        let jsonData = res;
        this.dataGetList = JSON.parse(jsonData);


      });
  }

  anchorClick(row, value) {

  }

  ngOnDestroy() {
    this._unSubscribeAll.next();
    this._unSubscribeAll.unsubscribe();
  }
}
