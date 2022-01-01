import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';


@Component({
  selector: 'app-companyorder',
  templateUrl: 'companyorder.page.html',
  styleUrls: ['companyorder.page.scss'],
})

export class CompanyOrderPage implements OnInit {
  @Output() showEvent = new EventEmitter<any>();

  public manufactureData: any[] = [];
  public keyword: string = "";
  private _unsubscribeAll = new Subject();
  private baseUrl: string = "";
  loading = false
  constructor(private appService: AppService, public ctrlService: ControlService) { }

  ngOnInit() {
    this.ctrlService.get('sessionsurl').then(result => {
      if (result != null) {
        this.baseUrl = result;
        this.fnCompanys()
      }
    });
  }



  fnCompanys() {
    this.manufactureData = [];
    const ServiceParams = { strProc: '', oProcParams: [] };
    ServiceParams.strProc = 'Manufacture_GetsForReport';
    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "Manufacture_Name";
    ProcParams["strArgmt"] = this.keyword;
    oProcParams.push(ProcParams);
    ServiceParams.oProcParams = oProcParams;
    
    let body = JSON.stringify(ServiceParams);
    this.loading = true;
    this.appService.fnApiPost(`${this.baseUrl}/CommonQuery/fnGetDataReportBranchStaff`, body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        this.manufactureData = JSON.parse(data);
        this.loading = false;
    })
  }
  
  storedId(id: number) {
    this.showEvent.emit(id)
  }
  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
