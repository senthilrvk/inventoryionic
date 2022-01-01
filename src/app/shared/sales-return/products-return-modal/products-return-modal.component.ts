import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController, NavParams, PickerController, ToastController } from '@ionic/angular';
import { AppService } from 'src/app/app.service';
import { PickerOptions, PickerColumnOption } from "@ionic/core";
import { DatePipe } from '@angular/common';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
@Component({
  selector: 'app-products-return-modal',
  templateUrl: './products-return-modal.component.html',
  styleUrls: ['./products-return-modal.component.scss'],
})
export class ProductsReturnModalComponent implements OnInit {

  Apiurl: string = '';
  branchId: string = '';
  productItems: any = [];
  acId: number = 0;
  priceId: number = 0;
  batchSource: any[] = [];
  mrpInclusive: string = '';
  today = new Date();
  private _unsubscribeAll: Subject<any>;
  salesData = [];
  constructor(private modalCtrl: ModalController, private _appService: AppService, public navParams: NavParams,
    public alertController: AlertController, public pickerController: PickerController,
    private ctrlService: ControlService,

    private datePipe: DatePipe, public toastController: ToastController) { }

  ngOnInit() {
    this._unsubscribeAll = new Subject();
    this.acId = this.navParams.get('acid');
    this.priceId = this.navParams.get('pricemenuid');
    this.mrpInclusive = this.navParams.get('mrpInclusive');
    this.salesData = this.navParams.get('products');
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
        this.fnProductSearch();
      }
    });


  }

  searchkey:string = '';
  fnProductSearch() {
    let dictArgmts = { dictArgmts: this.searchkey, BranchId: this.branchId };
    let DictionaryObject = {};
    DictionaryObject["dictArgmts"] = dictArgmts;
    DictionaryObject["ProcName"] = "Product_SearchSales";
    let body = JSON.stringify(DictionaryObject)
    this._appService.fnApiPost(this.Apiurl + '/Sales/Product_SearchSales', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        this.productItems = data;

      });
  }

  async productSelect(item) {
    let billDate = this.datePipe.transform(this.today, 'dd/MM/yyy');
    let expDate = this.datePipe.transform(this.today, 'MM/yyyy');
    let itemRow = {
      UniqueBillNo: 0,
      IssueSub_Id: 0,
      BillSerId: 0,
      Issue_SlNo: 0,
      Issue_BillDate: billDate,
      Store_BatchSlNo: 0,
      IssueSub_Batch: '',
      IssueSub_Pack: item.PackQty,
      IssueSub_ExpDate: expDate,
      IssueSub_PurRate: item.PurRate,
      IssueSub_OriginalRate: item.SelRate,
      IssueSub_Mrp: item.MRP,
      IssueSub_RQty: item.quantity,
      IssueSub_RFreeQty: item.free,
      IssueSub_Amount: 0,
      IssueSub_TaxPers: item.TaxPercent,
      IssueSub_TaxAmt: 0,
      IssueSub_PdodDis: 0,
      IssueSub_TaxOn: item.TaxOn,
      IssueSub_TaxOnFree: item.TaxOnFree,
      IssueSub_Repl: item.TaxName,
      ProductId: item.ProductId,
      TaxId: item.TaxID,
      IssueSub_ProdDisAmt: 0,
      IssueSub_ActualTaxPers: item.TaxPercent,
      IssueSub_SelRate: item.SelRate,
      IssueSub_AmountBeforeTax: 0,
      IssueSub_ActualRate: 0,
      IssueSub_AmountBeforeDis: 0,
      IssueSub_Exmpvatncess: 0,
      IssueSub_Type: '',
      IssueSub_SGSTTaxPers: item.SGSTTaxPers,
      IssueSub_SGSTTaxAmount: 0,
      IssueSub_SGSTAmount: 0,
      IssueSub_CGSTTaxPers: item.CGSTTaxPers,
      IssueSub_CGSTTaxAmount: 0,
      IssueSub_CGSTAmount: 0,
      IssueSub_IGSTTaxPers: item.IGSTTaxPers,
      IssueSub_IGSTTaxAmount: 0,
      IssueSub_IGSTAmount: 0,
      IssueRetSub_InclusiveSales: this.mrpInclusive,
      // neccessary using..
      ItemCode: item.ItemCode,
      ItemDesc: item.ItemDesc,
      BillRetQty: 0,
      IssueSub_Qty: 0,
      IssueSub_FreeQty: 0,

    }
    const priceId = Number(this.priceId || 0);


    if (priceId == 1)
      item.IssueSub_OriginalRate = item.SelRate;
    else if (priceId == 2)
      item.IssueSub_OriginalRate = item.WholeSaleRate;
    else if (priceId == 3)
      item.IssueSub_OriginalRate = item.MRP;
    else if (priceId == 4)
      item.IssueSub_OriginalRate = item.SpRate1;
    else if (priceId == 5)
      item.IssueSub_OriginalRate = item.SpRate2;
    else if (priceId == 6)
      item.IssueSub_OriginalRate = item.ProdSpRate3;
    else if (priceId == 7)
      item.IssueSub_OriginalRate = item.ProdSpRate4;
    else if (priceId == 8)
      item.IssueSub_OriginalRate = item.ProdSpRate5;
    else item.IssueSub_OriginalRate = item.SelRate;

    let ServiceParams = {};
    ServiceParams["strProc"] = "Product_GetPurchaseTypeOnReceipt";

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "ProductId";
    ProcParams["strArgmt"] = String(item.ProductId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(this.branchId);
    oProcParams.push(ProcParams);
    ServiceParams["oProcParams"] = oProcParams;
    let body = JSON.stringify(ServiceParams);

    this._appService.fnApiPost(this.Apiurl + '/CommonQuery/fnGetDataReportNew', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        let jsonobj = JSON.parse(data);
        if (jsonobj.length > 0) {
          itemRow.IssueSub_Type = jsonobj[0].PurType;
        }

        this.productView(itemRow);
      });
  }

  async productView(item) {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: item.ItemDesc,
      mode:"ios",
      backdropDismiss: false,
      inputs: [
        {
          name: 'quantity',
          type: 'number',
          id: 'qty-id',
          placeholder: 'Enter Quantity'
        }, {
          name: 'rate',
          type: 'number',
          id: 'rate-id',
          value: item.IssueSub_OriginalRate,
          placeholder: 'Enter Rate'
        }, {
          name: 'free',
          type: 'number',
          id: 'free-id',
          placeholder: 'Enter Free'
        },

      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Ok',
          role: 'selected',
          handler: (res) => {
            item.IssueSub_OriginalRate = Number(res.rate);
            item.IssueSub_RQty = Number(res.quantity);
            item.IssueSub_RFreeQty = Number(res.free);
            this.fnCheckProdItemToAddRow(item)

          }
        }
      ]
    });
    await alert.present().then(() => {
      const firstInput: any = document.querySelector('ion-alert  #qty-id');
      firstInput.focus();
      firstInput.select();
      firstInput.before('Quantity')
      const secondInput: any = document.querySelector('ion-alert #rate-id');
      secondInput.before('Rate')
      const thirdInput: any = document.querySelector('ion-alert #free-id');
      thirdInput.before('Free')
      return;
    });

    // await alert.present();
  }

  fnCheckProdItemToAddRow(item) {
    let dQty = Number(item.IssueSub_Qty);
    let dRQty = Number(item.IssueSub_RQty);
    let dOldRQty = Number(item.BillRetQty);

    // if ((dRQty + dOldRQty) > dQty) {
    //   this.alertToast("Enter Valid Qty");
    //   item.IssueSub_RQty = 0;
    //   return
    // }

    this.productAddRow(item);
  }

  productAddRow(item) {
    let result = this.salesData.find(o => o.ProductId == item.ProductId);
    if (result) {
      this.alertToast('find a duplicate item.')
      return
    }
    this.salesData.push(item)

  }

  fnProductKeyDown(item) {
    let nAcId = Number(this.acId);
    let ServiceParams = {};
    ServiceParams['strProc'] = "IssueSub_ForIssueReturn";

    let oProcParams = [];
    let ProcParams = {};

    ProcParams["strKey"] = "AcId";
    ProcParams["strArgmt"] = String(nAcId);
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "ProductId";
    ProcParams["strArgmt"] = String(item.ProductId);
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(this.branchId);
    oProcParams.push(ProcParams);
    ServiceParams['oProcParams'] = oProcParams;
    let body = JSON.stringify(ServiceParams)
    this._appService.fnApiPost(this.Apiurl + '/CommonQuery/fnGetDataReport', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        let res: any = data
        let jsonobj = JSON.parse(res);
        this.batchSource = jsonobj
        if (jsonobj.length > 0) {
          this.batchPicker(item)
        } else {
          this.productSelect(item)
        }
      })
  }

  async batchPicker(item) {
    let options: PickerOptions = {
      animated: false,
      backdropDismiss: false,
      id: 'picker-s-id',
      buttons: [
        {
          text: "Cancel",
          role: 'cancel'
        },
        {
          text: 'Ok',
          handler: (value: any) => {
            this.onBatchKeyDown(item, value.batch.value)
          }
        }
      ],
      columns: [{
        name: 'batch',
        // suffix: 'batch',
        align: 'center',
        options: this.getColumnOptions()
      }]
    };

    let picker = await this.pickerController.create(options);
    picker.present().then(_ => {
      let colItem = document.getElementById('picker-s-id').getElementsByClassName('picker-toolbar');
      colItem[0].insertAdjacentHTML('afterbegin', '<h3>choose Invoice Item</h3>');
    })
  }

  getColumnOptions() {
    let options: PickerColumnOption[] = [];
    this.batchSource.forEach(x => {
      options.push({ text: `${x.BillNo},  ${x.IssueDate}, Rate: ${x.IssueSub_OriginalRate.toFixed(2)}`, value: x });
    });
    return options;
  }

  onBatchKeyDown(eve, item) {
    let ServiceParams = {};
    ServiceParams['strProc'] = "IssueSub_ForIssueReturnOnBillNo";

    let oProcParams = [];
    let ProcParams = {};

    ProcParams["strKey"] = "AcId";
    ProcParams["strArgmt"] = String(this.acId);
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "ProductId";
    ProcParams["strArgmt"] = String(item.ProductId);
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(this.branchId);
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "UniqueBillNo";
    ProcParams["strArgmt"] = String(item.UniqueBillNo);
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "BillSerId";
    ProcParams["strArgmt"] = String(item.BillSerId);
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "IssueNo";
    ProcParams["strArgmt"] = String(item.Issue_SlNo);
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "BatchNo";
    ProcParams["strArgmt"] = String(item.Store_BatchSlNo);
    oProcParams.push(ProcParams)
    ServiceParams['oProcParams'] = oProcParams;
    let body = JSON.stringify(ServiceParams);

    this._appService.fnApiPost(this.Apiurl + '/CommonQuery/fnGetDataReport', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(result => {
        let jsonobj = JSON.parse(result);
        let _row = jsonobj[0];
        let expdate: any = _row.ExpDate.substring(3, 10);
        let billdate = ddmmyyy(_row.IssueDate);
        let itemRow = {
          UniqueBillNo: _row.BillNo,
          IssueSub_Id: 0,
          BillSerId: item.BillSerId,
          Issue_SlNo: item.Issue_SlNo,
          Issue_BillDate: billdate,
          Store_BatchSlNo: _row.Store_BatchSlNo,
          IssueSub_Batch: _row.Batch,
          IssueSub_Pack: _row.Pack,
          IssueSub_ExpDate: expdate,
          IssueSub_PurRate: _row.PurRate,
          IssueSub_OriginalRate: 0,
          IssueSub_Mrp: _row.MRP,
          IssueSub_RQty: 0,
          IssueSub_RFreeQty: 0,
          IssueSub_Amount: 0,
          IssueSub_TaxPers: _row.TaxPers,
          IssueSub_TaxAmt: 0,
          IssueSub_PdodDis: _row.IssueSub_PdodDis,
          IssueSub_TaxOn: _row.IssueSub_TaxOn,
          IssueSub_TaxOnFree: _row.IssueSub_TaxOnFree,
          IssueSub_Repl: _row.IssueSub_GroupName,
          ProductId: eve.ProductId,
          TaxId: _row.TaxId,
          IssueSub_ProdDisAmt: 0,
          IssueSub_ActualTaxPers: _row.IssueSub_ActualTaxPers,
          IssueSub_SelRate: eve.SelRate,
          IssueSub_AmountBeforeTax: 0,
          IssueSub_ActualRate: 0,
          IssueSub_AmountBeforeDis: 0,
          IssueSub_Exmpvatncess: 0,
          IssueSub_Type: _row.IssueSub_Type,
          IssueSub_SGSTTaxPers: _row.IssueSub_SGSTTaxPers,
          IssueSub_SGSTTaxAmount: 0,
          IssueSub_SGSTAmount: 0,
          IssueSub_CGSTTaxPers: _row.IssueSub_CGSTTaxPers,
          IssueSub_CGSTTaxAmount: 0,
          IssueSub_CGSTAmount: 0,
          IssueSub_IGSTTaxPers: _row.IssueSub_IGSTTaxPers,
          IssueSub_IGSTTaxAmount: 0,
          IssueSub_IGSTAmount: 0,
          IssueRetSub_InclusiveSales: _row.Field2,
          // neccessary using..
          ItemCode: eve.ItemCode,
          ItemDesc: eve.ItemDesc,
          BillRetQty: 0,
          IssueSub_Qty: 0,
          IssueSub_FreeQty: 0,
        }

        if (this.mrpInclusive = "Yes")
          itemRow.IssueSub_OriginalRate = _row.IssueSub_OriginalRate;
        else
          itemRow.IssueSub_OriginalRate = _row.PTR;


        this.productView(itemRow)
      });
  }

  savePop() {
    this.modalCtrl.dismiss({
      params: this.salesData
    });
  }



  async alertToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

}
function ddmmyyy(date) {
  return date.split('/').join('/')
}
