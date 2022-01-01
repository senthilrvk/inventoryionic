import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { AddCustomerComponent } from 'src/app/dialogue/add-customer/add-customer.component';
import { PopoverComponent } from '../popover/popover.component';
import { PurchaseFormComponent } from '../purchase-form/purchase-form.component';
import { PurchaseProductComponent } from '../purchase-product/purchase-product.component';
import { PurchasePageService } from '../purchase.service';
import * as _moment from 'moment';
import { NgAnalyzedFile } from '@angular/compiler';

@Component({
  selector: 'app-purchase',
  templateUrl: './purchase.page.html',
  styleUrls: ['./purchase.page.scss'],
})
export class PurchasePage implements OnInit {

  public receiptInfoMain = {
    PurchaseId: 0, Receipt_SlNo: 0, Receipt_InvoNo: '',
    Receipt_PayTerms: 'CREDIT', Receipt_Type: 'LOCAL', Receipt_Discount: 0, Receipt_Othercharge: 0,
    Receipt_CST: 0, Receipt_RepAmt: 0, Receipt_InvoAmt: 0, Receipt_ROF: 0, Receipt_Total: 0,
    DrNotesId: "0", StaffId: 0, AC_Id: 0, BranchId: 0, OutletId: 0,
    Excempted: 0, MRPValue: 0, PurchaseValue: 0, VatCollected: 0, Field1: '',
    DisAmt: 0, CSTAmt: 0, WholeSaleRateCalPers: 0, RetailSaleRateCalPers: 0,
    LandingCost: 0, Receipt_Freight: 0, Receipt_PackingChg: 0, Receipt_StampingChg: 0,
    PurBillSerId: 0, Receipt_SupplierName: null, Receipt_Address: '', Receipt_Tin1: '',
    Receipt_Cst1: '', Receipt_DLNo1: '', Field3: 'Pers', Receipt_DbAmt: 0, Receipt_OtherTaxGrpId: 0,
    Receipt_OtherTaxPers: 0, Receipt_OtherTaxAmt: 0, Receipt_OtherSGST: 0, Receipt_OtherCGST: 0,
    Receipt_OtherIGST: 0, Receipt_PackingChgTaxGrpId: 0, Receipt_PackingChgTaxPers: 0, Receipt_PackingChgTaxAmt: 0,
    Receipt_PackingChgSGST: 0, Receipt_PackingChgCGST: 0, Receipt_PackingChgIGST: 0, Receipt_StampingChgTaxGrpId: 0,
    Receipt_StampingChgTaxPers: 0, Receipt_StampingChgTaxAmt: 0, Receipt_StampingChgSGST: 0,
    Receipt_StampingChgCGST: 0, Receipt_StampingChgIGST: 0, Receipt_AddCess: 'No',
    Receipt_TCSInPers: 0, Receipt_TCSInAmt: 0, Receipt_TCSCalValue: 0, Receipt_InvoDate: "",
    Receipt_Date2:this.getDDMMYYYY(),Receipt_Date1:this.getDDMMYYYY()
  };

  // btnCancel: boolean;
  // ItemDisable: any[] = [];
  txtMrpInclusiveSales: any;
  jsonTaxData: any[] = [];
  txtCopyBillNo: number =0;
  bCtrlSaleRate = false; bCtrlMrp = false;
  public tempField = { purNo: 0, purDate: '', strGSTName: 'GSTNo', gstNo: '',txtExpMonthYearFormat:'' }
  public billSeries = [];
  public columnHeader = [];
  public storages = { staffId: '', branchId: '', branchName: '', apiUrl: '' }
  public customPopoverOptions: any = {
    showBackdrop: false
  };
  txtAddOrMinus: any;
  txtExpMonthYearFormat:any;
  txtSoftwareName: any;
  dynamicArray:any[] = [];
  txtCustomerForSoftware: any;
  private _unSubscribeAll = new Subject();
  public settings = []
  priceColumn = { lblSpRate1: '', lblSpRate2: '', lblSpRate3: '',  lblSpRate4: '', lblSpRate5: '', lblRetailRate: '',  lblWholSalRate: '', lblMRP: '',};

  constructor(public modalController: ModalController,public popoverController: PopoverController,
     private _purchaseService: PurchasePageService,
    private ctrlService: ControlService,private route: ActivatedRoute,
    public alertController: AlertController, public datePipe: DatePipe) {

     }

  ngOnInit() {

    // this.btnCancel = false;

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
      this.fnSettings()

    })
    const date: Date = new Date();
    const today = this.dateReverse(date.toISOString());
    this.receiptInfoMain.Receipt_InvoDate = today;
    this.tempField.purDate = today;
  }


 getDDMMYYYY() {

    var today = new Date();
    var dd    = String(today.getDate());
    var mm    = String(today.getMonth() + 1);
    var yyyy  = String(today.getFullYear());

    if (Number( dd || 0) < 10)
        dd = String('0' + dd);
    if (Number(mm || 0) < 10)
        mm = String('0' + mm);
    return dd + '/' + mm + '/' + yyyy;

}

  purchaseControlOrder() {
    this._purchaseService.onColOrderForHeader(this.storages)
    .pipe(takeUntil(this._unSubscribeAll))
      .subscribe(res => {

        const jsonTable = res;

        let UniqueTestBoxValue = '';

        // if (this.settingsName('UniversalCodeLink') == 'Yes')
        // UniqueTestBoxValue = 'Display Name';

        let PurchaseItemCode = '';
        if (this.settingsName('PurchaseItemCode') == 'Yes')
          PurchaseItemCode = 'Code';

          let showResultColumns = [];
        if (PurchaseItemCode)
          showResultColumns.push(PurchaseItemCode);

        if (UniqueTestBoxValue)
          showResultColumns.push(UniqueTestBoxValue);

          showResultColumns.push('Product Name & Packing', `${this.settingsName('TaxName')}%`);
          for (const col of jsonTable) {
            if (col.ControlOrder) {
            switch (col.ControlName) {
              case 'PBatch':
                showResultColumns.push(this.settingsName('BatchDisplayName'));
              break;
              case 'PPack':
                showResultColumns.push('Pack');
              break;
              case 'PExp':
                showResultColumns.push('ExpDate');
              break;
              case 'PDisPers':
                showResultColumns.push('Dis(%)');
              break;
              case 'PSchemeAmt':
                showResultColumns.push('ScheAmt');
              break;
              case 'PDisAmt':
                showResultColumns.push('DisAmt');
              break;
              case 'PLCost':
                showResultColumns.push('LCost');
              break;
              case 'PHsnCode':
                showResultColumns.push('PHsnCode');
              break;
              case 'PColor':
                showResultColumns.push('Color');
              break;
              case 'PMrpCalPurRate':
                showResultColumns.push('MRP(%)');
              break;
              case 'PRMrpCalTextilies':
                showResultColumns.push('RMRP(%)');
              break;
              case 'PAmount':
                showResultColumns.push('GstAmt', 'BeforeTax', 'BeforeTax');
              break;
              case 'PSRate': {
                showResultColumns.push('RetailRate');
                this.bCtrlSaleRate = true;
              }
              break;
              case 'PFreight':
                showResultColumns.push('Freight');
              break;
              case 'PQty':
                showResultColumns.push('Qty');
              break;
              case 'PFQty':
                showResultColumns.push('FQty');
              break;
              case 'PLooseQty':
                showResultColumns.push('Loose');
              break;
              case 'PPRate':
                showResultColumns.push('PurRate');
              break;
              case 'PPRateWithTax':
                showResultColumns.push('PRateWithTax');
              break;
              case 'PMrp': {
                showResultColumns.push('MRP');
                this.bCtrlMrp = true;
              }
              break;
              case 'PNeethiDis':
                showResultColumns.push('R Mar(%)');
              break;
              case 'PWholeRateMargin':
                showResultColumns.push('W Mar(%)');
              break;
              case 'PWRate':
                showResultColumns.push('WholSalRate');
              break;
              case 'SPRateOne':
                showResultColumns.push('SpecialRate');
              break;
              case 'SPRateTwo':
                showResultColumns.push('DealerRate');
              break;
              case 'SPRateThree':
                showResultColumns.push('SPRateThree');
              break;
              case 'SPRateFour':
                showResultColumns.push('SPRateFour');
              break;
              case 'SPRateFive':
                showResultColumns.push('SPRateFive');
              break;
              case 'PSalesQty':
                showResultColumns.push('SalesQty');
              break;
              case 'PSalesFree':
                showResultColumns.push('SalesFre');
              break;
              case 'PSalesPeriod':
                showResultColumns.push('SalePeriod');
              break;
              case 'PSelRateMarginPers':
                showResultColumns.push('%SRateMargin', 'MarginAmt');
              break;
              case 'PMrpMarginPers':
                showResultColumns.push('%MrpMargin');
              break;
              case 'PRemarks':
                showResultColumns.push('Remarks');
              break;
              case 'PMrpMarginAmt':
                showResultColumns.push('MrpMarginAmt');
              break;
              case 'PReplaceQty':
                showResultColumns.push('ReplaceQty');
              break;
              // case 'PAmount':
              //   showResultColumns.push(`${this.settingsName('TaxName')}Amt`,
              //   `Before${this.settingsName('TaxName')}`, 'Amount');
              // break;
            }
          }

          }
          this.fnPriceMenusGets()
          let itemvalid = jsonTable.find(x => x.ControlName == 'PAmount' && x.ControlOrder == 0);
          if (itemvalid) {
            showResultColumns.push(`${this.settingsName('TaxName')}Amt`, `Before${this.settingsName('TaxName')}`, 'Amount');
          }
          this.columnHeader = showResultColumns;
          // console.log(showResultColumns);

      });
  }

  fnPriceMenusGets() {
    this._purchaseService.onPriceMenusGets(this.storages)
    .pipe(takeUntil(this._unSubscribeAll))
      .subscribe(res => {

        let jsonDetails = JSON.parse(res);
        for (const val of jsonDetails) {
          switch (val.PriceMenu_Name) {
            case 'SpRate1':
              this.columnHeader = this.columnHeader.map(x => x.replace('SpecialRate', val.DisplayName));
              this.priceColumn.lblSpRate1 = val.DisplayName;
              break;

            case 'SpRate2':
              this.columnHeader = this.columnHeader.map(x => x.replace('DealerRate', val.DisplayName));
              this.priceColumn.lblSpRate2 = val.DisplayName;
              break;

            case 'SpRate3':
              this.columnHeader = this.columnHeader.map(x => x.replace('SPRateThree', val.DisplayName));
              this.priceColumn.lblSpRate3 = val.DisplayName;
              break;

            case 'SpRate4':
              this.columnHeader = this.columnHeader.map(x => x.replace('SPRateFour', val.DisplayName));
              this.priceColumn.lblSpRate4 = val.DisplayName;
              break;

            case 'SpRate5':
              this.columnHeader = this.columnHeader.map(x => x.replace('SPRateFive', val.DisplayName));
              this.priceColumn.lblSpRate5 = val.DisplayName;
              break;

            case 'R MRP':
              this.columnHeader = this.columnHeader.map(x => x.replace('RetailRate', val.DisplayName));
              this.priceColumn.lblRetailRate = val.DisplayName;
              break;

            case 'W MRP':
              this.columnHeader = this.columnHeader.map(x => x.replace('WholSalRate', val.DisplayName));
              this.priceColumn.lblWholSalRate = val.DisplayName;
              break;

            case 'MRP':
              this.columnHeader = this.columnHeader.map(x => x.replace('MRP', val.DisplayName));
              this.priceColumn.lblMRP = val.DisplayName;
              break;
          }
        }
        this.anchorClick()
      });
  }

  fnSettings() {

    this._purchaseService.onSettings(this.storages.apiUrl)
      .pipe(takeUntil(this._unSubscribeAll))
      .subscribe(res => {
        this.settings = res;
        if (this.settingsName("TaxName") == "VAT") {
          this.tempField.strGSTName = 'TRNo';
        }

        this.txtExpMonthYearFormat   = this.settingsName("ExpMonthYearFormat");
        this.txtSoftwareName         = this.settingsName("ProductName");
        this.txtCustomerForSoftware  = this.settingsName("Customer");
        this.txtAddOrMinus           = this.settingsName("Neethi");
        this.txtMrpInclusiveSales    = this.settingsName("MRPINCLUSIVESALES");
        this.fnBillSeriesGet();   
        this.fnTaxGets();  

      });

  }


  async fnTaxGets() {

    await this._purchaseService.onTaxGets(this.storages)
      .toPromise().then(data => {


        
        this.jsonTaxData = [];
        data.forEach(data => {
          let ReceiptTaxInfo = {}
          ReceiptTaxInfo["TaxId"] = parseFloat(data.TaxID || 0);
          ReceiptTaxInfo["TaxPercent"] = parseFloat(data.TaxPercent || 0);
          ReceiptTaxInfo["TaxAmount"] = 0;
          ReceiptTaxInfo["Amount"] = 0;
          ReceiptTaxInfo["SGSTTaxPers"] = parseFloat(data.SGSTTaxPers || 0);
          ReceiptTaxInfo["SGSTAmount"] = 0;
          ReceiptTaxInfo["SGSTTaxAmount"] = 0;
          ReceiptTaxInfo["CGSTTaxPers"] = parseFloat(data.CGSTTaxPers || 0);
          ReceiptTaxInfo["CGSTAmount"] = 0;
          ReceiptTaxInfo["CGSTTaxAmount"] = 0;
          ReceiptTaxInfo["IGSTTaxPers"] = parseFloat(data.IGSTTaxPers || 0);
          ReceiptTaxInfo["IGSTAmount"] = 0;
          ReceiptTaxInfo["IGSTTaxAmount"] = 0;
          ReceiptTaxInfo["CessAmt"] = 0;
          ReceiptTaxInfo["AdditionalCessAmt"] = 0;
          this.jsonTaxData.push(ReceiptTaxInfo);

        
      });
  });
}

  fnBillSeriesGet() {
    this._purchaseService.onBillSeries_Gets(this.storages)
      .pipe(takeUntil(this._unSubscribeAll))
      .subscribe(res => {
        this.billSeries = JSON.parse(res);
        this.receiptInfoMain.PurBillSerId = parseFloat(this.billSeries[0].PurBillSerId || 0);
        this.purchaseControlOrder();

      })
  }

  anchorClick() {

    // this.ItemDisable = [];
    // this.btnCancel = true;
    
    const purchaseId = this.route.snapshot.paramMap.get('purchaseId');
      const slNo = this.route.snapshot.paramMap.get('slNo');
      if(!purchaseId && !slNo) return;
      let objItem = {purSno: slNo, PurchaseId: purchaseId,
        branchId: this.storages.branchId, apiUrl: this.storages.apiUrl};
      this._purchaseService.onPurchaseBillGet(objItem)
      .pipe(takeUntil(this._unSubscribeAll))
      .subscribe(res => {

        let JsonReceiptTaxInfo = res.JsonReceiptTaxInfo;
        let JsonReceiptInfo = res.JsonReceiptInfo;
        this.receiptInfoMain = JsonReceiptInfo[0];

        this.tempField.purDate = JsonReceiptInfo[0].Receipt_Date1.split('-').reverse().join('/');
        this.receiptInfoMain.Receipt_InvoDate = JsonReceiptInfo[0].Receipt_InvoDate.split('-').reverse().join('/');
        // this.Receipt_Date2 = this.DateRetCopy(JsonReceiptInfo[0].Receipt_Date2);
        this.tempField.gstNo = JsonReceiptInfo[0].GstNo;
        this.tempField.purNo = this.receiptInfoMain.Receipt_SlNo;

        let JsonReceiptDetailInfo = res.JsonReceiptDetailInfo;

        this.dynamicArray = JsonReceiptDetailInfo;

        for (let index = 0; index < JsonReceiptDetailInfo.length; index++) {

          this.dynamicArray[index].count = index;
          this.dynamicArray[index].uniqueRowId = index;
          this.dynamicArray[index].ReceiptSub_Id = index;

          const element = JsonReceiptDetailInfo[index];
          this.dynamicArray[index].Code = { ItemCode: element.Code };
          this.dynamicArray[index].ItemName = { ItemDesc: element.ItemName };
          this.dynamicArray[index].Color = element.ReceiptSub_Field1;

          this.dynamicArray[index].ReceiptSub_Field2 = element.HsnCode;

          // this.dynamicArray[index].count = index + 1;
          this.dynamicArray[index].ReceiptSub_Period = element.ReceiptSub_Period;
          if (this.txtSoftwareName == 'RetailPharma' || this.txtSoftwareName == 'WholeSalePharma' || this.txtExpMonthYearFormat == 'Yes') {
            this.dynamicArray[index].ReceiptSub_ExpDate = this.DateRetExpiryFormat(element.ReceiptSub_ExpDate);
          } else {
            this.dynamicArray[index].ReceiptSub_ExpDate = this.DateRet(element.ReceiptSub_ExpDate);
          }


          // if (parseFloat(element.BillQty) > 0 || parseFloat(element.CorQty) != 0) {

          //   this.ItemDisable[index] = true;
          //   this.btnCancel = false;
          // }
          // if (element.BillQty > 0 || parseFloat(element.CorQty) != 0) {

          // }
          

          let dLandingCost = parseFloat(this.dynamicArray[index].ReceiptSub_LandCost || 0);
          let dPurRate = parseFloat(this.dynamicArray[index].ReceiptSub_BarCode || 0);
          let dMrp = parseFloat(this.dynamicArray[index].ReceiptSub_MRP || 0);
          let dSelRate = parseFloat(this.dynamicArray[index].ReceiptSub_SellRate || 0);
          let dMrpMarginAmt = 0, dMrpMarginPers = 0, dSelRateMarginAmt = 0, dSelRateMarginPers = 100;

          if (dLandingCost > 0) {

            dMrpMarginAmt = dMrp - dLandingCost;
            dMrpMarginPers = (dMrpMarginAmt / dLandingCost) * 100;
            if (this.txtMrpInclusiveSales == 'Yes') {
              dSelRateMarginAmt = dSelRate - dLandingCost;
              if (dLandingCost > 0) {
                dSelRateMarginPers = (dSelRateMarginAmt / dLandingCost) * 100;
              }

            } else {
              dSelRateMarginAmt = dSelRate - dPurRate;
              if (dPurRate > 0) {
                dSelRateMarginPers = (dSelRateMarginAmt / dPurRate) * 100;
              }
            }

          }

          this.dynamicArray[index].txtPurMrpMarginAmt = dMrpMarginAmt.toFixed(2);
          this.dynamicArray[index].txtPurMrpMarginPers = dMrpMarginPers.toFixed(2);
          this.dynamicArray[index].txtPurSelRateMarginPers = dSelRateMarginPers.toFixed(2);
          this.dynamicArray[index].txtSalesMarginAmt = dSelRateMarginAmt.toFixed(2);
         
        }

        if (JsonReceiptInfo[0].Receipt_AddCess) {
          this.receiptInfoMain.Receipt_AddCess = 'Yes';
        } else {
          this.receiptInfoMain.Receipt_AddCess = 'No';
        }
      })
      // Pur_SlNo: params.purSno, PurchaseId: params.PurchaseId, BranchId: params.branchId
  }



  fnGetMaxBillNo() {
    this._purchaseService.onGetMaxBillNo(this.receiptInfoMain.PurBillSerId, this.storages)
      .pipe(takeUntil(this._unSubscribeAll))
      .subscribe(res => {
        let data = JSON.parse(res)
        this.tempField.purNo = data[0].PurBillSerCurrentBillNo;
        if (String(data[0].PurBillSerAddCess).toUpperCase() == 'TRUE') {
          this.receiptInfoMain.Receipt_AddCess = 'Yes';
        }

      })
  }
  
  DateRetExpiryFormat(value) {
    let BillDate = value;
    let BillDate1 = BillDate.split('-');
    let Dates = BillDate1[1] + '/' + BillDate1[0]
    return Dates;
  }

  DateRet(value) {
    let BillDate = value;
    let BillDate1 = BillDate.split('-');
    let Dates = BillDate1[2] + '/' + BillDate1[1] + '/' + BillDate1[0]
    return Dates;
  }


  async onAddCustomer() {
    const modal = await this.modalController.create({
      component: AddCustomerComponent,
      componentProps: {
        searchtype: 'purchase'
      },
      cssClass: 'my-custom-class'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.receiptInfoMain.AC_Id = data.AC_Id;
      this.receiptInfoMain.Receipt_SupplierName = data.AC_Name;
      this.receiptInfoMain.Receipt_Address = data.Addr1;
      this.tempField.gstNo = data.Tin1;
      //  this.suplierValue = {acName: data.AC_Name, address: data.Addr1}
      // this.fncustomerClick(data)

    }
  }

  calenderPicker(date, val) {

    this.ctrlService.onDatePicker(date, val).then(
      date => {
        if (val == "invoice-date")
          this.receiptInfoMain.Receipt_InvoDate = this.dateFormat(date);
        if (val == "purchase-date")
          this.tempField.purDate = this.dateFormat(date);
      },
      err => console.log('Error occurred while getting date: ', err)
    );

  }

  async presentModal() {
    const modal = await this.modalController.create({
      component: PurchaseProductComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        column: this.columnHeader,
        priceColumn: this.priceColumn,
        settings: this.settings,
        mainData: this.receiptInfoMain
      }
    });
    await modal.present();
   const { data } = await modal.onWillDismiss();

    if(data.length) {
      const itemArray = this.dynamicArray.concat(data)
      this.dynamicArray = itemArray;
    }
    // return await modal.present();
  }

  async presentForm(item, index) {

    const modal = await this.modalController.create({
      component: PurchaseFormComponent,
      cssClass: 'my-custom-class',
      componentProps: {
        column: this.columnHeader,
        data: item,
        priceColumn: this.priceColumn,
        settings: this.settings,
        mainData: this.receiptInfoMain
      }
    });

   await modal.present();
   const { data } = await modal.onWillDismiss();

    if(data)
    this.dynamicArray[index] = data;
  }

  dateReverse(value) {
    const dateFormat = value.split('T');
    const date = dateFormat[0].split('-').reverse().join('/');
    return date;
  }

  dateFormat(date) {
    let days = date.getDate();
    let Month = date.getMonth() + 1;
    const Years = date.getFullYear();

    if (days <= 9) {
      days = `0${days}`;
    }
    if (Month <= 9) {
      Month = `0${Month}`;
    }
    const dateFormat = `${days}/${Month}/${Years}`;
    return dateFormat;
  }

  async presentPopover(ev: any, row, index) {
    const popover = await this.popoverController.create({
      component: PopoverComponent,
      // componentProps: {item: row, index: id},
      cssClass: 'my-custom-class',
      event: ev,
      showBackdrop: false
    });


    await popover.present();

    const { data } = await popover.onDidDismiss();
    if(data && data.value == 'edit') {
      this.presentForm(row, index)
    } else if(data && data.value == 'delete') {
      this.onRemoveRow(index)
    }

  }

  onGetTotal() {

    return this.dynamicArray.map(x => parseFloat(x.ReceiptSub_Amount || 0)).reduce((a,b) => a + b)
  }


  onRemoveRow(index) {
    this.dynamicArray.splice(index, 1)
  }

  settingsName = (value) => {
    return this.settings.find(x => x.KeyValue == value).Value
  }


  ngOnDestroy() {
    this._unSubscribeAll.next();
    this._unSubscribeAll.unsubscribe();
  }

 
  ArgSellingRateValidation = [];

  async Alert(value) {
    const alert = await this.alertController.create({
      mode:"ios",
      // subHeader: 'Check',
      message: value,
      buttons: ['OK']
    });
    await alert.present();
  }

  async fnsave(flag) {
   
    this.ArgSellingRateValidation = [];
    // if (!this.bSaveFlag)
    //   return;

    let dBillSerId = this.receiptInfoMain.PurBillSerId;

    if (dBillSerId == 0) {
      this.Alert('Select BillSeries');
      return;
    }

    if (this.receiptInfoMain.Receipt_InvoNo == '') {      this.Alert('Enter Invoice No');
      
      return
    }

    if (this.receiptInfoMain.Receipt_InvoAmt == 0) {
      this.Alert('Enter Inovice Total');    
      return
    }

    console.log('start');
    if (this.receiptInfoMain.AC_Id == 0) {
      this.Alert('Select Supplier');      
      return
    }

  // let invoDate: any = this.datePipe.transform(this.receiptInfoMain.Receipt_InvoDate, 'dd/MM/yyyy');
    let invoDate: any = this.receiptInfoMain.Receipt_InvoDate;
    if (!this.isDateDDMMYYYY(invoDate)) {
      this.Alert('Invalid Invoice Date');
      return
    }

    console.log(this.receiptInfoMain.Receipt_Date2);
    let dueDate: any = this.receiptInfoMain.Receipt_Date2;// this.datePipe.transform(this.receiptInfoMain.Receipt_Date2, 'dd/MM/yyyy');

    if (!this.isDateDDMMYYYY(dueDate)) {
      this.Alert('Invalid Due Date');
      return
    }


    let purDate: any =this.receiptInfoMain.Receipt_Date1;// this.datePipe.transform(this.receiptInfoMain.Receipt_Date1, 'dd/MM/yyyy');

    if (!this.isDateDDMMYYYY(purDate)) {
      this.Alert('Invalid Purchase Date');
      return
    }

    let strsave = 'Yes';
    let scrollPosition = 0;

    // if (this.txtSoftwareName == 'RetailPharma' || this.txtSoftwareName == 'WholeSalePharma') {
    if (this.txtExpMonthYearFormat == 'Yes' || this.txtSoftwareName == 'RetailPharma' || this.txtSoftwareName == 'WholeSalePharma') {
      for (let i = 0; i < this.dynamicArray.length; i++) {
        if (!this.isDateMMYYYY(this.dynamicArray[i].ReceiptSub_ExpDate)) {
          // document.getElementById(`txtExpDate${i}`).focus();
          strsave = 'No';
          scrollPosition = i;
          this.ArgSellingRateValidation[i] = true;
        }
      }

    } else {

      for (let i = 0; i < this.dynamicArray.length; i++) {

        if (!this.isDateDDMMYYYY(this.dynamicArray[i].ReceiptSub_ExpDate)) {
          // document.getElementById(`txtExpDate${i}`).focus();
          strsave = 'No';
          scrollPosition = i;
          this.ArgSellingRateValidation[i] = true;
        }
      }
    }


  

    if (this.txtSoftwareName == 'RetailPharma' &&   this.columnHeader.indexOf('R Mar(%)')> -1 ) {
      for (let i = 0; i < this.dynamicArray.length; i++) {

        let dTempLandingCost = parseFloat(this.dynamicArray[i].ReceiptSub_LandCost || 0);
        let dTempMrp = parseFloat(this.dynamicArray[i].ReceiptSub_MRP || 0);
        let dTempSelRate = parseFloat(this.dynamicArray[i].ReceiptSub_SellRate || 0);

        let dTempMrpMarginAmt = 0, dTempMrpMarginPers = 0, dTempSelRateMarginAmt = 0, dTempSelRateMarginPers = 0;
        if (dTempLandingCost > 0) {
          dTempMrpMarginAmt = dTempMrp - dTempLandingCost;
          dTempMrpMarginPers = (dTempMrpMarginAmt / dTempLandingCost) * 100;
          dTempSelRateMarginAmt = dTempSelRate - dTempLandingCost;
          dTempSelRateMarginPers = (dTempSelRateMarginAmt / dTempLandingCost) * 100;
        }

        if (dTempSelRateMarginPers <= 0 && this.dynamicArray[i].ProductId !== undefined) {
          strsave = 'No';
          scrollPosition = i;
          this.ArgSellingRateValidation[i] = true;

        }
      }

    } else {

      if (this.bCtrlSaleRate) {

        for (let i = 0; i < this.dynamicArray.length; i++) {
          var dTempLandingCost = parseFloat(this.dynamicArray[i].ReceiptSub_BarCode || 0);
          var dTempMrp = parseFloat(this.dynamicArray[i].ReceiptSub_MRP || 0);
          var dTempSelRate = parseFloat(this.dynamicArray[i].ReceiptSub_SellRate || 0);
          var dTempProductId = parseFloat(this.dynamicArray[i].ProductId || 0);
          if (dTempSelRate - dTempLandingCost <= 0 && dTempProductId > 0) {
            strsave = 'No';
            scrollPosition = i;
            this.ArgSellingRateValidation[i] = true;

          }
        }

      }
    }

    if (strsave == 'No') {
      this.Alert('Enter valid SelRate');     
      return;

    }

    

    // Mrp Validation
    if ( this.bCtrlMrp && (this.txtSoftwareName == 'RetailPharma' || this.txtSoftwareName == 'WholeSalePharma') ) {

      for (let i = 0; i < this.dynamicArray.length; i++) {

        var dTempMrp       = parseFloat(this.dynamicArray[i].ReceiptSub_MRP || 0);
        var dTempSelRate   = parseFloat(this.dynamicArray[i].ReceiptSub_SellRate || 0);
        var dTempProductId = parseFloat(this.dynamicArray[i].ProductId || 0);

        if (dTempSelRate > dTempMrp && dTempProductId > 0) {

          strsave = 'No';
          scrollPosition = i;
          this.ArgSellingRateValidation[i] = true;

        }

      }

    }

    if (strsave == 'No') {
      this.Alert('Enter valid Mrp');     
      return;

    }

    let ReceiptInfo = {};
    this.receiptInfoMain.Receipt_SlNo = this.txtCopyBillNo;
    let btnAddCess: any = false;
    if (this.receiptInfoMain.Receipt_AddCess == 'Yes') {
      btnAddCess = true;
    } else {
      btnAddCess = false;
    }

    this.receiptInfoMain.Receipt_AddCess = btnAddCess;

    this.receiptInfoMain.StaffId = parseFloat(this.storages.staffId);
    this.receiptInfoMain.BranchId = parseFloat(this.storages.branchId);
    this.receiptInfoMain.PurBillSerId = Number(this.receiptInfoMain.PurBillSerId);

    this.receiptInfoMain.Receipt_Discount = Number(this.receiptInfoMain.Receipt_Discount || 0);
    this.receiptInfoMain.Receipt_Othercharge = Number(this.receiptInfoMain.Receipt_Othercharge || 0);
    this.receiptInfoMain.Receipt_CST = Number(this.receiptInfoMain.Receipt_CST || 0);
    this.receiptInfoMain.Receipt_InvoAmt = Number(this.receiptInfoMain.Receipt_InvoAmt || 0);
    this.receiptInfoMain.Receipt_ROF = Number(this.receiptInfoMain.Receipt_ROF || 0);
    this.receiptInfoMain.Receipt_Total = Number(this.receiptInfoMain.Receipt_Total || 0);
    this.receiptInfoMain.Excempted = Number(this.receiptInfoMain.Excempted || 0);
    this.receiptInfoMain.MRPValue = Number(this.receiptInfoMain.MRPValue || 0);
    this.receiptInfoMain.PurchaseValue = Number(this.receiptInfoMain.PurchaseValue || 0);
    this.receiptInfoMain.VatCollected = Number(this.receiptInfoMain.VatCollected || 0);
    this.receiptInfoMain.DisAmt = Number(this.receiptInfoMain.DisAmt || 0);
    this.receiptInfoMain.CSTAmt = Number(this.receiptInfoMain.CSTAmt || 0);
    this.receiptInfoMain.WholeSaleRateCalPers = Number(this.receiptInfoMain.WholeSaleRateCalPers || 0);
    this.receiptInfoMain.RetailSaleRateCalPers = Number(this.receiptInfoMain.RetailSaleRateCalPers || 0);
    this.receiptInfoMain.LandingCost = Number(this.receiptInfoMain.LandingCost || 0);
    this.receiptInfoMain.Receipt_Freight = Number(this.receiptInfoMain.Receipt_Freight || 0);
    this.receiptInfoMain.Receipt_PackingChg = Number(this.receiptInfoMain.Receipt_PackingChg || 0);
    this.receiptInfoMain.Receipt_StampingChg = Number(this.receiptInfoMain.Receipt_StampingChg || 0);
    this.receiptInfoMain.Receipt_DbAmt = Number(this.receiptInfoMain.Receipt_DbAmt || 0);


    this.receiptInfoMain.Receipt_OtherTaxPers = Number(this.receiptInfoMain.Receipt_OtherTaxPers || 0);
    this.receiptInfoMain.Receipt_PackingChgTaxPers = Number(this.receiptInfoMain.Receipt_PackingChgTaxPers || 0);
    this.receiptInfoMain.Receipt_StampingChgTaxPers = Number(this.receiptInfoMain.Receipt_StampingChgTaxPers || 0);
    this.receiptInfoMain.Receipt_OtherTaxGrpId = Number(this.receiptInfoMain.Receipt_OtherTaxGrpId || 0);
    this.receiptInfoMain.Receipt_PackingChgTaxGrpId = Number(this.receiptInfoMain.Receipt_PackingChgTaxGrpId || 0);
    this.receiptInfoMain.Receipt_StampingChgTaxGrpId = Number(this.receiptInfoMain.Receipt_StampingChgTaxGrpId || 0);

    this.receiptInfoMain.Receipt_TCSCalValue = Number(this.receiptInfoMain.Receipt_TCSCalValue || 0);

    ReceiptInfo = this.receiptInfoMain;
    ReceiptInfo['Receipt_Date2'] = dueDate
    ReceiptInfo['Receipt_InvoDate'] = invoDate
    ReceiptInfo['Receipt_Date1'] = purDate


    let varArguements = {};
    varArguements = {
      SoftwareName: this.txtSoftwareName, CustomerForSoftware: this.txtCustomerForSoftware,
      AddOrMinus: this.txtAddOrMinus, ExpMonthYearFormat: this.txtExpMonthYearFormat
    };

    let DictionaryObject = { dictArgmts: {} };
    DictionaryObject.dictArgmts = varArguements;

    let ListReceiptDetailsInfo = [];

    this.dynamicArray.forEach(iterator => {

      if (iterator.ProductId != 0 && (iterator.ReceiptSub_ReceiptQty > 0 ||
        iterator.ReceiptSub_ReceiptFree > 0 || iterator.ReceiptSub_LooseQty > 0)) {
        let ReceiptDetailsInfo = {};



        ReceiptDetailsInfo = {
          ReceiptSub_Id: parseFloat(iterator.ReceiptSub_Id || 0), PurchaseId: Number(this.receiptInfoMain.PurchaseId || 0),
          ReceiptSub_BatchSlNo: parseFloat(iterator.ReceiptSub_BatchSlNo || 0), ReceiptSub_Batch: iterator.ReceiptSub_Batch,
          ReceiptSub_Pack: iterator.ReceiptSub_Pack, ReceiptSub_ExpDate: iterator.ReceiptSub_ExpDate,
          ReceiptSub_ReceiptRate: parseFloat(iterator.ReceiptSub_ReceiptRate || 0), ReceiptSub_SellRate: parseFloat(iterator.ReceiptSub_SellRate || 0),
          ReceiptSub_WholeSaleRate: parseFloat(iterator.ReceiptSub_WholeSaleRate || 0), ReceiptSub_MRP: parseFloat(iterator.ReceiptSub_MRP || 0),
          ReceiptSub_PerRate: parseFloat(iterator.ReceiptSub_PerRate || 0), ReceiptSub_PerLandCost: parseFloat(iterator.ReceiptSub_PerLandCost || 0),
          ReceiptSub_PerSelRate: parseFloat(iterator.ReceiptSub_PerSelRate || 0), ReceiptSub_PerMRP: parseFloat(iterator.ReceiptSub_PerMRP || 0),
          ReceiptSub_SaleQty: parseFloat(iterator.ReceiptSub_SaleQty || 0), ReceiptSub_SaleFree: parseFloat(iterator.ReceiptSub_SaleFree || 0),
          ReceiptSub_ReceiptQty: parseFloat(iterator.ReceiptSub_ReceiptQty || 0), ReceiptSub_ReceiptFree: parseFloat(iterator.ReceiptSub_ReceiptFree || 0),
          ReceiptSub_TotalQty: iterator.ReceiptSub_TotalQty, ReceiptSub_NetAmtPerProd: parseFloat(iterator.ReceiptSub_NetAmtPerProd || 0),
          ReceiptSub_Amount: parseFloat(iterator.ReceiptSub_Amount || 0), ReceiptSub_BarCode: parseFloat(iterator.ReceiptSub_BarCode || 0),
          ReceiptSub_TaxPercentage: parseFloat(iterator.ReceiptSub_TaxPercentage || 0), ReceiptSub_TaxAmt: parseFloat(iterator.ReceiptSub_TaxAmt || 0),
          ReceiptSub_ProdDiscount: parseFloat(iterator.ReceiptSub_ProdDiscount || 0), ReceiptSub_TaxOn: iterator.ReceiptSub_TaxOn,
          ReceiptSub_TaxOnFree: iterator.ReceiptSub_TaxOnFree, ReceiptSub_TaxName: iterator.ReceiptSub_TaxName,
          ReceiptSub_WholSalMag: parseFloat(parseFloat(iterator.ReceiptSub_WholSalMag || 0).toFixed(3)), ReceiptSub_RetlMargin: parseFloat(parseFloat(iterator.ReceiptSub_RetlMargin || 0).toFixed(3)),
          ReceiptSub_CstType: iterator.ReceiptSub_CstType, ReceiptSub_Period: this.fngetDateChange(iterator.ReceiptSub_Period),
          ProductId: parseFloat(iterator.ProductId || 0), TaxId: parseFloat(iterator.TaxId || 0), ReceiptSub_LandCost: parseFloat(iterator.ReceiptSub_LandCost || 0),
          ReceiptSub_ProdDisAmt: parseFloat(iterator.ReceiptSub_ProdDisAmt || 0), ReceiptSub_SchemePers: parseFloat(iterator.ReceiptSub_SchemePers || 0),
          ReceiptSub_SchemeAmt: parseFloat(iterator.ReceiptSub_SchemeAmt || 0), ReceiptSub_Freight: parseFloat(iterator.ReceiptSub_Freight || 0),
          ReceiptSub_Frgt: iterator.ReceiptSub_Frgt, ReceiptSub_TotLQty: parseFloat(iterator.ReceiptSub_TotLQty || 0), ReceiptSub_SpRate1: parseFloat(iterator.ReceiptSub_SpRate1 || 0),
          ReceiptSub_SpRate2: parseFloat(iterator.ReceiptSub_SpRate2 || 0), ReceiptSub_SpRate3: parseFloat(iterator.ReceiptSub_SpRate3 || 0), ReceiptSub_SpRate4: parseFloat(iterator.ReceiptSub_SpRate4 || 0),
          ReceiptSub_SpRate5: parseFloat(iterator.ReceiptSub_SpRate5 || 0), ReceiptSub_ActualTaxPers: parseFloat(iterator.ReceiptSub_ActualTaxPers || 0),
          ReceiptSub_NeethiDisPers: parseFloat(iterator.ReceiptSub_NeethiDisPers || 0), ReceiptSub_AmtBeforeTax: parseFloat(iterator.ReceiptSub_AmtBeforeTax || 0),
          ReceiptSub_WRateDis: parseFloat(iterator.ReceiptSub_WRateDis || 0), UniversalCode: iterator.UniversalCode, PurBillSerId: parseFloat(iterator.PurBillSerId || 0),
          ReceiptSub_SGSTTaxPers: parseFloat(iterator.ReceiptSub_SGSTTaxPers || 0), ReceiptSub_SGSTTaxAmount: parseFloat(iterator.ReceiptSub_SGSTTaxAmount || 0),
          ReceiptSub_SGSTAmount: parseFloat(iterator.ReceiptSub_SGSTAmount || 0), ReceiptSub_CGSTTaxPers: parseFloat(iterator.ReceiptSub_CGSTTaxPers || 0),
          ReceiptSub_CGSTTaxAmount: parseFloat(iterator.ReceiptSub_CGSTTaxAmount || 0), ReceiptSub_CGSTAmount: parseFloat(iterator.ReceiptSub_CGSTAmount || 0),
          ReceiptSub_IGSTTaxPers: parseFloat(iterator.ReceiptSub_IGSTTaxPers || 0), ReceiptSub_IGSTTaxAmount: parseFloat(iterator.ReceiptSub_IGSTTaxAmount || 0),
          ReceiptSub_IGSTAmount: parseFloat(iterator.ReceiptSub_IGSTAmount || 0), ReceiptSub_Field2: iterator.ReceiptSub_Field2,
          ReceiptSub_Field1: iterator.Color, ReceiptSub_LooseQty: parseFloat(iterator.ReceiptSub_LooseQty || 0),
          ReceiptSub_CessPers: parseFloat(iterator.ReceiptSub_CessPers || 0), ReceiptSub_CessAmt: parseFloat(iterator.ReceiptSub_CessAmt || 0),
          ReceiptSub_NoField1: this.receiptInfoMain.Receipt_Discount, ReceiptSub_VarFiedl1: iterator.ReceiptSub_VarFiedl1,
          ReceiptSub_ExtraCessPers: parseFloat(iterator.ReceiptSub_ExtraCessPers || 0), ReceiptSub_ExtraCessAmt: parseFloat(iterator.ReceiptSub_ExtraCessAmt || 0),
          ReceiptSub_ProdRemarks: iterator.ReceiptSub_ProdRemarks, ReceiptSub_ReplaceQty: parseFloat(iterator.ReceiptSub_ReplaceQty || 0)
        };
        ListReceiptDetailsInfo.push(ReceiptDetailsInfo);
      }

    });
    if (ListReceiptDetailsInfo.length == 0) {
      this.Alert('Enter Product Details');
      return;
    }
    
    let ListReceiptTaxInfo = [];
    ListReceiptTaxInfo = this.jsonTaxData;

    for (let i in ListReceiptTaxInfo) {
      delete ListReceiptTaxInfo[i].TaxPercent;
      delete ListReceiptTaxInfo[i].ReceiptTaxId;
      delete ListReceiptTaxInfo[i].BranchId;
      delete ListReceiptTaxInfo[i].ReceiptDate;
      delete ListReceiptTaxInfo[i].ReceiptNo;
    }
    ReceiptInfo['ListReceiptDetailsInfo'] = ListReceiptDetailsInfo;
    ReceiptInfo['ListReceiptTaxInfo'] = ListReceiptTaxInfo
    ReceiptInfo['DictionaryObject'] = DictionaryObject;

    console.log( JSON.stringify(ReceiptInfo) );
    if (flag == 'save') {
      if (confirm("Are you sure you want to save  this bill ?")) {

       
        if (this.receiptInfoMain.PurBillSerId > 0 && this.receiptInfoMain.Receipt_SlNo > 0) {
          await this._purchaseService.post(this.storages.apiUrl+ '/Purchase/fnReceiptDetails_StockCheckingForEditPurchase', ReceiptInfo).toPromise()
            .then(data => {
              let jsonStockCheckData = JSON.parse(data);
              if (jsonStockCheckData.length > 0) {
                strsave = "No";
                alert(data);
                
              }
            }, err => console.error(err));
        }

        if (strsave == 'No') {
          this.Alert('mismatch product');

          return
        }
       

        console.log(JSON.stringify(ReceiptInfo));
        await this._purchaseService.post(this.storages.apiUrl+ '/Purchase/fnSave', ReceiptInfo).toPromise().then(async data => {


          if (this.receiptInfoMain.Receipt_SlNo != 0) {
            await this._purchaseService.post(this.storages.apiUrl+ '/Purchase/fnReceiptDetails_RemoveStockToStoreOnSalesQtyOnEdit', ReceiptInfo).toPromise()
              .then(data => {
              });
          }
          this.Alert(data);

         

          

        }).finally(async () => {
          
        }).catch((reason) => console.error(reason));
      } else {
        this.receiptInfoMain.Receipt_Date2 =String( new Date(dueDate.split('/').reverse().join('/')));
        this.receiptInfoMain.Receipt_InvoDate =String( new Date(invoDate.split('/').reverse().join('/')));

      }

    } else {

     
      if (confirm("Are you sure you want to Update  this bill ?")) {
       
        if (this.receiptInfoMain.PurBillSerId > 0 && this.receiptInfoMain.Receipt_SlNo > 0) {

          await this._purchaseService.post(this.storages.apiUrl+ '/Purchase/fnUpdatePurchaseBill', ReceiptInfo).toPromise()
            .then(data => {
              this.Alert(data);
             
            }, err => console.log(err));

        }
       
      } else {
        this.receiptInfoMain.Receipt_Date2    =  String(new Date(dueDate.split('/').reverse().join('/')));
        this.receiptInfoMain.Receipt_InvoDate =  String(new Date(invoDate.split('/').reverse().join('/')));
      }

    }

  }

  isDateMMYYYY(date) {

    var bReturnFlag = false;
    bReturnFlag = _moment(date, "MM/YYYY", true).isValid();
    if (!bReturnFlag) {
      return bReturnFlag
    }

    if (this.txtSoftwareName == 'RetailPharma' || this.txtSoftwareName == 'WholeSalePharma') {
      var today = new Date();
      var mm = today.getMonth() + 1;
      var yyyy = today.getFullYear();
      var ExpDateArg = date.split('/');
      var ExpMon = parseFloat(ExpDateArg[0] || 0);
      var ExpYear = parseFloat(ExpDateArg[1] || 0);
      let purDate: any = this.datePipe.transform(this.receiptInfoMain.Receipt_Date1, 'yyyy-MM-dd');
      var d = new Date(ExpYear, ExpMon, 0).getDate();
      var ExpiryMonthDate = String(d) + "/" + String(ExpMon) + "/" + String(ExpYear);
      var date1 = new Date(ExpYear, ExpMon, d);
      var date2 = new Date(purDate);
      var Time = date1.getTime() - date2.getTime();
      var Days = Time / (1000 * 3600 * 24); //Diference in Days
      if (Days < 0) {
        return false;
      }

    }

    return true;

  }

  fngetDateChange(date) {
    return this.datePipe.transform(date, 'dd/MM/yyyy')
  }
  
  isDateDDMMYYYY(date) {
    var bvalue = false;
    bvalue = _moment(date, "DD/MM/YYYY", true).isValid();
    if (bvalue) {
      var nYear = 0;
      nYear = Number(String(date).split("/")[2] || 0);

      var nCurYear = Number(new Date().getFullYear() || 0);
      if (nCurYear - nYear > 200) {
        bvalue = false;
      }

    }

    return bvalue;
  }

}

