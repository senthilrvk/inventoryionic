import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';


@Component({
  selector: 'app-categoryorder',
  templateUrl: 'categoryorder.page.html',
  styleUrls: ['categoryorder.page.scss'],
})

export class CategoryOrderPage implements OnInit {
  @Output() showEvent = new EventEmitter<any>();
  public categoryData: any[] = [];
  public keyword: string = "";
  private _unsubscribeAll = new Subject();
  private baseUrl: string = "";
  public loading = false
  constructor(private appService: AppService, public ctrlService: ControlService) { }

  ngOnInit() {
    this.ctrlService.get('sessionsurl').then(result => {
      if (result != null) {
        this.baseUrl = result;
        this.fnCategorys()
      }
    });
  }

  fnCategorys() {
    this.categoryData = []
    const ServiceParams = { strProc: '', oProcParams: [] };
    ServiceParams.strProc = 'Category_GetOnTypeIdForShop';
    const oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "Search";
    ProcParams["strArgmt"] = this.keyword;
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "CategoryType";
    ProcParams["strArgmt"] = '1';
    oProcParams.push(ProcParams)
    ServiceParams.oProcParams = oProcParams;

    let body = JSON.stringify(ServiceParams);
    this.loading = true;
    this.appService.fnApiPost(`${this.baseUrl}/CommonQuery/fnGetDataReportBranchStaff`, body)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(data => {
      this.categoryData = JSON.parse(data);
      this.loading = false;
    })
  }

  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  storedId(id: number) {
    this.showEvent.emit(id)
  }
}
