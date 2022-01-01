import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { AppService } from 'src/app/app.service';
import { InAppBrowser, InAppBrowserObject, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PrintmodelcreditnoteComponent } from 'src/app/printpage/printmodelcreditnote/printmodelcreditnote.component';

declare var cordova: any;
@Component({
  selector: 'app-product-return-list',
  templateUrl: './product-return-list.component.html',
  styleUrls: ['./product-return-list.component.scss'],
})
export class ProductReturnListComponent implements OnInit {

  fromdate = new Date().setDate(1);
  Todate = new Date();
  branchId: string = '';
  Apiurl: string = '';
  billSource: any[] = [];
  _searchHide: boolean = false;
  printName: string = '';
  private _unsubscribeAll: Subject<any>;
  constructor(private modalCtrl: ModalController,
    private ctrlService: ControlService,
    private datePipe: DatePipe, private _appservice: AppService, private iab: InAppBrowser,
    public navParams: NavParams, private printer: Printer,
    public modalController: ModalController) { 
      this.printName = this.navParams.get('printName');
    }

  ngOnInit() {
    this._unsubscribeAll = new Subject();
    this.ctrlService.get('SessionBranchId').then((val) => {
      if (val != null) {
        this.branchId = val;
      }
    });
    this.ctrlService.get('sessionInvenBranchId').then((val) => {
      if (val != null) {
        this.branchId = val;
      }
    });

    this.ctrlService.get('sessionsurl').then((val) => {
      if (val != null) {
        this.Apiurl = val;
        this.Gets();
      }
    });

   
  }

  calenderPicker(value) {
    let today:any = new Date();
    this.ctrlService.onDatePicker(today, value).then(date => {
      let _date: any = date;
      if (value == 'From')
        this.fromdate = _date;
      else this.Todate = _date;
      this.Gets();
    }, err => console.log('Error occurred while getting date: ', err)
    );

  }

  search: string = '';
  Gets() {
    let startDate = this.datePipe.transform(this.fromdate, 'dd/MM/yyy');
    let toDate = this.datePipe.transform(this.Todate, 'dd/MM/yyy');
    let varArguements = {};
    varArguements = { BillNo: this.search, FromDate: startDate, ToDate: toDate, BranchId: this.branchId }

    let DictionaryObject = {};
    DictionaryObject["dictArgmts"] = varArguements;
    DictionaryObject["ProcName"] = 'IssueReturn_Gets';
    let body = JSON.stringify(DictionaryObject)
    this._appservice.fnApiPost(this.Apiurl + '/Sales/fnSalesReturn_Gets', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        let jsonobj = JSON.parse(res);
       
        this.billSource = jsonobj

      }, err => console.error(err));
  }


  closePop() {
    this.modalCtrl.dismiss();
  }

  anchorClick(item) {
    this.modalCtrl.dismiss({
      params: item
    });
  }

  async fnPrint(eve) {
    
   console.log(eve);
  

    let ReturnNo = Number(eve.BillNo)
    let UniqueRetNo = Number(eve.UniqueBillNo);

    const myModal = await this.modalController.create({
      component: PrintmodelcreditnoteComponent,
      mode: "ios",
      componentProps: {
        ReturnNo: ReturnNo, UniqueRetNo: UniqueRetNo
      }

    });

    await myModal.present();
    const { data } = await myModal.onWillDismiss();

    return;

    // const url = new URL(this.Apiurl);
    // const connect = `${url.origin}/#/${PrintName}`;
    // let option: InAppBrowserOptions = {
    //   EnableViewPortScale: 'yes',
    //   clearcache: 'yes',
    //   clearsessioncache: 'yes',
    //   location: 'no',
     
    //   // beforeload: 'yes',
    //   presentationstyle: 'pagesheet',
    //   usewkwebview: 'yes',
      
    // }
 
    // let printContent;
    // const browser: InAppBrowserObject = this.iab.create(connect, '_self', option)
    // // _self _blank _system
    // browser.on('loadstart').subscribe((event) => {
    //   browser.executeScript({
    //     code: `sessionStorage.setItem('UniqueRetNo', ${UniqueNo});
    //     sessionStorage.setItem('ReturnNo', ${BillNo});
    //     sessionStorage.setItem('PrintFormat', 'Laser');
    //     sessionStorage.setItem('SessionLoginBranchId', ${this.branchId});
    //     sessionStorage.setItem('SessionBranchName', '');        `
    //   })
     
    // });
    
    // let count = 0;
    // browser.on('loadstop').subscribe(async event => {
    //     await browser.executeScript({ code: `document.getElementById('Pages').innerHTML; ` })
    //       .then( value => {
    //         printContent = value[0];
           
    //         count += 1
    //         if (count == 2) {
    //           console.log(event);
              
    //           setTimeout(() => {
    //               // cordova.plugins.printer.print(printContent);
    //               // cordova.pugins.print()
    //             });
                
    //         } 
    //       }).catch((err) => {
    //         console.error(err);
            
    //       })
      
    // });
    
    
  //   browser.on('exit').subscribe(event => {
      
  //      this.printer.print(printContent)
      
  // });
    
  }

  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
