import { Component, OnInit, Input } from '@angular/core';
import { NavParams, ModalController, AlertController, ToastController, AlertInput } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';


@Component({
  selector: 'app-modalhistory',
  templateUrl: './modalhistory.component.html',
  styleUrls: ['./modalhistory.component.scss'],
})
export class ModalhistoryComponent implements OnInit {
  @Input() data: string;
  @Input() diffPrice: string;
  @Input() dTempGodownId: number;
  @Input() ProdName: string;
  @Input() dialogType: string;
  @Input() discFlag: boolean;
  @Input() rateDis: boolean;

  branchId: any;
  Apiurl: string;
  priceMenuid: any;
  dataReport = [];
  batchValid = '';
  expiryValid = '';
  loading: boolean;
  private _unsubscribeAll: Subject<any>;
  constructor(public navParams: NavParams,
              public alertController: AlertController,
              public modalController: ModalController,
              private appService: AppService,
              private ctrlService: ControlService,
              public toastController: ToastController) { }

  ngOnInit() {
    const batchSource = this.navParams.get('data');
    this.dataReport = [];
    // this.ListIssueSubDetailsInfo.splice(index, 1);
    batchSource.forEach(element => {
      let index = element.Store_BalQty == 0 ? batchSource.indexOf(element) : '';
      if (typeof index === "string")
        this.dataReport.push(element);
        this.dataReport.sort((a,b) => a.Store_PerMRP < b.Store_PerMRP ? 1: -1)

    });

    this._unsubscribeAll = new Subject();
    this.priceMenuid = this.navParams.get('diffPrice');
    this.dTempGodownId = this.navParams.get('ParamsGodownId');
    this.ProdName = this.navParams.get('itemName');
    this.batchValid = this.navParams.get('batch');
    this.expiryValid = this.navParams.get('expiry');


    this.loading = true;
    this.ctrlService.get('sessionInvenBranchId').then((result) => {
      if (result != null)
      this.branchId = result;

    });
    this.ctrlService.get('sessionsurl').then((result) => {
      if (result != null)
        this.Apiurl = result;
        this.loading = false;
    });


  }

  onClose() {
    this.modalController.dismiss();
  }



  fnOrderClick(item) {

    const nBatchNo = item.Store_BatchSlNo;
    const nProductId = item.ProductId;
    let varArguements = {};
    const DictionaryObject = {dictArgmts: {}, ProcName: ''};
    let strControllerFunctionName = '';

    if (this.dTempGodownId === 0) {
      varArguements = {
        BatchSlNo: nBatchNo, ProductId: nProductId, BranchId: this.branchId
      };
      DictionaryObject.dictArgmts = varArguements;
      DictionaryObject.ProcName = 'store_gettaxdetailsonProdidandBatchNo';
      strControllerFunctionName = 'fnStoreTaxDetailsOnProductBatchNo';
    } else {
      varArguements = {
        BatchSlNo: nBatchNo, ProductId: nProductId, BranchId: this.branchId, GodownId: this.dTempGodownId
      };
      DictionaryObject.dictArgmts = varArguements;
      DictionaryObject.ProcName = 'GodownStore_gettaxdetailsonProdidandBatchNo';
      strControllerFunctionName = 'fnStoreTaxDetailsOnProductBatchNoGodownwise';
    }
    const body = JSON.stringify(DictionaryObject);
    this.appService.fnApiPost(this.Apiurl + '/Sales/' + strControllerFunctionName, body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        const getData = JSON.parse(data);
        if (this.dialogType == 'pos') {
          this.dismiss(getData);
          return
        }
        this.presentPrompt(getData, item);
      });
  }

  async presentPrompt(product, item) {

    let _orgrate = 0;
    let MenuPrice = this.priceMenuid;
    if (MenuPrice == 3) // "MRP"
    _orgrate = parseFloat(product[0].Store_MRP || 0);
    else if (MenuPrice == 2)//"W MRP"
    _orgrate = parseFloat(product[0].Store_DisributRate || 0);
    else if (MenuPrice == 4) //"spRate1"
    _orgrate = parseFloat(product[0].SpRate1 || 0);
    else if (MenuPrice == 5) //spdate2
    _orgrate = parseFloat(product[0].SpRate2 || 0);
    else if (MenuPrice == 6) //spdate3
    _orgrate = parseFloat(product[0].SpRate3 || 0);
    else if (MenuPrice == 7) //spdate4
    _orgrate = parseFloat(product[0].SpRate4 || 0);
    else if (MenuPrice == 8) //spdate5
    _orgrate = parseFloat(product[0].SpRate5 || 0);
    else
    _orgrate = parseFloat(product[0].Store_SellRate || 0);
    let inputArray:AlertInput[] = [
      {
        name: 'Quantity',
        placeholder: 'Quantity',
        type: 'number',
        id: 'modal-qty'
      },
      {
        name: 'Free',
        placeholder: 'Free',
        type: 'number',
        id: 'modal-free'
      },
      {
        name: 'Rate',
        placeholder: 'Rate',
        type: 'number',
        disabled: this.rateDis,
        id: 'modal-rate',
        value: _orgrate
      }
    ];
    if(this.discFlag) {
      inputArray.push({
        name: 'Disc',
        id: 'modal-discpers',
        placeholder: 'DiscPers(%)',
        type: 'number'
      })
    }
    const alert = await this.alertController.create({
      header: this.ProdName,
      subHeader: 'Available Stock - ' + item.Store_BalQty,
      mode: "ios",
      inputs: inputArray,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: data => {
            // this.dismiss(data, product);
          }
        },
        {
          text: 'Add',
          handler: data => {
            let qty = parseFloat(data.Quantity || 0);
            let freeqty = parseFloat(data.Free || 0);
            if (item.Store_BalQty < qty + freeqty) {
              this.presentToast(product, item);
              return;
            }
            if (data.Rate === '') {
              data.Rate = _orgrate;
            }
            if (!qty) {
              data.Quantity = 1;
            }
            if (!data.Disc) {
              data.Disc = 0;
            }
            data.iStore_BatchSlNo = product[0].Store_BatchSlNo;
            data.iProductId = product[0].ProductId;
            data.stock = item.Store_BalQty
            // console.log(data.Quantity);
            this.dismiss(data);
            // console.log(data, product);
          }
        }
      ],
      backdropDismiss: false
    });
    await alert.present().then(() => {
      const firstInput: any = document.querySelector('ion-alert #modal-qty');
      firstInput.focus();
      firstInput.select();
      firstInput.before('Quantity');
      const secondInput: any = document.querySelector('ion-alert #modal-free');
      secondInput.before('Free');
      const thirdInput: any = document.querySelector('ion-alert #modal-rate');
      thirdInput.before('Rate')

      const fourthInput: any = document.querySelector('ion-alert #modal-discpers');
      if(fourthInput)
      fourthInput.before('Disc(%)')
      return;
    });
    // await alert.present();
  }

  dismiss(data) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss(data);
    // this.modalController.dismiss({
    //   dismissed: true
    // });
  }


  async presentToast(product, item) {
    const toast = await this.toastController.create({
      header: 'Available Stock ' + item.Store_BalQty,
      message: 'Valid Quantity.',
      position:'top',
      duration: 2000,
      color: 'danger',
      buttons: [
        {
          text: 'Done',
          handler: () => {
            this.presentPrompt(product, item);
          }
        }
      ]
    });
    toast.present();
  }

  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
