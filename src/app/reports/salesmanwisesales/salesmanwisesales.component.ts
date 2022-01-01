import { Router } from '@angular/router';
import { Component, OnInit, Input } from '@angular/core';
import { Printer } from '@ionic-native/printer/ngx';
import {map, startWith, takeUntil} from 'rxjs/operators';
import { DocShareService } from 'src/app/printpage/components/print-share-pdf/doc-share.service';
import { AppService } from 'src/app/app.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-salesmanwisesales',
  templateUrl: './salesmanwisesales.component.html',
  styleUrls: ['./salesmanwisesales.component.scss']
})
export class SalesmanwisesalesComponent implements OnInit {
  today = new Date().toISOString();
  fromdate: any;
  Todate: any;
  baseApiUrl: string;
  BranchId: any;
  loginId: any;
  salesList: any;
  checked = false;
  tblReport: any;
  content: boolean;
  searchbar: boolean;
  tblHeader: any[] = [];
  searchList: any;
  valueSubmit: string;
  searchtblList: any;
  showCategory: boolean;
  private _unsubscribeAll: Subject<any>;
  
  constructor(
    private appService: AppService,
    private ctrlService: ControlService,
    private printer: Printer,
    private router: Router,
    public share: DocShareService,
  ) {

    
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
    this.showCategory = false;
  }
});
       
this.ctrlService.get('sessionInvenStaffId').then((val) => {
  if (val != null) {
    this.loginId = val;
    this.showCategory = true;
  }
});
    
this.ctrlService.get('sessionsurl').then((val) => {
  if (val != null) {
    this.baseApiUrl = val;
    this.fnSalesmanGets();
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

  fnSalesmanGets() {
    const ServiceParams = { strProc: '', oProcParams: [] };
    ServiceParams.strProc = 'SalesExecutive_GetsNew';

    const oProcParams = [];

    let ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'SalesExe_Name';
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
    .toPromise()
      .then(data => {
          this.salesList = JSON.parse(data);
          this.searchList = JSON.parse(data);
        },
        err => console.error(err)
      );
  }
  selectAll(eve) {
    if (eve.detail.checked) {
      this.salesList.map(data => (data.isChecked = true));
    } else {
      this.salesList.map(data => (data.isChecked = false));
    }
  }
  onBack() {
    if (this.content) {
       this.content = false;
    } else {
      this.router.navigate(['reports/report']);
    }
  }

  onSubmit(name) {
    this.valueSubmit = name;
    let SalesmanIds = '';
    let Count = 0;
    this.tblHeader = [];
    if (this.checked) {
      SalesmanIds = '';
    } else {
      if(this.salesList.legth == 0) return
      const dataChecked = this.salesList.filter(data => data.isChecked);
      if (dataChecked.length === 0 && this.showCategory) {
        alert('Choose Salesman');
        return;
      }

      dataChecked.forEach(element => {
        if (Count === 0) {
          SalesmanIds = '  and (Issue.SalesExeId= ' + element.AC_Id;
        } else {
          SalesmanIds += ' or Issue.SalesExeId= ' + element.AC_Id;
        }

        Count = Count + 1;
      });
      SalesmanIds += ' )';
    }

    if (!this.showCategory) {
      SalesmanIds = '';
    }

    // tslint:disable-next-line:prefer-const
    let ServiceParams = { strProc: '', JsonFileName: '', oProcParams: [] };

    if (name === 'Detailed') {
      ServiceParams.strProc = 'Issue_SalesmanwiseSalesNew';
    } else {
      ServiceParams.strProc = 'Issue_SalesmanwiseSalesConsole';
    }

    ServiceParams.JsonFileName = 'JsonArrayScriptOne';
    const oProcParams = [];

    let ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsFromDate';
    ProcParams.strArgmt = this.dateRect(this.fromdate);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsToDate';
    ProcParams.strArgmt = this.dateRect(this.Todate);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsSalesManId';
    ProcParams.strArgmt = SalesmanIds;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsBranchId';
    ProcParams.strArgmt = String(this.BranchId);
    oProcParams.push(ProcParams);

    ServiceParams.oProcParams = oProcParams;

    const body = JSON.stringify(ServiceParams);

    this.appService.fnApiPost(this.baseApiUrl + '/CommonQuery/fnGetDataReportFromScriptJsonFile', body)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise().then(data => {
        this.content = true;
        this.tblReport = JSON.parse(data.JsonDetails[0]);
        this.searchtblList = JSON.parse(data.JsonDetails[0]);
        if (this.tblReport.length > 0) {
          const columnsIn = this.tblReport[0];
          // tslint:disable-next-line: forin
          for (const key in columnsIn) {
               this.tblHeader.push(key);
          }
        } else {
            console.log('No columns');
        }
      }, err => console.error(err));
  }

  change(eve) {
    this.checked = false;
    eve.preventDefault();
    eve.stopPropagation();
  }

  dateRect(date) {
    const dates = date.split('/').reverse().join('-');
    return dates;
  }

  fnSearch(eve) {
    const keyword = eve.target.value;
    if (!this.content) {
      this.salesList = this.salesfilter(keyword);
    } else {
        this.tblReport = this._filter(keyword);
    }
    // console.log(AccountName SalesmanName);
  }
  private _filter(name: string): any[] {
    const filterValue = name.toLowerCase();
    if (this.valueSubmit === 'Summery') {
      return this.searchtblList.filter(option => option.SalesmanName.toLowerCase().indexOf(filterValue) === 0);
    } else if (this.valueSubmit === 'Detailed') {
      return this.searchtblList.filter(option => option.AccountName.toLowerCase().indexOf(filterValue) === 0);
    }
  }

  private salesfilter(name: string): any[] {
    const filterValue = name.toLowerCase();
    return this.searchList.filter(option => option.AC_Name.toLowerCase().indexOf(filterValue) === 0);
  }

  fnClose(eve) {
    this.searchbar = false;
    this.salesList = this.searchList;
    this.tblReport = this.searchtblList;
  }
  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
