import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { from, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PurchasePageService } from 'src/app/purchase/purchase.service';
import { SalesPageService } from 'src/app/sales-billing/sales-page.service';
import { MasterComponent } from 'src/app/shared/master/master.component';

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.component.html',
  styleUrls: ['./add-customer.component.scss'],
})
export class AddCustomerComponent implements OnInit {

  @Input() billSeriesId: any;
  @Input() searchtype: any;
  baseApiUrl: '';
  dBranchId: '';
  salesId: string = '';
  salesBranchId: string = '';
  accSource: any[] = [];
  search: string = '';
  private _unsubscribeAll: Subject<any>;
  private storage = new Storage();
  constructor(
    private modalController: ModalController,
    private modal: ModalController,
    private router: Router,
    private salesService: SalesPageService,
    private purchaseService: PurchasePageService) {
      this.storage.create()
      this.storage.forEach((value, key) => {
        if (key == 'sessionInvenStaffId') {
          // this.acId = value;
        } else if (key == 'sessionInvenBranchId') {
          if(value)
          this.dBranchId = value;
        } else if (key == 'sessionsurl') {
          this.baseApiUrl = value;
        } else if (key == 'SessionSalesmanId') {
          if(value)
          this.salesId = value;
        } else if (key == 'SessionBranchId') {
          if(value)
          this.salesBranchId = value;
        }

      }).finally(() => {
        if (this.searchtype == 'salesman') this.fnOnSalesmanGets('');
        else if (this.searchtype == 'voucher') this.fnOnVoucherGets('');
        else if (this.searchtype == 'purchase') this.onSupplierGet('');
        else this.fnAccHeadGets('');
      })
  }

  ngOnInit() {
    this._unsubscribeAll = new Subject();
  }

  searchkey:string = '';
  onSearch() {
    const keyword =  this.searchkey
    if (this.searchtype == 'salesman') this.fnOnSalesmanGets(keyword);
    else if (this.searchtype == 'voucher') this.fnOnVoucherGets(keyword);
    else if (this.searchtype == 'purchase') this.onSupplierGet(keyword);
    else  this.fnAccHeadGets(keyword);
  }

  onSupplierGet(keyword) {
    this.search = keyword
    this.purchaseService.onSupplierSearch(keyword, this.dBranchId, this.baseApiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.accSource = JSON.parse(res);
      }, err => console.error(err));
  }

  fnOnVoucherGets(keyword) {
    this.search = keyword
    this.salesService.onVoucherCustomer(keyword, this.dBranchId, this.baseApiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.accSource = JSON.parse(res);
      }, err => console.error(err));
  }

  fnOnSalesmanGets(keyword) {
    this.search = keyword
    this.salesService.onSalesMan(keyword, this.salesBranchId, this.salesId, this.baseApiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.accSource = JSON.parse(res);
      }, err => console.error(err));
  }

  fnAccHeadGets(keyword) {
    this.search = keyword;

    if(this.billSeriesId)
    this.salesService.onCustomerGets(keyword, this.billSeriesId,this.dBranchId,this.baseApiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.accSource = JSON.parse(res.JsonDetails[0]);
    }, err => console.error(err));
  }

  onCancel() {
    this.modal.dismiss();
  }

  onAccClick(acc) {
    this.modal.dismiss(acc)
  }

  async onAddCustomer() {
   const modal = await this.modalController.create({
     component: MasterComponent,
     componentProps: {
       popup: true,
       keyword: this.search

     },
      mode: 'ios'
   })
   return await modal.present();
    // this.modal.dismiss()
    this.router.navigate(['/master'])
  }
  ngOnDestroy(): void {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
