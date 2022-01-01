import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DeliveryBoxService } from './delivery-box.service';
import { ViewDetailsComponent } from './view-details/view-details.component';

@Component({
  selector: 'app-delivery-box',
  templateUrl: './delivery-box.component.html',
  styleUrls: ['./delivery-box.component.scss'],
})
export class DeliveryBoxComponent implements OnInit {
  private branchId: string = '';
  private apiUrl: string = '';
  private salesmanId: string = '';
  public statusbar = "Take";
  public loading: boolean = false;
  public dataItems: any[] = [];
  public pLoading: boolean = false;
  public fromDate = new Date(new Date().setDate(1)).toISOString();
  public toDate = new Date().toISOString();
  public toDay = new Date().toISOString();
  private _unsubscribeAll: Subject<any>;
  public storage = new Storage()
  constructor(
    public toastController: ToastController,
    private deliveryService: DeliveryBoxService,
    private alertController: AlertController,
    public modalController: ModalController) {
      this.storage.create();
    this.storage.forEach((val, key) => {
      switch (key) {
        case 'SessionSalesmanId':
          this.salesmanId = val;
          break;

        case 'SessionBranchId':
          this.branchId = val;
          break;
        case 'sessionsurl':
          this.apiUrl = val;
          break;
        
      }
    }).finally(() => {
      this.fngetDelivery();
    })
   }

  ngOnInit() {
    this._unsubscribeAll = new Subject();
   }
  
  fngetDelivery() {
    this.pLoading = true;
    let fromDate = this.fromDate.split('T')[0];
    let toDate = this.toDate.split('T')[0];
    
    this.deliveryService.onDeliveryPickupGets(this.salesmanId, this.branchId,this.statusbar, fromDate, toDate, this.apiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(res => {
        const jsonData = JSON.parse(res.JsonDetails[0])
        this.dataItems = jsonData;
        // console.log(this.dataItems);
        this.pLoading = false;
      },err => this.pLoading = false);
  }

  nowDate() {
    let date = new Date().toISOString();
   return date.split('T')[0];
  }

  fnDeliveryPicked(item) {
    const billId = item.BillSerId;
    const issueNo = item.Issue_SlNo;
    const uniqueBillno = item.UniqueBillNo;
    const nowTime = new Date().toLocaleTimeString();
    const nowDate = this.nowDate();
    this.loading = true;
    this.deliveryService.onPickedDelivery(this.branchId, billId, issueNo, uniqueBillno, nowDate, nowTime,this.apiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(res => {
        const jsonData = JSON.parse(res.JsonDetails[0]);
        this.presentToast('Order Picked Successfully!!',  'success');
        this.loading = false;
        this.fngetDelivery();
      }, err => this.loading = false)
  }

  onConfirmDelivery(item) {
   
    const billserId = item.BillSerId;
    const issueSlno = item.Issue_SlNo;
    const billNo = item.UniqueBillNo;
    const reciveDate = new Date().toLocaleTimeString();
    const reciveTime = this.nowDate();
    this.loading = true;
    this.deliveryService.onDeliveryComplete(this.branchId, billserId, issueSlno, billNo, reciveDate, reciveTime, this.apiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(res => {
        const jsonData = JSON.parse(res.JsonDetails[0]);
        this.loading = false;
        this.presentToast('Delivery Completed Successfully!!', 'success');
        this.fngetDelivery();
        // console.log(jsonData);
      }, err => this.loading = false);
  }
  
  
  
  
   async presentToast(msg, theme) {
    const toast = await this.toastController.create({
      message: msg,
      position: 'bottom',
      color: theme,
      duration: 2000
    });
    toast.present();
   }
  
   async presentAlertConfirm(item) {
    const alert = await this.alertController.create({
      // header: 'Customer Recevide',
      subHeader: 'Deliver the order',
      message: 'Enter <strong>orderid</strong>',
      inputs: [{
        name: 'orderId',
        label: 'Order Id',
        placeholder:'orderId',
        type: 'number'
        }],
      buttons: [
        {
          text: 'Decline',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        },
        {
          text: 'Resend',
          handler: () => {
          }
        },
        {
          text: 'Accept',
          handler: (ev) => {
            console.log(ev.orderId);
            
            if (ev.orderId == item.IssueDelivery_OrderNo) {
              this.onConfirmDelivery(item);
            } else {
                this.presentToast('Enter valid OrderId', 'danger')
            }
           
          }
        }
      ]
    });

    await alert.present();
   }
  
   async viewDetailsModal(items) {
    const modal = await this.modalController.create({
      component: ViewDetailsComponent,
      componentProps: {
        deliveryItem: items
      }
    });
     
     await modal.present();
     const { data } = await modal.onWillDismiss();
     if (data == "accept") {
       this.presentAlertConfirm(items);
     } else if (data == "active") {
       this.fnDeliveryPicked(items);
     }
  }
  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
