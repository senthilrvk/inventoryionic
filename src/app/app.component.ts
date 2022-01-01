import { CustomerhelpComponent } from './shared/customerhelp/customerhelp.component';
import { Component, OnInit,  QueryList,  ViewChild, ViewChildren } from '@angular/core';

import { Platform, NavController, ModalController, AlertController, IonRouterOutlet, ActionSheetController, MenuController, PopoverController, ToastController, LoadingController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ActivatedRoute,  Router } from '@angular/router';
import { AppService } from './app.service';
import { Storage } from '@ionic/storage';
import { AndroidPermissions } from '@ionic-native/android-permissions/ngx';
import { AuthService } from './core/services/auth/auth.service';
import { NetworkProvider } from './providers/network/network';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],

})
export class AppComponent implements OnInit {
  @ViewChildren(IonRouterOutlet) routerOutlets: QueryList<IonRouterOutlet>;
  public pages = [
    {
      title: 'Home',
      url: 'home',
      icon: 'home'
    }, {
      title: 'Customer',
      url: 'master',
      icon: 'person-add'
    }, {
      title: 'Receipt',
      url: 'voucherreceipt',
      icon: 'albums-outline'
    }, {
      title: 'Reports',
      url: 'reports/report',
      icon: 'analytics'
    },
    {
      title: 'Location List',
      url: 'locationlist',
      icon: 'pin'
    }



  ];
  private storage =  new Storage();
  private backButtonSubscription;
  lastTimeBackPress = 0;
  timePeriodToExit = 2000;
  branchName: string = '';
  public inventryActive:boolean = false;
  public networkProvider= NetworkProvider
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private router: Router,

    public navCtrl: NavController,
    private alertController:AlertController,
    public appService: AppService,
    private actionSheetCtrl: ActionSheetController,
    private popoverCtrl: PopoverController,
    public modalCtrl: ModalController,
    private toast: ToastController,

    private loadingController: LoadingController,
    private androidPermissions: AndroidPermissions,
    private authenticationService: AuthService
  ) {

    this.initializeApp();

  }

  ngOnInit() {
    // this._ctrlService.get('auth-token');
     this.storage.create()
    this.appService.isBoolean.subscribe((val: boolean) => {
      this.inventryActive = val;
    });

    this.appService.urlvalidate.subscribe(res => {
      this.storage.get('sessionsurl').then((val) => {
        if(val) {
        let url = new URL(val)
        this.branchName = url.host
      }
      });
    })

    App.addListener('backButton', ({canGoBack}) => {
      console.log('backButton', canGoBack);
    });

    // this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION)
    //   .then(result => console.log('Has permission?',result.hasPermission),
    //   err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ACCESS_BACKGROUND_LOCATION)
    // );

    // this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.ANSWER_PHONE_CALLS)
    //   .then(result => console.log('Has permission?',result.hasPermission),
    //   err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.ANSWER_PHONE_CALLS)
    // );
    // this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.BIND_PRINT_SERVICE)
    // .then(result => console.log('Has permission?',result.hasPermission),
    // err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.BIND_PRINT_SERVICE)
    // );

    // this.androidPermissions.checkPermission(this.androidPermissions.PERMISSION.SEND_SMS)
    // .then(result => console.log('Has permission?',result.hasPermission),
    // err => this.androidPermissions.requestPermission(this.androidPermissions.PERMISSION.SEND_SMS)
    // );

  }


  initializeApp() {

    this.platform.ready().then(() => {

      this.androidPermissions.requestPermissions([
      this.androidPermissions.PERMISSION.SEND_SMS,
      this.androidPermissions.PERMISSION.ANSWER_PHONE_CALLS,
        this.androidPermissions.PERMISSION.BIND_PRINT_SERVICE,
        this.androidPermissions.PERMISSION.READ_EXTERNAL_STORAGE
      ]);

    // this.platform.backButton.subscribeWithPriority(1, () => {
    //     document.addEventListener('backbutton', (ev) => {
    //       ev.preventDefault();
    //       ev.stopPropagation();
    //       console.log('hello');
    //     }, false);
    //   });

      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.authenticationService.authenticationState.subscribe(state => {
        if (state) {
          this.router.navigate(['home']);
          this.appService.setloginUrl(true);
        } else {
          this.router.navigate(['login']);
        }

      });

      // this.networkProvider.initializeNetworkEvents();
      // this.events.subscribe('network:offline', () => {
      //   // alert('network:offline ==> ' + this.network.type);
      //   this.router.navigate(['network']);
      // });

      // // Online event
      // this.events.subscribe('network:online', () => {
      //   // alert('network:online ==> ' + this.network.type);
      //   this.router.navigate(['login']);
      // });
      this.router.navigate(['login']);
      //  this.backButtonEvent();
    });

  }

  backButtonEvent() {

    this.platform.backButton.subscribe(async () => {

      // close action sheet
      try {
          const element = await this.actionSheetCtrl.getTop();
          if (element) {
              element.dismiss();
              return;
          }
      } catch (error) {
      }

      // close popover
      try {
          const element = await this.popoverCtrl.getTop();
          if (element) {
              element.dismiss();
              return;
          }
      } catch (error) {
      }

      // close modal
      try {
          const element = await this.modalCtrl.getTop();
          if (element) {
              element.dismiss();
              return;
          }
      } catch (error) {
          console.log(error);

      }

      // close loading
      try {
        const element = await this.loadingController.getTop();
        if (element !== undefined) {
          this.loadingController.dismiss();
          return;
        }

    } catch (error) {

      }

      // close side menua
      // try {
      //     const element = await this.menu.getOpen();
      //     if (element !== null) {
      //         this.menu.close();
      //         return;

      //     }

      // } catch (error) {

      // }

       this.routerOutlets.forEach(async (outlet: IonRouterOutlet) => {
          if (outlet && outlet.canGoBack()) {
              outlet.pop();

          } else if (this.router.url == '/login'  || this.router.url == '/home') {
            // console.log('win');

              if (new Date().getTime() - this.lastTimeBackPress < this.timePeriodToExit) {
                  // this.platform.exitApp(); // Exit from app
                  navigator['app'].exitApp(); // work for ionic 4

              } else {
                const toast = await  this.toast.create({
                    message:'Press back again to exit App.',
                  duration: 2000,
                  mode: "ios",
                    position:'bottom'});
                    toast.present();
                  this.lastTimeBackPress = new Date().getTime();
              }
          }  else {
            console.log("routerOutlets else")

        }
      });

  });

    // this.platform.backButton.subscribe(() => {

        // this.routerOutlets.forEach((outlet: IonRouterOutlet) => {

        //     if (this.router.url === '/home') {
        //         navigator['app'].exitApp();
        //     } else {
        //         window.history.back();
        //     }
        // });
    // });
}

  ngOnDestroy() {
    this.backButtonSubscription.unsubscribe();

  }

  async helpCustomer() {
    const modal = await this.modalCtrl.create({
      component: CustomerhelpComponent,
      mode: "ios",
    });
    return await modal.present();
  }

  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      // header: 'Confirm!',
      message: 'Are you sure you want to back the app?',
      mode: "ios",
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: (blah) => {

          alert.dismiss();
        }
      }, {
        text: 'Okey',
        handler: () => {
          navigator['app'].clearHistory()
          alert.dismiss();
          this.router.navigate(['home']);
          // navigator['app'].exitApp();
          // navigator['app'].backHistory();
        }
      }]
    });

    await alert.present();
  }

  fnExitApp() {
    navigator['app'].exitApp();
  }

  fnClearData() {
    this.deleteAlertConfirm();
    // this.router.navigate(['']);
  }


  async deleteAlertConfirm() {
    const alert = await this.alertController.create({
      header: 'WARNING',
      message: 'All your Login Detail will be deleted permanently',
      mode: "ios",
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'secondary',
        handler: (blah) => {
          alert.dismiss();
        }
      }, {
        text: 'Okey',
          handler: () => {
          this.storage.clear();
            alert.dismiss();
            this.authenticationService.logout();
            this.authenticationService.storageDataSet(true);
        }
      }]
    });

    await alert.present();
  }
}
