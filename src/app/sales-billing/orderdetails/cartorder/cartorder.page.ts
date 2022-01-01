import { Router } from '@angular/router';
import { Component, OnInit, Input, AfterViewInit, DoCheck } from '@angular/core';
import { AppService } from 'src/app/app.service';
import { AlertController } from '@ionic/angular';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-cartorder',
  templateUrl: 'cartorder.page.html',
  styleUrls: ['cartorder.page.scss']
})

export class CartOrderPage implements OnInit, AfterViewInit {

  branch: any;
  cartItems: any[] = [];
  strImageSaveFolderName: string;
  baseUrl: any;
  cartItem: any[];
  private _unsubscribeAll: Subject<any>;

  constructor(public alertController: AlertController, private ctrlService: ControlService,
              public appService: AppService, private router: Router) {
    this.ctrlService.get('sessionsurl').then((val) => {
      if (val != null) {
        this.baseUrl = val;
        this.fnSettings();
      }
    });
    // appService.CartData.subscribe(res => {
    //   this.totalcartCount = res.length;
    // })
      
     }

  ngOnInit() {
    this._unsubscribeAll = new Subject();
    this.appService.CartData
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(res => {
      this.cartItems = res
    })
  }

  onRemoveCart(product) {
    const index: number = this.cartItems.indexOf(product);
    if (index !== -1) {
      this.cartItems.splice(index, 1);
    }
    this.appService.setCartData(this.cartItems);
    
  }

  fnSaveCart() {
    let navigationExtras = {
      queryParams: {
        saved: true
      }
    };
      this.router.navigate(['sales/allorder'], navigationExtras);
  }
 

  fnSettings() {
    const dictArgmts = { ProcName: 'Settings_GetValues' };
    const body = JSON.stringify(dictArgmts);
    this.appService.fnApiPost(this.baseUrl + '/Master/fnSettings', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(result => {
        const settings = result;
        settings.forEach(ele => {
          if (ele.KeyValue === 'ImageSaveFolderName') {
            this.strImageSaveFolderName = ele.Value;
          }
        });
      });
      }

   ngAfterViewInit() {

  }

  fnImageGet(product) {
    if (product.ImageLoc === '' || product.ImageLoc === undefined || product.ImageLoc === null) {
      return 'https://via.placeholder.com/480x365/00838F/fff/?text=Rated%20Product';
    } else {
      return 'https://s3.ap-south-1.amazonaws.com/productcodeappsimage/' +
      this.strImageSaveFolderName + '/' + product.ImageLoc;
    }

  }

  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
