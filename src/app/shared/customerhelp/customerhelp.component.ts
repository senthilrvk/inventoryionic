import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { SMS } from '@ionic-native/sms/ngx';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';

export interface SearchNames {
  AC_Id: string;
  AC_Name: string;
  Addr1: string;
  Addr2: string;
}

@Component({
  selector: 'app-customerhelp',
  templateUrl: './customerhelp.component.html',
  styleUrls: ['./customerhelp.component.scss'],
  providers: [SMS]
})
export class CustomerhelpComponent implements OnInit {
  baseUrl: any;
  branchId: any;
  CusNamejson: any[] = [];
  filteredNames: any[] = [];
  txtCusname = '';
  AcId: string;
  loading = true;
  txtremerks: string;
  cusRemark: any;
  filteredRemark: any[] = [];
  salesManId: any;
  private _unsubscribeAll: Subject<any>;
  private storage = new Storage();
  constructor(private modalpage: ModalController, private _appService: AppService,
               public ctrlService: ControlService, private sms: SMS) {
                 this.storage.create()
    this.storage.forEach((value, key) => {
    switch (key) {
      case 'sessionsurl':
        this.baseUrl = value;
      break;
      case 'SessionSalesmanId':
        this.salesManId = value;
      break;

      case 'SessionBranchId':
        this.branchId = value;
      break;

      case 'sessionInvenStaffId':
        this.salesManId = value;
      break;

      case 'sessionInvenBranchId':
        this.branchId = value;
      break;

      default:
        break;
    }

    }).finally(() => {
      this.AccountHeadSearch();
    });

  }

  ngOnInit() {
    this.AcId = '0';
    this.txtremerks = '';
    this._unsubscribeAll = new Subject();
  }

  onKey_customer(event) {
    const filterValue = event.target.value;
    this.filteredNames = this._filterNames(filterValue);
    // console.log(this.filteredNames);
  }

  onKey_remark(event) {
    const filterValue = event.target.value;
    if (filterValue === '') {
      this.filteredRemark = [];
      return;
    }
    this.filteredRemark = this._filterRemarks(filterValue);
  }
  private _filterNames(value: string): SearchNames[] {
    const filterValue = value.toLowerCase();

    return this.CusNamejson.filter(search => search.AC_Name.toLowerCase().indexOf(filterValue) === 0);
  }

  private _filterRemarks(value: string): SearchNames[] {
    const filterValue = value.toLowerCase();

    return this.cusRemark.filter(search => search.CustomerBillRemarks.toLowerCase().indexOf(filterValue) === 0);
  }

  AccountHeadSearch() {

    const ServiceParams = { strProc: '', oProcParams: [] };
    ServiceParams.strProc = 'AccountHeadSearchAll';

    const oProcParams = [];

    let ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsAC_Name';
    ProcParams.strArgmt = '';
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsType';
    ProcParams.strArgmt = 'customer';
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsBranchId';
    ProcParams.strArgmt = String(this.branchId);
    oProcParams.push(ProcParams);

    ServiceParams.oProcParams = oProcParams;
    const body = JSON.stringify(ServiceParams);

    this._appService.fnApiPost(`${this.baseUrl}/CommonQuery/fnGetDataReportFromScriptJsonFile`, body)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        const dataObject = data;
        this.CusNamejson = JSON.parse(dataObject.JsonDetails);
        this.fngetRemarks();
      }, err => console.error(err));
  }

  fncustomerClick(res) {
    this.AcId = res.AC_Id;
    this.filteredNames = [];
  }

  fngetRemarks() {
    const ServiceParams = { strProc: '', JsonFileName: '' };
    ServiceParams.strProc = 'CustomerRouteRemarks_RemarksGets';
    ServiceParams.JsonFileName = 'JsonArrayScriptTwo';

    const body = JSON.stringify(ServiceParams);
    this._appService.fnApiPost(`${this.baseUrl}/CommonQuery/fnGetDataReportFromScriptJsonFile`, body)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        const dataObject = data;
        this.cusRemark = JSON.parse(dataObject.JsonDetails);
        this.loading = false;
      }, err => console.error(err));
  }

  fnClose() {
    this.modalpage.dismiss();
  }

  Onsubmit() {
    
    const currentDate = new Date().toLocaleTimeString();

    if (this.AcId === '0') {
      this.ctrlService.presentToast('', 'Customer Name is Empty');
      return;
    }

    if (this.txtCusname === '') {
      this.ctrlService.presentToast('', 'Customer Name is Empty');
      return;
    } else if (this.txtremerks === '') {
      this.ctrlService.presentToast('', 'Remarks is Empty');
      return;
    }
    // console.log(this.AcId, this.txtremerks , this.BranchId);

    const ServiceParams = { strProc: '', JsonFileName: '', oProcParams: [] };
    ServiceParams.strProc = 'CustomerRouteRemarks_InsertOne';
    ServiceParams.JsonFileName = 'JsonArrayScriptTwo';

    const oProcParams = [];

    let ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsAcId';
    ProcParams.strArgmt = String(this.AcId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsCustomerBillRemarks';
    ProcParams.strArgmt = this.txtremerks;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsBranchId';
    ProcParams.strArgmt = String(this.branchId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsCustomerRemarksTime';
    ProcParams.strArgmt = currentDate;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsSalesmanId';
    ProcParams.strArgmt = String(this.salesManId);
    oProcParams.push(ProcParams);
    
    ServiceParams.oProcParams = oProcParams;
    const body = JSON.stringify(ServiceParams);
  
    this._appService.fnApiPost(`${this.baseUrl}/CommonQuery/fnGetDataReportFromScriptJsonFile`, body)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        const dataObject = data;
        const dataResult = JSON.parse(dataObject.JsonDetails);
        
        this.ctrlService.presentToast('', dataResult[0].Flag);
        this.txtremerks = '';
        this.AcId = '0';
        this.txtCusname = '';
        setTimeout(() => {
          this.fngetRemarks();
        }, 100);
      }, err => console.error(err));
  }

  

  refresh() {
    this.txtCusname = '';
    this.txtremerks = '';
    this.AcId = '0';
  }

  sendsms() {
    const options = {
      replaceLineBreaks: true, // true to replace \n by a new line, false by default
      android: {
        intent: 'INTENT' // send SMS with the native android SMS messaging
        // intent: ‘’ // send SMS without open any other app
      }
    };
    const textToSend = 'this is just a test';
    this.sms.send('123123123', textToSend, options).then(whatever => {
    }).catch((err) => {
      console.error(err);
    });
  }
  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
