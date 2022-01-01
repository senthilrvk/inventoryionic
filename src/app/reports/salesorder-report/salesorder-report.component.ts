import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Printer } from '@ionic-native/printer/ngx';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { DocShareService } from 'src/app/printpage/components/print-share-pdf/doc-share.service';

@Component({
  selector: 'app-salesorder-report',
  templateUrl: './salesorder-report.component.html',
  styleUrls: ['./salesorder-report.component.scss'],
})
export class SalesorderReportComponent implements OnInit {
  today = new Date().toISOString();
  fromdate: any;
  Todate: any;
  baseApiUrl: string;
  BranchId: any;
  loginId: any;
  tblReport: any;
  content: boolean;
  options = 'PendingList';
  tblHeader = [];
  private _unsubscribeAll: Subject<any>;
  constructor(private appService: AppService,
    private ctrlService: ControlService,
    private printer: Printer,
    private router: Router,
    public share: DocShareService) {

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

  calenderPicker(val) {
    if (val === 'from') {
      this.ctrlService.onDatePicker(this.fromdate, val).then(
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


  onBack() {
    if (this.content) {
      this.content = false;
    } else {
      this.router.navigate(['reports/report']);
    }
  }


  onSubmit() {
    if (this.options == 'PendingList') {
      this.fnSalesOrderPendingList();
    } else if (this.options == 'SalesmanProductSummary') {
      this.fnSalesOrderSalesmanwiseProductSummary();
    }
  }

  dateRect(date) {
    const dates = date.split('/').reverse().join('-');
    return dates;
  }


  fnSalesOrderPendingList() {

    let strSalesmanIds = `  and (AccountHead.Ac_Id = ${this.loginId})`;
    let ServiceParams = {};
    ServiceParams['strProc'] = 'SalesOrderPendingList';
    ServiceParams['JsonFileName'] = 'JsonArrayScriptThree';

    let oProcParams = [];
    let ProcParams = {};

    ProcParams = {};
    ProcParams['strKey'] = '@ParamsBranchId';
    ProcParams['strArgmt'] = String(this.BranchId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = '@ParamsFromDate';
    ProcParams['strArgmt'] = this.dateRect(this.fromdate);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = '@ParamsToDate';
    ProcParams['strArgmt'] = this.dateRect(this.Todate);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = '@ParamsSalesmanIds';
    ProcParams['strArgmt'] = strSalesmanIds;
    oProcParams.push(ProcParams);

    ServiceParams['oProcParams'] = oProcParams;

    let body = JSON.stringify(ServiceParams);
    this.appService.fnApiPost(this.baseApiUrl + '/CommonQuery/fnGetDataReportFromScriptJsonFile', body)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise()
      .then(data => {
        const jsonData = JSON.parse(data.JsonDetails[0]);
        this.content = true;
        this.tblReport = jsonData;
        if (this.tblReport.length > 0) {
          const columnsIn = this.tblReport[0];
          for (const key in columnsIn) {
               this.tblHeader.push(key);
          }
        }
      })
  }

  fnSalesOrderSalesmanwiseProductSummary() {
    let strSalesmanIds = `  and (AccountHead.Ac_Id = ${this.loginId})`;
    
    let ServiceParams = {};
    ServiceParams['strProc'] = 'SalesOrderSalesmanProductwiseSummary';
    ServiceParams['JsonFileName'] = 'JsonArrayScriptThree';

    let oProcParams = [];
    let ProcParams = {};

    ProcParams = {};
    ProcParams['strKey'] = '@ParamsBranchId';
    ProcParams['strArgmt'] = String(this.BranchId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = '@ParamsFromDate';
    ProcParams['strArgmt'] = this.dateRect(this.fromdate);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = '@ParamsToDate';
    ProcParams['strArgmt'] = this.dateRect(this.Todate);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = '@ParamsSalesmanIds';
    ProcParams['strArgmt'] = strSalesmanIds;
    oProcParams.push(ProcParams);

    ServiceParams['oProcParams'] = oProcParams;

    let body = JSON.stringify(ServiceParams);
   
    this.appService.fnApiPost(this.baseApiUrl + '/CommonQuery/fnGetDataReportFromScriptJsonFile', body)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise().then(data => {
        const jsonData = JSON.parse(data.JsonDetails[0]);
       
        this.content = true;
        this.tblReport = jsonData;
        if (this.tblReport.length > 0) {
          const columnsIn = this.tblReport[0];
          for (const key in columnsIn) {
               this.tblHeader.push(key);
          }
        }
      })
   }

   
ngOnDestroy(): void {

  this._unsubscribeAll.next();
  this._unsubscribeAll.complete();
}
}
