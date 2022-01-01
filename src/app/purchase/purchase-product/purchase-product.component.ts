import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { PurchaseFormComponent } from '../purchase-form/purchase-form.component';
import { PurchasePageService } from '../purchase.service';

@Component({
  selector: 'app-purchase-product',
  templateUrl: './purchase-product.component.html',
  styleUrls: ['./purchase-product.component.scss'],
})
export class PurchaseProductComponent implements OnInit {

  @Input() column: string[];
  @Input() priceColumn: any;
  @Input() settings: any;
  @Input() mainData: any;
  public storages = { staffId: '', branchId: '', branchName: '', apiUrl: '' }
  productData:any = [];
  search:string = "";
  today = new Date()

  constructor(private ctrlService: ControlService, private modalControl: ModalController,
     private _purchaseService: PurchasePageService) {

    this.ctrlService.storage.forEach((val, key) => {
      switch (key) {
        case 'sessionInvenStaffId':
          this.storages.staffId = val;
          break;
        case 'sessionInvenBranchId':
          this.storages.branchId = val;
          break;
        case 'sessionBranchName':
          this.storages.branchName = val;
          break;

        case 'sessionsurl':
          this.storages.apiUrl = val;
          break;
        default:
          break;
      }
    }).finally(() => {
      this.onGetProducts()
    })
   }

  ngOnInit() {

  }

  closeModal() {
    this.modalControl.dismiss(this.dynamicData);
  }

  onGetProducts() {
    this._purchaseService.onProductSearch(this.search, this.storages)
    .subscribe(res => {
      this.productData = res
    });
  }
  dynamicData = []
  async presentForm(item) {

    const modal = await this.modalControl.create({
      component: PurchaseFormComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        'column': this.column,
        'data': this.onProductFill(item),
        'priceColumn': this.priceColumn,
        'settings': this.settings,
        'mainData': this.mainData

      }
    });

   await modal.present();
   const { data } = await modal.onWillDismiss();
    if(data)
    this.dynamicData.push(data);

  }


  onProductFill(eve) {

    // let dTempBatchNo = parseFloat(dynamicArray.ReceiptSub_BatchSlNo || 0);
    let dynamicArray: any = {};
    dynamicArray.ReceiptSub_Pack = eve.PackQty;
    dynamicArray.ReceiptSub_Field2 = eve.SkuCode;
    let dExpiryDays = parseFloat(eve.ProductUsed || 0);

    if(this.settingsName('PreviousHistoryPurchase') == 'Yes') {
    dynamicArray.ReceiptSub_ReceiptRate = parseFloat(eve.PurRate || 0).toFixed(2);
    dynamicArray.ReceiptSub_MRP = parseFloat(eve.MRP || 0).toFixed(2);
    dynamicArray.ReceiptSub_Batch = eve.Batch;
    dynamicArray.ReceiptSub_ProdDiscount = 0;

    dynamicArray.ReceiptSub_SellRate = parseFloat(eve.SelRate || 0).toFixed(2);
    dynamicArray.ReceiptSub_WholeSaleRate = parseFloat(eve.WholeSaleRate || 0).toFixed(2);
    dynamicArray.ReceiptSub_PerRate = 0;
    dynamicArray.ReceiptSub_PerLandCost = 0;
    dynamicArray.ReceiptSub_ReceiptFree = 0;
    dynamicArray.ReceiptSub_NetAmtPerProd = 0;
    dynamicArray.ReceiptSub_Amount = 0;
    dynamicArray.ReceiptSub_BarCode = 0;
    dynamicArray.ReceiptSub_WholSalMag = 0;
    dynamicArray.ReceiptSub_RetlMargin = 0;
    dynamicArray.ReceiptSub_LandCost = 0;
    dynamicArray.ReceiptSub_ProdDisAmt = 0;
    dynamicArray.ReceiptSub_SchemePers = 0;
    dynamicArray.ReceiptSub_SchemeAmt = 0;
    dynamicArray.ReceiptSub_Freight = 0;
    dynamicArray.ReceiptSub_Frgt = parseFloat(eve.TaxPercent || 0);
    dynamicArray.ReceiptSub_SpRate1 = parseFloat(eve.SpRate1 || 0);
    dynamicArray.ReceiptSub_SpRate2 = parseFloat(eve.SpRate2 || 0);
    dynamicArray.ReceiptSub_SpRate3 = parseFloat(eve.ProdSpRate3 || 0);
    dynamicArray.ReceiptSub_SpRate4 = parseFloat(eve.ProdSpRate4 || 0);
    dynamicArray.ReceiptSub_SpRate5 = parseFloat(eve.ProdSpRate5 || 0);
    dynamicArray.ReceiptSub_LooseQty = 0;
    }

    dynamicArray.ProductId = eve.ProductId;
    dynamicArray.ReceiptSub_TaxAmt = 0;
    dynamicArray.ReceiptSub_TaxOn = eve.TaxOn;
    dynamicArray.ReceiptSub_TaxOnFree = eve.TaxOnFree;
    dynamicArray.ReceiptSub_TaxName = eve.TaxName;
    dynamicArray.TaxId = eve.TaxID;
    dynamicArray.ReceiptSub_TaxPercentage = parseFloat(eve.TaxPercent || 0);
    dynamicArray.ReceiptSub_CessPers = parseFloat(eve.CessPers || 0);
    dynamicArray.ReceiptSub_ExtraCessPers = parseFloat(eve.AdditionalCess || 0);
    dynamicArray.ReceiptSub_ActualTaxPers = parseFloat(eve.TaxPercent || 0);
    dynamicArray.ReceiptSub_AmtBeforeTax = 0;
    dynamicArray.ReceiptSub_SGSTTaxPers = parseFloat(eve.SGSTTaxPers || 0);
    dynamicArray.ReceiptSub_SGSTTaxAmount = 0;
    dynamicArray.ReceiptSub_CGSTTaxPers = parseFloat(eve.CGSTTaxPers || 0);
    dynamicArray.ReceiptSub_CGSTTaxAmount = 0;
    dynamicArray.ReceiptSub_CGSTAmount = 0;
    dynamicArray.ReceiptSub_IGSTTaxPers = parseFloat(eve.IGSTTaxPers || 0);
    dynamicArray.ItemName = eve.ItemDesc;
    dynamicArray.Code = eve.ItemCode;
    dynamicArray.ReceiptSub_ExpDate = this.fnExpDate();
    dynamicArray.ReceiptSub_Period = this.today;

    let listData = this.column.find(x => x == "R Mar(%)")
    if (listData) {
      dynamicArray.ReceiptSub_NeethiDisPers = parseFloat(eve.DisPers || 0);
    }
    let today = new Date();
    dynamicArray.ReceiptSub_Period = today;
    return dynamicArray
  }

  fnExpDate() {

    let txtSoftwareName = '', txtExpMonthYearFormat = ''
    txtExpMonthYearFormat = this.settingsName("ExpMonthYearFormat");
    txtSoftwareName = this.settingsName("ProductName");

    let today: any = new Date();
    today.setMonth(today.getMonth() + 3);
    let dd = today.getDate();
    let mm = today.getMonth();
    let yyyy = today.getFullYear();



    if (mm == 0)
      mm = mm + 1;

    if (mm == 2)
      dd = 26;
    if (dd != 1)
      dd = dd - 1;

    if (mm < 10) {
      mm = '0' + mm
    }

    if (dd < 10) {
      dd = '0' + dd
    }

    if (txtSoftwareName == 'RetailPharma' || txtSoftwareName == 'WholeSalePharma' ||  txtExpMonthYearFormat == 'Yes') {
      today = mm + '/' + yyyy;
    } else {
      today = dd + '/' + mm + '/' + yyyy;
    }

    return today;

  }

  settingsName = (value) => {
    return this.settings.find(x => x.KeyValue == value).Value
  }

}
