import { Component, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { ModalController } from "@ionic/angular";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { AppService } from "src/app/app.service";
import { ControlService } from "src/app/core/services/controlservice/control.service";
import { CustomerhelpComponent } from "../customerhelp/customerhelp.component";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage implements OnInit {
  inventryActive: boolean = false;
  staffid = 0;
  ApiUrl: string = '';
  showMenu = {sales: false, Godown: false, AccountHead: false, Receipt:false};
  private _unsubscribeAll: Subject<any>;
  branchId: any;
  constructor(
    private router: Router,
    public appService: AppService,
    public ctrlService: ControlService,
    public modalController: ModalController,
    
  ) {
    this.appService.isBoolean.subscribe((val: boolean) => {
      this.inventryActive = val;
    });
   
    this.appService.menuItems.subscribe((res) => {
      res.forEach((ele) => {
        switch (ele.Menu_FormName) {
          case "Sales":
            this.showMenu.sales = true;
            break;
          
          case "SalesGodownwise":
            this.showMenu.Godown = true;
            break;

          case "AccountHeadMaster":
            this.showMenu.AccountHead = true;
            break;

          case "ReceiptVoucher":
            this.showMenu.Receipt = true;
            break;

       
        }
      })
    });
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.fnGetSession();
      }
    });
  
  }

  ngOnInit() {
    this._unsubscribeAll = new Subject();
  }

  fnGetSession() {
   
    this.ctrlService.get('sessionsurl').then(result => {
      if (result != null) {
        this.ApiUrl = result;
        this.ctrlService.get('sessionInvenStaffId')
        .then(result => {
          if (result != null) {
            this.staffid = result
            this.appService.updateLogin(true);
            this.fnStaffMenuSet();
          }
        });
    
        this.ctrlService.get('SessionSalesmanId').then(result => {
          if (result != null) {
            this.staffid = result;
            this.appService.updateLogin(false);
            this.fnStaffMenuSet();
          }
        });
        
      }
    });

  
  }
  
  async fnStaffMenuSet() {
   
    let ServiceParams = {};
    const dStaffId = Number(this.staffid);
    if (dStaffId) {
      ServiceParams["strProc"] = "Menu_GetDisabledReportType";
    }
    let oProcParams = [];

    let ProcParams = {};
    ProcParams = {};
    ProcParams["strKey"] = "StaffId";
    ProcParams["strArgmt"] = String(this.staffid);
    oProcParams.push(ProcParams);
    ServiceParams["oProcParams"] = oProcParams;
    let body = JSON.stringify(ServiceParams)

    this.appService.fnApiPost(this.ApiUrl + "/CommonQuery/fnGetDataReportNew", body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(
        (res) => {
          let menuForm = JSON.parse(res);
          this.appService.updateMenu(menuForm);
        },
        (err) => {
          console.log(err);
        }
      );
  }
  onRouterClick(val) {
    this.router.navigate([val]);
  }
  async helpCustomer() {
    const modal = await this.modalController.create({
      component: CustomerhelpComponent,
    });
    return await modal.present();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
