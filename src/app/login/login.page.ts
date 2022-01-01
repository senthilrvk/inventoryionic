import { Component, OnInit, ViewChild } from '@angular/core';
import { AppService } from '../app.service';
import { ActionSheetController, AlertController, IonSlides } from '@ionic/angular';
import { LoginService } from './login.service';
import { ControlService } from '../core/services/controlservice/control.service';
import { AuthService } from '../core/services/auth/auth.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  templateUrl: 'login.page.html',
  styleUrls: ['login.page.scss'],
  
})
export class LoginPage implements OnInit {
  BranchId: number = 0;
  branchData: any[] = [];
  Apiurl: string = '';
  keyboardStyle = { width: '100%', height: '0px' };
  serverActive:boolean = false;
  urlloader:boolean = false;
  private _unsubscribeAll: Subject<any>;

  public tempUrl: string = '';
  public loginActivity = { branch: false, welcome: false, order: false, inventory: false };

  constructor(public appService: AppService,
    public _loginService: LoginService,
    private ctrlService: ControlService,
    public actionSheetController: ActionSheetController,
    private authService: AuthService,
    public alertController: AlertController) {
    
    authService.dataClear.subscribe(ischeck => {
      if (ischeck) {
        setTimeout(() => {
          this.loginActivity = { branch: true, welcome: false, order: false, inventory: false };
        });
      } 
    });

    this.fnStorageCheck();
  }
  
  ngOnInit() {
    this._unsubscribeAll = new Subject();
   
  }
  
  fnStorageCheck() {
    this.ctrlService.get('tempurl').then((val) => {
      if (val) {
        this.tempUrl = val;
      }
    });
    this.ctrlService.get('sessionsurl').then((val) => {
      if (!val) {
        this.authService.storageDataSet(true);
      } else {
        this.getBranch(val);
        this.Apiurl = val;
        this.loginActivity = {branch: false, welcome: true, order: false, inventory: false}
        this.authService.storageDataSet(false);
      }
      
    });
  }

  async getBranch(url) {
   
    this._loginService.fnBranchGet(url)
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(data => {
      this.branchData = JSON.parse(data.JsonDetails[0]);;
      this.BranchId = this.branchData[0].BranchId;
    }, err => {
        this.ctrlService.presentToast('', `Something went wrong!!!!`);
    });
   
  }



  async urlSubmit(url) {
    this.urlloader = true;
    this.branchData = [];
    await this._loginService.fnBranchGet(url)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(async response => {
        this.urlloader = false;
      this.branchData = JSON.parse(response.JsonDetails[0]);
      this.BranchId = this.branchData[0].BranchId;
      this.ctrlService.set('sessionsurl', url);
      this.Apiurl = url;
      this.loginActivity = {branch: false, welcome: true, order: false, inventory: false}
    }, async error => {
      this.urlloader = false;
      this.ctrlService.presentToast('', `Please valid url Address !!!`);
    });
    
  }
  
  onLoginPageClick(value) {
    if (value == 'order')
      this.loginActivity = { branch: false, welcome: false, order: true, inventory: false };
    else
      this.loginActivity = { branch: false, welcome: false, order: false, inventory: true };
  }

  openMain() {
    this.loginActivity = {branch: false, welcome: true, order: false, inventory: false}
  }

  async resetConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'rest-confirm',
      header: 'Confirm!',
      backdropDismiss: false,
      mode: 'ios',
      message: ' Do you <strong> Change Branch Login</strong>!!!',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Yes',
          handler: () => {
            this.resetBranch()
          }
        }
      ]
    });

    await alert.present();
  }

  resetBranch() {
    this.ctrlService.clear();
    this.authService.storageDataSet(true);
  }

  async login(form, value: string) {

    const username = form.value.UserName;
    const password = form.value.password;

    if (value == 'order') {
      this._loginService.orderLogin(username, password, this.Apiurl)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        if (res.length > 0) {
          this.ctrlService.set('SessionSalesmanId', res[0].SalesExe_Id);
          this.ctrlService.set('SessionBranchId', res[0].BranchId);
          
          this.authService.login(res[0].JWTToken);
         
        } else {
          this.ctrlService.presentToast('', 'Enter valid username or password');
        }
        this.appService.updateLogin(false);
        this.appService.setloginUrl(true);
      }, err => {
        this.ctrlService.presentToast('', 'Something went wrong!!!!');
      })
    } else if (value == 'inventory') {
      this._loginService.inventoryLogin(username, password, this.BranchId, this.Apiurl)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(json => {
        if (json.length > 0) {
          this.ctrlService.set('sessionBranchName', json[0].BranchName);
          this.ctrlService.set('sessionInvenStaffId', json[0].StaffId);
          this.ctrlService.set('sessionInvenBranchId', json[0].BranchId);
          this.ctrlService.set('SessionLoginSalesmanFlag', json[0].SalesmanFlag);
          this.authService.login(json[0].JWTToken);
        } else {
          this.ctrlService.presentToast('', 'Enter valid username or password');
        }
        this.appService.updateLogin(true);

        this.appService.setloginUrl(true);
      }, err => {
        this.ctrlService.presentToast('', `Something went wrong!!!!`);
      })
    } else {
      this.ctrlService.set('tempurl', form.value.url);
      let url = `https://${form.value.url}/WebApi/Api`;
      if(this.serverActive)
       url = `http://${form.value.url}/WebApi/Api`;
      
      this.urlSubmit(url);
      
    }
    
  }
  

  fnchangebranch(event) {
    this.BranchId = event.detail.value;
  }

  ngOnDestroy(): void {
 
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  } 
}

