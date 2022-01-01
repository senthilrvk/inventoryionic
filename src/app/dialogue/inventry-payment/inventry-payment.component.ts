import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, NavParams, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { SalesPageService } from 'src/app/sales-billing/sales-page.service';
import { PrintSettings } from 'src/app/printpage/print-settings/print-settings.model';
import { PrinterService } from 'src/app/printpage/printer.service';
import { AddCustomerComponent } from '../add-customer/add-customer.component';
import { PosKeybordComponent } from '../pos-keybord/pos-keybord.component';

@Component({
  selector: 'app-inventry-payment',
  templateUrl: './inventry-payment.component.html',
  styleUrls: ['./inventry-payment.component.scss'],
})
export class InventryPaymentComponent implements OnInit {
  @Input() issueInfoMain: any;
  @Input() issueSub: any[];
  @Input() settings: any;

  baseApiUrl: string;
  dBranchId: any;
  billserice: any[] = [];
  showlist: boolean = false;
  thermalPrintOption: PrintSettings;
  staffId: any = '';
  paytermsData: any;
  
  private _unsubscribeAll: Subject<any>;
  salesmanjson: any[] = [];
  ledgerAmount: number = 0.00;
  ListIssueTaxInfo: any[];
  jsonTaxGet: any;
  times: string;
  loading: boolean = false;
  public storage = new Storage()
  constructor(private modal: ModalController,
    private modalController: ModalController,
    private toastControl: ToastController,
    private appservice: AppService,
    private alertController: AlertController,
    private thermalService: PrinterService,
    private thermalPrint: PrinterService,
   
    private navParams: NavParams,
    private salesService: SalesPageService) {
      this.thermalService.onPrinterGet()
      .subscribe(res => {
      this.thermalPrintOption = res;
      })

    this.storage.create();
    this.storage.forEach((value, key) => {
      if (key == 'sessionInvenStaffId') {
        this.staffId = value;
      } else if (key == 'sessionInvenBranchId') {
        this.dBranchId = value;
      } else if (key == 'sessionsurl') {
        this.baseApiUrl = value;
      } else if (key == 'printer') {
        this.thermalPrintOption = value;
      }

    }).finally(() => {
      
      this.fnBillSeries_Gets();
    })
  }

  ngOnInit() {
    this._unsubscribeAll = new Subject();
    this.issueInfoMain = this.navParams.get('issueMain');    
    this.times = new Date().toLocaleTimeString();
  }
  
  
  async onKeyboard() {
    const modal = await this.modalController.create({
      component: PosKeybordComponent,
      componentProps: {
        view: 'discount',
        value: this.issueInfoMain.Issue_DisPers,
        total: this.issueInfoMain.Issue_Total
      },
      cssClass: 'my-keybord-class'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.issueInfoMain.Issue_DisPers = data;
      
      this.fnAmountCalculation();
    }
    
  }

  async onAddCustomer() {
    
    const modal = await this.modalController.create({
      component: AddCustomerComponent,
      componentProps: {
        billSeriesId: this.issueInfoMain.BillSerId
      },
      cssClass: 'my-custom-class'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.issueInfoMain.Issue_CustName = data.AC_Name
      this.issueInfoMain.AcId = data.AC_Id;
      this.issueInfoMain.Issue_Type = data.PurType
      this.fnGetLeadgerAmtOnAcId(data.AC_Id)
      
      // PriceMenuId      // PriceType
      // Addr1      // AreaId
      // Phone      // PurType      // Tin1
    }
  }
 
  fnBillSeries_Gets() {
    this.salesService.onBillSeriesGets(this.staffId, this.dBranchId, this.baseApiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.billserice = JSON.parse(res);
        if (this.billserice.length) {
            if (this.issueInfoMain.BillSerId) {
              this.billserId = this.issueInfoMain
            } else
             this.billserId =  this.billserice[0];
        }
        this.issueInfoMain.BillSerId = this.billserId.BillSerId;
        this.fnPayTermsGets();
      })
  }

  compareBillSerWith(o1, o2) {
    return o1 && o2 ? o1.BillSerId === o2.BillSerId : o1 === o2;
  }
  comparePayTermsWith(o1, o2) {
    return o1 && o2 ? o1.PayTerms === o2.PayTerms : o1 === o2;
  }

  compareSalesmanWith(o1, o2) {
    return o1 && o2 ? o1.AC_Id === o2.AC_Id : o1 === o2;
  }

  fnPayTermsGets() {
    let BillSerId = this.issueInfoMain.BillSerId;
    
    this.salesService.onPayTermsGets(BillSerId, this.baseApiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        this.paytermsData = JSON.parse(data);
        if (this.issueInfoMain.Issue_PayTerms) {
          this.issueInfoMain.PayTerms = this.issueInfoMain.Issue_PayTerms;
          this.billPayTerms = this.issueInfoMain
        } else
         this.billPayTerms =  this.paytermsData[0];
        this.issueInfoMain.Issue_PayTerms = this.billPayTerms.PayTerms;

      }).finally(() => {
        this.fnSalesManGets();
      })
  }
  billserId: any;
  billPayTerms: any;
  billSalesman: any;

  fnSalesManGets() {

    this.salesService.onSalesManGets(this.dBranchId, this.baseApiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        this.salesmanjson = JSON.parse(data);
        if (this.issueInfoMain.SalesExeId) {
          this.issueInfoMain.AC_Id = this.issueInfoMain.SalesExeId;
          this.billSalesman = this.issueInfoMain
        } else
         this.billSalesman =  this.salesmanjson[0];
      
        this.issueInfoMain.SalesExeId = this.billSalesman.AC_Id;
      }).finally(() => {
        this.fnTaxGets()
      })
  }

  fnTaxGets() {

    this.salesService.onTaxGets(this.baseApiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        this.jsonTaxGet = data;
        this.ListIssueTaxInfo = [];
        let IssueTax = { TaxAmount: 0, Amount: 0, SGSTTaxPers: 0, CGSTTaxPers: 0, IGSTTaxPers: 0 };
        this.jsonTaxGet.forEach(ele => {
          IssueTax = { TaxAmount: 0, Amount: 0, SGSTTaxPers: 0, CGSTTaxPers: 0, IGSTTaxPers: 0 };
          // tslint:disable-next-line: no-string-literal
          IssueTax['TaxId'] = parseFloat(ele.TaxID);
          IssueTax.TaxAmount = 0;
          IssueTax.Amount = 0;
          IssueTax.SGSTTaxPers = ele.SGSTTaxPers;
          IssueTax.CGSTTaxPers = ele.CGSTTaxPers;
          IssueTax.IGSTTaxPers = ele.IGSTTaxPers;
          this.ListIssueTaxInfo.push(IssueTax);
        })

      }).finally(() => {
        
        if (this.issueInfoMain.AcId) {
          this.fnGetLeadgerAmtOnAcId(this.issueInfoMain.AcId)
        }
        this.fnAmountCalculation();
      })

  }

  fnGetLeadgerAmtOnAcId(AcId) {
    
    this.salesService.onGetLeadgerAmtOnAcId(AcId, this.dBranchId, this.baseApiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        const jsonLedger = JSON.parse(data);
        
        this.ledgerAmount = parseFloat(jsonLedger[0].LeaderAmt || 0)
      }).catch(err => {
        console.error(err);
        
      })
  }

  getBillNumber() {
    
    this.salesService.onGetMaxBillNo(this.issueInfoMain.BillSerId, this.dBranchId, this.baseApiUrl)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(res => {
        this.issueInfoMain.billNo = res;
        
    })
  }

  onClose() {
    this.modal.dismiss();
  }

  fnAmountCalculation() {

    let strMrpInclusiveSales = this.settings.MrpInclusiveSales;
    let dTotDisPersAll = 0, dTotDisAmtAll = 0, dIssueTotAmtBeforeTax = 0;
    dTotDisPersAll = Number(this.issueInfoMain.Issue_DisPers || 0);
    this.issueInfoMain.Issue_DisAmt = 0;
    this.issueInfoMain.Issue_RepAmt = 0;
    let dDisAdd = 0, dDisMinus = 0;
    let dQty = 0, dFreeQty = 0, dRate = 0, dSelRate = 0, dMRP = 0, dAmount = 0, dProdId = 0,
      Pack = 0, dWholeSaleRate = 0, dTax = 0, dDisPers = 0, dDisAmt = 0;

    let dTotTaxAmount = 0, dTotAmount = 0, dTotDisPers = 0, dTaxAmt = 0, dAmountBeforeTax = 0,
      dAmoutBeforTaxRowise = 0, dFreight = 0, dLCost = 0;
    let dRateWithTaxPerQty = 0, dPerRate = 0, dPerMrp = 0, dPerTaxAmt = 0, dAmountBeforeDiscount = 0,
      dSchePers = 0, dScheAmt = 0, dPack, dRetQty = 0, dReplAmt = 0, dPerScheAmt;
    let strBatch = '', strTaxOn = '', strType = '', strTaxName = '';
    let dLooseQty = 0, dLooseFreeQty = 0;
    let strTaxOnFree = '';
    let dTotExcempted = 0, dTotMRPValue = 0, dTotVatCollected = 0, dTotSaleValue = 0;
    let dOriginalRate = 0, dAddDisPers = 0, dAgentPrice = 0;
    let dSGSTTaxPers = 0, dSGSTTaxAmount = 0, dSGSTAmount = 0, dCGSTTaxPers = 0,
      dCGSTTaxAmount = 0, dCGSTAmount = 0, dIGSTTaxPers = 0, dIGSTTaxAmount = 0, dIGSTAmount = 0;
    let strSalesType = 'LOCAL';
    dIssueTotAmtBeforeTax = 0;

    const dTempOriginalRate = 0, dTempDisAdd = 0;
    let dCessPers = 0, dCessAmt = 0, dAdditionalCessPers = 0, dAdditionalCessAmt = 0;;

    dTotDisPers = this.issueInfoMain.Issue_DisPers;

    strSalesType = this.issueInfoMain.Issue_Type;

   
    this.issueSub.forEach(oIssueSubDetailsInfoArg => {
      // tslint:disable-next-line: max-line-length
      dQty = dFreeQty = dRate = dSelRate = dMRP = dAmount = dProdId = Pack = dWholeSaleRate = dDisPers = dPerRate = dAmountBeforeDiscount = 0;
      dTotTaxAmount = dTotAmount = dTaxAmt = dAmoutBeforTaxRowise = dFreight = dLCost = 0;
      // tslint:disable-next-line: max-line-length
      dSGSTTaxPers = dSGSTTaxAmount = dSGSTAmount = dCGSTTaxPers = 0, dCGSTTaxAmount = dCGSTAmount = dIGSTTaxPers = dIGSTTaxAmount = dIGSTAmount = 0;
      dCessPers = dCessAmt = 0; dAdditionalCessPers = dAdditionalCessAmt = 0;
      dRateWithTaxPerQty = 0; dPack = 0; dPerMrp = 0; dPerTaxAmt = 0; dLooseFreeQty = 0;
      strBatch = strTaxOn = strTaxName = '';
      strTaxOnFree = 'No';
      strType = '';
      dOriginalRate = 0; dLooseQty = 0; dQty = 0; dLooseFreeQty = 0; dScheAmt = 0;
      dPerScheAmt = 0; dSchePers = 0; dRetQty = 0; dAddDisPers = 0; dAgentPrice = 0;
      strType = '';
      dQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_Qty || 0);
      dFreeQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_FreeQty || 0);
      dRetQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_RQty || 0);

      if (oIssueSubDetailsInfoArg.ProductId !== 0) {
        dPerRate = 0; dPerMrp = 0;
        dQty = 0; dFreeQty = 0; dRetQty = 0;
        dRate = parseFloat(oIssueSubDetailsInfoArg.IssueSub_OriginalRate || 0);
        dOriginalRate = parseFloat(oIssueSubDetailsInfoArg.IssueSub_OriginalRate || 0);
        dPack = parseFloat(oIssueSubDetailsInfoArg.IssueSub_Pack || 0);
        dMRP = parseFloat(oIssueSubDetailsInfoArg.IssueSub_Mrp || 0);
        dTax = parseFloat(oIssueSubDetailsInfoArg.IssueSub_ActualTaxPers || 0);
        strTaxOn = oIssueSubDetailsInfoArg.IssueSub_TaxOn;
        strTaxOnFree = oIssueSubDetailsInfoArg.IssueSub_TaxOnFree;
        strTaxName = oIssueSubDetailsInfoArg.IssueSub_GroupName;
        dDisPers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_PdodDis || 0);
        dSchePers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_SchmPers || 0);
        dRetQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_RQty || 0);
        oIssueSubDetailsInfoArg.IssueSub_ActualRate = parseFloat(oIssueSubDetailsInfoArg.IssueSub_OriginalRate || 0);
        strType = oIssueSubDetailsInfoArg.IssueSub_Type;
        dQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_Qty || 0);
        dFreeQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_FreeQty || 0);
        dRetQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_RQty || 0);
        dAddDisPers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_AddDisPers || 0);
        dAgentPrice = parseFloat(oIssueSubDetailsInfoArg.AgentPrice || 0);

        dSGSTTaxPers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_SGSTTaxPers || 0);
        dCGSTTaxPers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_CGSTTaxPers || 0);
        dIGSTTaxPers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_IGSTTaxPers || 0);
        dCessPers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_CessPers || 0);
        dScheAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_SchmAmt || 0);
        dAdditionalCessPers = parseFloat(oIssueSubDetailsInfoArg.IssueSub_ExtraCessPers || 0);

        strMrpInclusiveSales = oIssueSubDetailsInfoArg.Field2;

        if (dQty > 0 && dScheAmt > 0) {
          dPerScheAmt = dScheAmt / dQty;
        }

        if (oIssueSubDetailsInfoArg.IssueSub_Repl === 'Rep' && this.settings.Softwarename === 'WholeSalePharma') {
          dReplAmt = dReplAmt + (dQty * dMRP);
          oIssueSubDetailsInfoArg.IssueSub_Amount = 0;
          oIssueSubDetailsInfoArg.IssueSub_TaxAmt = 0;
          oIssueSubDetailsInfoArg.IssueSub_SGSTTaxAmount = 0;
          oIssueSubDetailsInfoArg.IssueSub_SGSTAmount = 0;
          oIssueSubDetailsInfoArg.IssueSub_CGSTTaxAmount = 0;
          oIssueSubDetailsInfoArg.IssueSub_CGSTAmount = 0;
          oIssueSubDetailsInfoArg.IssueSub_IGSTTaxAmount = 0;
          oIssueSubDetailsInfoArg.IssueSub_IGSTAmount = 0;
          this.issueInfoMain.Issue_RepAmt = dReplAmt;
          const ID = oIssueSubDetailsInfoArg.IssueSub_Id;

        } else {
          if (dPack === 0) {
            dPack = 1;
            oIssueSubDetailsInfoArg.IssueSub_Pack = 1;
          }

          if (dAddDisPers > 0) {
            dRate = dOriginalRate + ((dOriginalRate * dAddDisPers) / 100);
            dOriginalRate = dOriginalRate + ((dOriginalRate * dAddDisPers) / 100);
          }


          dOriginalRate = dOriginalRate - dPerScheAmt;

          if (strMrpInclusiveSales === 'Yes') {
            if (strTaxOn === 'MRP Inclusive') {
              dRate = dOriginalRate - ((dMRP * dTax) / (100 + dTax));
              oIssueSubDetailsInfoArg.IssueSub_ActualRate = dRate;
            } else {
              dRate = dOriginalRate - ((dOriginalRate * dTax) / (100 + dTax));
              oIssueSubDetailsInfoArg.IssueSub_ActualRate = dRate;
            }
            if (this.settings.bAdditionalCessInclusiveInSales) {
              dRate = dOriginalRate - ((dOriginalRate * (dTax + dAdditionalCessPers)) / (100 + dTax + dAdditionalCessPers));
              oIssueSubDetailsInfoArg.IssueSub_ActualRate = dRate;
            }
            if (this.settings.bCessInclusiveInSales && strSalesType != "INTERSTATE") {
              dAgentPrice = dAgentPrice - ((dAgentPrice * dCessPers) / (100 + dCessPers));
              oIssueSubDetailsInfoArg.AgentPrice = dRate;
            }
            if (this.settings.bCessInclusiveInSales && this.issueInfoMain.Issue_AddCessFlag && strType !== 'INTERSTATE') {
              if (this.settings.bAdditionalCessInclusiveInSales) {
                dRate = dOriginalRate - ((dOriginalRate * (dTax + dCessPers + dAdditionalCessPers)) / (100 + dTax + dCessPers + dAdditionalCessPers));
              } else {
                dRate = dOriginalRate - ((dOriginalRate * (dTax + dCessPers)) / (100 + dTax + dCessPers));
              }
              oIssueSubDetailsInfoArg.IssueSub_ActualRate = dRate;
            }

          } else { dRate = dRate - dPerScheAmt; }

          if (strMrpInclusiveSales === 'Yes') {


            if (strTaxOn === 'MRP Inclusive') {

              dAgentPrice = dAgentPrice - ((dMRP * dTax) / (100 + dTax));
              oIssueSubDetailsInfoArg.AgentPrice = dAgentPrice;

            } else {

              dAgentPrice = dAgentPrice - ((dAgentPrice * dTax) / (100 + dTax));
              oIssueSubDetailsInfoArg.AgentPrice = dAgentPrice;

            }

            if (this.settings.bCessInclusiveInSales && strType !== 'INTERSTATE') {
              dAgentPrice = dAgentPrice - ((dAgentPrice * dCessPers) / (100 + dCessPers));
              oIssueSubDetailsInfoArg.AgentPrice = dRate;
            }

          }

          dQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_Qty || 0);
          dFreeQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_FreeQty || 0);
          dRetQty = parseFloat(oIssueSubDetailsInfoArg.IssueSub_RQty || 0);

          dQty = dQty - dRetQty;


          dRate = dRate + ((dRate * dDisAdd) / 100);
          dPerRate = dPerRate + ((dPerRate * dDisAdd) / 100);

          dRateWithTaxPerQty = dRate;
          dAmoutBeforTaxRowise = (dRate * dQty) + (dPerRate * dLooseQty);
          dAmoutBeforTaxRowise = dAmoutBeforTaxRowise - ((dAmoutBeforTaxRowise * dDisPers) / 100);
          dAmountBeforeDiscount = (dRate * dQty);
          dAmountBeforeDiscount = dAmountBeforeDiscount - ((dAmountBeforeDiscount * dDisPers) / 100);


          dDisAmt = (((dRate * dQty) * dDisPers) / 100);
          dDisAmt += (((dPerRate * dLooseQty) * dDisPers) / 100);

          dRate = dRate - ((dRate * dDisPers) / 100);
          dPerRate = dPerRate - ((dPerRate * dDisPers) / 100);

          dAmountBeforeTax += (dRate * dQty);
          dAmountBeforeTax += dPerRate * dLooseQty;
          dIssueTotAmtBeforeTax = dAmountBeforeTax;

          dRate = dRate - ((dRate * dTotDisPers) / 100);
          dPerRate = dPerRate - ((dPerRate * dTotDisPers) / 100);
          dAmountBeforeDiscount += (dPerRate * dLooseQty);

          dRate = dRate - ((dRate * dDisMinus) / 100);
          dPerRate = dPerRate - ((dPerRate * dDisMinus) / 100);

          if (strSalesType === 'INTERSTATE') {
            dIGSTTaxAmount = dQty * ((dRate * dIGSTTaxPers) / 100);
            dIGSTAmount = dQty * dRate;

            if (strTaxOnFree === 'Yes') {
              dIGSTAmount += (dFreeQty * dRate);
              dIGSTTaxAmount += (dFreeQty * ((dRate * dIGSTTaxPers) / 100));
            }
          } else {
            dSGSTTaxAmount = dQty * ((dRate * dSGSTTaxPers) / 100);
            dSGSTAmount = dQty * dRate;
            dCGSTTaxAmount = dQty * ((dRate * dCGSTTaxPers) / 100);
            dCGSTAmount = dQty * dRate;
            if (strTaxOnFree === 'Yes') {

              dSGSTAmount += (dFreeQty * dRate);
              dSGSTTaxAmount += (dFreeQty * ((dRate * dSGSTTaxPers) / 100));

              dCGSTAmount += (dFreeQty * dRate);
              dCGSTTaxAmount += (dFreeQty * ((dRate * dCGSTTaxPers) / 100));
            }
          }

          if (strType === 'LOCAL' && strTaxName === 'MEDICINE') {
            if (strTaxOn === 'MRP Inclusive') {

              dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = 1 * ((dPerMrp * dTax) / (100 + dTax));
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = dLooseQty * ((dPerMrp * dTax) / (100 + dTax));
              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dMRP * dTax) / (100 + dTax));
                dPerTaxAmt += dLooseFreeQty * ((dPerMrp * dTax) / (100 + dTax));
              }
            } else {
              dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = 1 * ((dPerMrp * dTax) / (100 + dTax));
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dRate * dTax) / 100);
              dPerTaxAmt = dLooseQty * ((dPerRate * dTax) / 100);
              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dRate * dTax) / 100);
                dPerTaxAmt += dLooseFreeQty * ((dPerRate * dTax) / 100);
              }
            }
            dTotExcempted += (dQty * dRate) + dTaxAmt;

          } else if (strType === 'INTERSTATE' && strTaxName === 'MEDICINE') {
            dTotMRPValue += (dQty * dMRP) + (dPerMrp * dLooseQty);
            if (strTaxOn === 'MRP Inclusive') {
              dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = 1 * ((dPerMrp * dTax) / (100 + dTax));
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = dLooseQty * ((dPerMrp * dTax) / (100 + dTax));
              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dMRP * dTax) / (100 + dTax));
                dPerTaxAmt += dLooseFreeQty * ((dPerMrp * dTax) / (100 + dTax));
                dTotMRPValue += (dFreeQty * dMRP);
              }
            } else {
              dTaxAmt = 1 * ((dRate * dTax) / 100);
              dPerTaxAmt = 1 * ((dPerRate * dTax) / 100);
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dRate * dTax) / 100);
              dPerTaxAmt = dLooseQty * ((dPerRate * dTax) / 100);
              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dRate * dTax) / 100);
                dPerTaxAmt += dLooseFreeQty * ((dPerRate * dTax) / 100);
              }
            }

            dTotVatCollected += dTaxAmt + dPerTaxAmt;
            dTotSaleValue += (dQty * dRate) + (dPerRate * dLooseQty);
          } else if (strType === 'INTERSTATE') {
            if (strTaxOn === 'MRP Inclusive') {
              dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = 1 * ((dPerMrp * dTax) / (100 + dTax));
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = dLooseQty * ((dPerMrp * dTax) / (100 + dTax));

              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dMRP * dTax) / (100 + dTax));
                dPerTaxAmt += dLooseFreeQty * ((dPerMrp * dTax) / (100 + dTax));
              }
            } else {

              dTaxAmt = 1 * ((dRate * dTax) / 100);
              dPerTaxAmt = 1 * ((dPerRate * dTax) / 100);
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dRate * dTax) / 100);
              dPerTaxAmt = dLooseQty * ((dPerRate * dTax) / 100);

              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dRate * dTax) / 100);
                dPerTaxAmt += dLooseFreeQty * ((dPerRate * dTax) / 100);
              }
            }
          } else {
            if (strTaxOn === 'MRP Inclusive') {
              dTaxAmt = 1 * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = 1 * ((dPerMrp * dTax) / (100 + dTax));
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dMRP * dTax) / (100 + dTax));
              dPerTaxAmt = dLooseQty * ((dPerMrp * dTax) / (100 + dTax));
              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dMRP * dTax) / (100 + dTax));
                dPerTaxAmt += dLooseFreeQty * ((dPerMrp * dTax) / (100 + dTax));
              }
            } else {

              dTaxAmt = 1 * ((dRate * dTax) / 100);
              dPerTaxAmt = 1 * ((dPerRate * dTax) / 100);
              dRateWithTaxPerQty = dRateWithTaxPerQty + dTaxAmt;
              dTaxAmt = dQty * ((dRate * dTax) / 100);
              dPerTaxAmt = dLooseQty * ((dPerRate * dTax) / 100);

              if (strTaxOnFree === 'Yes') {
                dTaxAmt += dFreeQty * ((dRate * dTax) / 100);
                dPerTaxAmt += dLooseFreeQty * ((dPerRate * dTax) / 100);
              }

            }

          }

          if (this.issueInfoMain.Issue_AddCessFlag && strType !== 'INTERSTATE') {

            dCessAmt = (dRate * dQty * dCessPers) / 100;
          }

          dAdditionalCessAmt = (dRate * dQty * dAdditionalCessPers) / 100;
          dAmount = (dRate * dQty) + (dPerRate * dLooseQty) + dTaxAmt + dPerTaxAmt + dCessAmt + dAdditionalCessAmt;
          if (strMrpInclusiveSales === 'Yes' && this.settings.Softwarename === 'RetailPharma') {
            dAmountBeforeDiscount = dOriginalRate * dQty;
          } else {
            dAmountBeforeDiscount += dTaxAmt + dPerTaxAmt + dCessAmt;
          }

          
            if ((dQty + dFreeQty) > 0) {
              dLCost = ((dAmount / (dQty + dFreeQty)) + (dFreight));
            } else {
              dLCost = 0;
            }
          

          dTaxAmt = dTaxAmt + dPerTaxAmt;


          oIssueSubDetailsInfoArg.IssueSub_Amount = dAmount;
          oIssueSubDetailsInfoArg.IssueSub_TaxAmt = dTaxAmt;
          // oIssueSubDetailsInfoArg.issuesub_ = dLCost;
          oIssueSubDetailsInfoArg.IssueSub_SelRate = dRateWithTaxPerQty;
          oIssueSubDetailsInfoArg.IssueSub_AmountBeforeTax = dAmoutBeforTaxRowise;
          // this.IssueInfo.MRPValue = dTotMRPValue;
          // this.IssueInfo.VatCollected = dTotVatCollected;
          // this.IssueInfo.SaleValue = dTotSaleValue;
          // this.IssueInfo.ExcemptedValue = dTotExcempted;
          oIssueSubDetailsInfoArg.IssueSub_AmountBeforeTax = dAmoutBeforTaxRowise;
          oIssueSubDetailsInfoArg.IssueSub_ProdDisAmt = dDisAmt;
          oIssueSubDetailsInfoArg.IssueSub_AmountBeforeDis = dAmountBeforeDiscount;
          oIssueSubDetailsInfoArg.IssueSub_Exmpvatncess = dAmoutBeforTaxRowise;

          oIssueSubDetailsInfoArg.IssueSub_SGSTTaxAmount = dSGSTTaxAmount;
          oIssueSubDetailsInfoArg.IssueSub_SGSTAmount = dSGSTAmount;
          oIssueSubDetailsInfoArg.IssueSub_CGSTTaxAmount = dCGSTTaxAmount;
          oIssueSubDetailsInfoArg.IssueSub_CGSTAmount = dCGSTAmount;
          oIssueSubDetailsInfoArg.IssueSub_IGSTTaxAmount = dIGSTTaxAmount;
          oIssueSubDetailsInfoArg.IssueSub_IGSTAmount = dIGSTAmount;
          oIssueSubDetailsInfoArg.IssueSub_CessAmt = dCessAmt;
          oIssueSubDetailsInfoArg.IssueSub_ExtraCessPers = dAdditionalCessPers;
          oIssueSubDetailsInfoArg.IssueSub_ExtraCessAmt = dAdditionalCessAmt;
          // if ($('#ddlAgentRateType').val() == $('#cbDiffPrice').val())
          //     oIssueSubDetailsInfoArg.Agent_SubAmount = dAmount - dTaxAmt-dCessAmt;
          // else
          oIssueSubDetailsInfoArg.Agent_SubAmount = dQty * dAgentPrice;


          if (strType === 'LOCAL' && strTaxName === 'MEDICINE') {
            oIssueSubDetailsInfoArg.IssueSub_TaxAmt = 0;
            oIssueSubDetailsInfoArg.IssueSub_TaxPers = 0;
          }

          const ID = oIssueSubDetailsInfoArg.IssueSub_Id;

        }

      }


    });


   
    if (dTotDisPersAll > 0) {
      dTotDisAmtAll = (dIssueTotAmtBeforeTax * dTotDisPers) / 100;
      this.issueInfoMain.Issue_DisAmt = dTotDisAmtAll;
    }

    this.fnGetFinalTotal();

  }
  
 
  fnGetFinalTotal() {
    if (this.issueSub == null) {
      return;
    }
    // tslint:disable-next-line:prefer-const
    let strSoftwareName = '', strCustomerForSoftware = '', strAddOrMinus = '',
      // tslint:disable-next-line:prefer-const
      strMrpInclusiveSales = '', strTaxIncluded = '', strRof = '', strSalesType = '';


    strSalesType = this.issueInfoMain.Issue_Type;


    let dTotAmt = 0, dAmt = 0, dTaxAmt = 0, dTotTaxAmt = 0, dTotRetAmt = 0;
    let dTaxAmt1 = 0, dTaxAmt2 = 0, dTaxAmt3 = 0, dTaxAmt4 = 0, dTaxAmt5 = 0, dTaxId, dSalesRetAmt = 0, dPointValue = 0;
    let dAmt1 = 0, dAmt2 = 0, dAmt3 = 0, dAmt4 = 0, dAmt5 = 0, dOtherCharge = 0,
      dFreight = 0, dCreditNoteAmt = 0, dExpiryAmt = 0, dTotAgentPrice = 0;
    const strType = '';
    let dTaxAmt6 = 0, dTaxAmt7 = 0, dTaxAmt8 = 0, dTaxAmt9 = 0, dTaxAmt10 = 0,
      dTaxAmt11 = 0, dTaxAmt12 = 0, dTaxAmt13 = 0, dTaxAmt14 = 0, dTaxAmt15 = 0;
    let dAmt6 = 0, dAmt7 = 0, dAmt8 = 0, dAmt9 = 0, dAmt10 = 0, dAmt11 = 0, dAmt12 = 0, dAmt13 = 0, dAmt14 = 0, dAmt15 = 0;

    let dSGSTTaxAmt = 0, dCGSTTaxAmt = 0, dIGSTTaxAmt = 0, dSGSTAmt = 0, dCGSTAmt = 0, dIGSTAmt = 0;
    let dSGSTTaxAmt1 = 0, dSGSTTaxAmt2 = 0, dSGSTTaxAmt3 = 0, dSGSTTaxAmt4 = 0,
      dSGSTTaxAmt5 = 0, dSGSTTaxAmt6 = 0, dSGSTTaxAmt7 = 0, dSGSTTaxAmt8 = 0, dSGSTTaxAmt9 = 0,
      dSGSTTaxAmt10 = 0, dSGSTTaxAmt11 = 0, dSGSTTaxAmt12 = 0, dSGSTTaxAmt13 = 0, dSGSTTaxAmt14 = 0, dSGSTTaxAmt15 = 0;
    let dCGSTTaxAmt1 = 0, dCGSTTaxAmt2 = 0, dCGSTTaxAmt3 = 0, dCGSTTaxAmt4 = 0,
      dCGSTTaxAmt5 = 0, dCGSTTaxAmt6 = 0, dCGSTTaxAmt7 = 0, dCGSTTaxAmt8 = 0, dCGSTTaxAmt9 = 0,
      dCGSTTaxAmt10 = 0, dCGSTTaxAmt11 = 0, dCGSTTaxAmt12 = 0, dCGSTTaxAmt13 = 0, dCGSTTaxAmt14 = 0, dCGSTTaxAmt15 = 0;
    let dIGSTTaxAmt1 = 0, dIGSTTaxAmt2 = 0, dIGSTTaxAmt3 = 0, dIGSTTaxAmt4 = 0,
      dIGSTTaxAmt5 = 0, dIGSTTaxAmt6 = 0, dIGSTTaxAmt7 = 0, dIGSTTaxAmt8 = 0, dIGSTTaxAmt9 = 0,
      dIGSTTaxAmt10 = 0, dIGSTTaxAmt11 = 0, dIGSTTaxAmt12 = 0, dIGSTTaxAmt13 = 0, dIGSTTaxAmt14 = 0, dIGSTTaxAmt15 = 0;

    let dSGSTAmt1 = 0, dSGSTAmt2 = 0, dSGSTAmt3 = 0, dSGSTAmt4 = 0, dSGSTAmt5 = 0, dSGSTAmt6 = 0,
      dSGSTAmt7 = 0, dSGSTAmt8 = 0, dSGSTAmt9 = 0, dSGSTAmt10 = 0, dSGSTAmt11 = 0, dSGSTAmt12 = 0,
      dSGSTAmt13 = 0, dSGSTAmt14 = 0, dSGSTAmt15 = 0;
    let dCGSTAmt1 = 0, dCGSTAmt2 = 0, dCGSTAmt3 = 0, dCGSTAmt4 = 0, dCGSTAmt5 = 0, dCGSTAmt6 = 0,
      dCGSTAmt7 = 0, dCGSTAmt8 = 0, dCGSTAmt9 = 0, dCGSTAmt10 = 0, dCGSTAmt11 = 0, dCGSTAmt12 = 0,
      dCGSTAmt13 = 0, dCGSTAmt14 = 0, dCGSTAmt15 = 0;
    let dIGSTAmt1 = 0, dIGSTAmt2 = 0, dIGSTAmt3 = 0, dIGSTAmt4 = 0, dIGSTAmt5 = 0, dIGSTAmt6 = 0,
      dIGSTAmt7 = 0, dIGSTAmt8 = 0, dIGSTAmt9 = 0, dIGSTAmt10 = 0, dIGSTAmt11 = 0, dIGSTAmt12 = 0,
      dIGSTAmt13 = 0, dIGSTAmt14 = 0, dIGSTAmt15 = 0;

    let dOtherChgTaxAmt = 0, dOtherChgSGST = 0, dOtherChgCGST = 0, dOtherChgIGST = 0,
      dCourierChgTaxAmt = 0, dCourierChgSGST = 0, dCourierChgCGST = 0, dCourierChgIGST = 0;
    let dOtherChgTaxPers = 0, dCourierChgTaxPers = 0;

    let dCessAmt1 = 0, dCessAmt2 = 0, dCessAmt3 = 0, dCessAmt4 = 0, dCessAmt5 = 0, dCessAmt6 = 0,
      dCessAmt7 = 0, dCessAmt8 = 0, dCessAmt9 = 0, dCessAmt10 = 0;
    let dCessAmt11 = 0, dCessAmt12 = 0, dCessAmt13 = 0, dCessAmt14 = 0, dCessAmt15 = 0;
    let dRowCessAmt = 0; let dRowAdditionalCessAmt = 0;
    let dAdditionalCessAmt1 = 0, dAdditionalCessAmt2 = 0, dAdditionalCessAmt3 = 0, dAdditionalCessAmt4 = 0;
    let dAdditionalCessAmt5 = 0, dAdditionalCessAmt6 = 0, dAdditionalCessAmt7 = 0, dAdditionalCessAmt8 = 0;
    let dAdditionalCessAmt9 = 0, dAdditionalCessAmt10 = 0, dAdditionalCessAmt11 = 0, dAdditionalCessAmt12 = 0;
    let dAdditionalCessAmt13 = 0, dAdditionalCessAmt14 = 0, dAdditionalCessAmt15 = 0;
    const strOtherTaxCondition = this.settings.OtherAmtTaxCalculation;
    dOtherChgTaxPers = this.issueInfoMain.Issue_OtherTaxPers;
    dCourierChgTaxPers = this.issueInfoMain.Issue_CourierTaxPers;

    this.issueSub.forEach(oIssueSubDetailsInfoArg => {

      if (oIssueSubDetailsInfoArg.ProductId !== 0) {
        dAmt = dTaxAmt = 0;
        dSGSTTaxAmt = 0;
        dCGSTTaxAmt = 0;
        dIGSTTaxAmt = 0;
        dSGSTAmt = 0;
        dCGSTAmt = 0;
        dIGSTAmt = 0;

        if (oIssueSubDetailsInfoArg.IssueSub_Amount !== 0) {
          if (strSoftwareName === 'RetailPharma') {
            dTotAmt += parseFloat(parseFloat(oIssueSubDetailsInfoArg.IssueSub_Amount).toFixed(3));
          } else {
            dTotAmt += parseFloat(parseFloat(oIssueSubDetailsInfoArg.IssueSub_Amount).toFixed(2));
          }
          dAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_Amount || 0);
          if (oIssueSubDetailsInfoArg.Color === 'R') {
            dTotRetAmt += oIssueSubDetailsInfoArg.IssueSub_Amount;
          }
          dTaxAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_TaxAmt || 0);
          dTotTaxAmt += dTaxAmt;
          dTotAgentPrice += parseFloat(oIssueSubDetailsInfoArg.Agent_SubAmount || 0);
          dSGSTTaxAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_SGSTTaxAmount || 0);
          dCGSTTaxAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_CGSTTaxAmount || 0);
          dIGSTTaxAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_IGSTTaxAmount || 0);
          dSGSTAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_SGSTAmount || 0);
          dCGSTAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_CGSTAmount || 0);
          dIGSTAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_IGSTAmount || 0);
          dRowCessAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_CessAmt || 0);
          dRowAdditionalCessAmt = parseFloat(oIssueSubDetailsInfoArg.IssueSub_ExtraCessAmt || 0);
        }
        if (oIssueSubDetailsInfoArg.TaxId !== 0 && oIssueSubDetailsInfoArg.TaxId !== 0 &&
          oIssueSubDetailsInfoArg.IssueSub_GroupName !== 'MEDICINE') {
          dTaxId = oIssueSubDetailsInfoArg.TaxId;
          if (dTaxId === 1) {
            dTaxAmt1 += dTaxAmt;
            dCessAmt1 += dRowCessAmt;
            dAdditionalCessAmt1 += dRowAdditionalCessAmt;
            dAmt1 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt1 += dSGSTTaxAmt;
            dCGSTTaxAmt1 += dCGSTTaxAmt;
            dIGSTTaxAmt1 += dIGSTTaxAmt;
            dSGSTAmt1 += dSGSTAmt;
            dCGSTAmt1 += dCGSTAmt;
            dIGSTAmt1 += dIGSTAmt;
          } else if (dTaxId === 2) {
            dTaxAmt2 += dTaxAmt;
            dCessAmt2 += dRowCessAmt;
            dAdditionalCessAmt2 += dRowAdditionalCessAmt;
            dAmt2 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dCGSTTaxAmt2 += dCGSTTaxAmt;
            dIGSTTaxAmt2 += dIGSTTaxAmt;
            dSGSTAmt2 += dSGSTAmt;
            dCGSTAmt2 += dCGSTAmt;
            dIGSTAmt2 += dIGSTAmt;
          } else if (dTaxId === 3) {
            dTaxAmt3 += dTaxAmt;
            dCessAmt3 += dRowCessAmt;
            dAdditionalCessAmt3 += dRowAdditionalCessAmt;
            dAmt3 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt3 += dSGSTTaxAmt;
            dCGSTTaxAmt3 += dCGSTTaxAmt;
            dIGSTTaxAmt3 += dIGSTTaxAmt;
            dSGSTAmt3 += dSGSTAmt;
            dCGSTAmt3 += dCGSTAmt;
            dIGSTAmt3 += dIGSTAmt;
          } else if (dTaxId === 4) {
            dTaxAmt4 += dTaxAmt;
            dCessAmt4 += dRowCessAmt;
            dAdditionalCessAmt4 += dRowAdditionalCessAmt;
            dAmt4 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt4 += dSGSTTaxAmt;
            dCGSTTaxAmt4 += dCGSTTaxAmt;
            dIGSTTaxAmt4 += dIGSTTaxAmt;
            dSGSTAmt4 += dSGSTAmt;
            dCGSTAmt4 += dCGSTAmt;
            dIGSTAmt4 += dIGSTAmt;
          } else if (dTaxId === 5) {
            dTaxAmt5 += dTaxAmt;
            dCessAmt5 += dRowCessAmt;
            dAdditionalCessAmt5 += dRowAdditionalCessAmt;
            dAmt5 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt5 += dSGSTTaxAmt;
            dCGSTTaxAmt5 += dCGSTTaxAmt;
            dIGSTTaxAmt5 += dIGSTTaxAmt;
            dSGSTAmt5 += dSGSTAmt;
            dCGSTAmt5 += dCGSTAmt;
            dIGSTAmt5 += dIGSTAmt;
          } else if (dTaxId === 6) {

            dTaxAmt6 += dTaxAmt;
            dCessAmt6 += dRowCessAmt;
            dAdditionalCessAmt6 += dRowAdditionalCessAmt;
            dAmt6 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt6 += dSGSTTaxAmt;
            dCGSTTaxAmt6 += dCGSTTaxAmt;
            dIGSTTaxAmt6 += dIGSTTaxAmt;
            dSGSTAmt6 += dSGSTAmt;
            dCGSTAmt6 += dCGSTAmt;
            dIGSTAmt6 += dIGSTAmt;
          } else if (dTaxId === 7) {

            dTaxAmt7 += dTaxAmt;
            dCessAmt7 += dRowCessAmt;
            dAdditionalCessAmt7 += dRowAdditionalCessAmt;
            dAmt7 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt7 += dSGSTTaxAmt;
            dCGSTTaxAmt7 += dCGSTTaxAmt;
            dIGSTTaxAmt7 += dIGSTTaxAmt;
            dSGSTAmt7 += dSGSTAmt;
            dCGSTAmt7 += dCGSTAmt;
            dIGSTAmt7 += dIGSTAmt;
          } else if (dTaxId === 8) {
            dTaxAmt8 += dTaxAmt;
            dCessAmt8 += dRowCessAmt;
            dAdditionalCessAmt8 += dRowAdditionalCessAmt;
            dAmt8 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt8 += dSGSTTaxAmt;
            dCGSTTaxAmt8 += dCGSTTaxAmt;
            dIGSTTaxAmt8 += dIGSTTaxAmt;
            dSGSTAmt8 += dSGSTAmt;
            dCGSTAmt8 += dCGSTAmt;
            dIGSTAmt8 += dIGSTAmt;

          } else if (dTaxId === 9) {
            dTaxAmt9 += dTaxAmt;
            dCessAmt9 += dRowCessAmt;
            dAdditionalCessAmt9 += dRowAdditionalCessAmt;
            dAmt9 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt9 += dSGSTTaxAmt;
            dCGSTTaxAmt9 += dCGSTTaxAmt;
            dIGSTTaxAmt9 += dIGSTTaxAmt;
            dSGSTAmt9 += dSGSTAmt;
            dCGSTAmt9 += dCGSTAmt;
            dIGSTAmt9 += dIGSTAmt;
          } else if (dTaxId === 10) {
            dTaxAmt10 += dTaxAmt;
            dCessAmt10 += dRowCessAmt;
            dAdditionalCessAmt10 += dRowAdditionalCessAmt;
            dAmt10 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt10 += dSGSTTaxAmt;
            dCGSTTaxAmt10 += dCGSTTaxAmt;
            dIGSTTaxAmt10 += dIGSTTaxAmt;
            dSGSTAmt10 += dSGSTAmt;
            dCGSTAmt10 += dCGSTAmt;
            dIGSTAmt10 += dIGSTAmt;
          } else if (dTaxId === 11) {
            dTaxAmt11 += dTaxAmt;
            dCessAmt11 += dRowCessAmt;
            dAdditionalCessAmt11 += dRowAdditionalCessAmt;
            dAmt11 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt11 += dSGSTTaxAmt;
            dCGSTTaxAmt11 += dCGSTTaxAmt;
            dIGSTTaxAmt11 += dIGSTTaxAmt;
            dSGSTAmt11 += dSGSTAmt;
            dCGSTAmt11 += dCGSTAmt;
            dIGSTAmt11 += dIGSTAmt;
          } else if (dTaxId === 12) {
            dTaxAmt12 += dTaxAmt;
            dCessAmt12 += dRowCessAmt;
            dAdditionalCessAmt12 += dRowAdditionalCessAmt;
            dAmt12 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt12 += dSGSTTaxAmt;
            dCGSTTaxAmt12 += dCGSTTaxAmt;
            dIGSTTaxAmt12 += dIGSTTaxAmt;
            dSGSTAmt12 += dSGSTAmt;
            dCGSTAmt12 += dCGSTAmt;
            dIGSTAmt12 += dIGSTAmt;
          } else if (dTaxId === 13) {
            dTaxAmt13 += dTaxAmt;
            dCessAmt13 += dRowCessAmt;
            dAdditionalCessAmt13 += dRowAdditionalCessAmt;
            dAmt13 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt13 += dSGSTTaxAmt;
            dCGSTTaxAmt13 += dCGSTTaxAmt;
            dIGSTTaxAmt13 += dIGSTTaxAmt;
            dSGSTAmt13 += dSGSTAmt;
            dCGSTAmt13 += dCGSTAmt;
            dIGSTAmt13 += dIGSTAmt;
          } else if (dTaxId === 14) {
            dTaxAmt14 += dTaxAmt;
            dCessAmt14 += dRowCessAmt;
            dAdditionalCessAmt14 += dRowAdditionalCessAmt;
            dAmt14 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dSGSTTaxAmt14 += dSGSTTaxAmt;
            dCGSTTaxAmt14 += dCGSTTaxAmt;
            dIGSTTaxAmt14 += dIGSTTaxAmt;
            dSGSTAmt14 += dSGSTAmt;
            dCGSTAmt14 += dCGSTAmt;
            dIGSTAmt14 += dIGSTAmt;
          } else if (dTaxId === 15) {
            dTaxAmt15 += dTaxAmt;
            dCessAmt15 += dRowCessAmt;
            dAdditionalCessAmt15 += dRowAdditionalCessAmt;
            dAmt15 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
            dCGSTTaxAmt15 += dCGSTTaxAmt;
            dIGSTTaxAmt15 += dIGSTTaxAmt;
            dSGSTAmt15 += dSGSTAmt;
            dCGSTAmt15 += dCGSTAmt;
            dIGSTAmt15 += dIGSTAmt;
          }

        }
      }
    });


    this.ListIssueTaxInfo.forEach(oIssueTaxInfoArg => {

      if (oIssueTaxInfoArg.TaxId === 1) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt1;
        oIssueTaxInfoArg.Amount = dAmt1;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt1;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt1;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt1;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt1;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt1;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt1;
        oIssueTaxInfoArg.CessAmt = dCessAmt1;
      } else if (oIssueTaxInfoArg.TaxId === 2) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt2;
        oIssueTaxInfoArg.Amount = dAmt2;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt2;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt2;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt2;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt2;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt2;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt2;
        oIssueTaxInfoArg.CessAmt = dCessAmt2;
      } else if (oIssueTaxInfoArg.TaxId === 3) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt3;
        oIssueTaxInfoArg.Amount = dAmt3;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt3;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt3;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt3;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt3;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt3;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt3;
        oIssueTaxInfoArg.CessAmt = dCessAmt3;
      } else if (oIssueTaxInfoArg.TaxId === 4) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt4;
        oIssueTaxInfoArg.Amount = dAmt4;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt4;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt4;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt4;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt4;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt4;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt4;
        oIssueTaxInfoArg.CessAmt = dCessAmt4;
      } else if (oIssueTaxInfoArg.TaxId === 5) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt5;
        oIssueTaxInfoArg.Amount = dAmt5;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt5;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt5;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt5;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt5;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt5;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt5;
        oIssueTaxInfoArg.CessAmt = dCessAmt5;
      } else if (oIssueTaxInfoArg.TaxId === 6) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt6;
        oIssueTaxInfoArg.Amount = dAmt6;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt6;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt6;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt6;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt6;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt6;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt6;
        oIssueTaxInfoArg.CessAmt = dCessAmt6;

      } else if (oIssueTaxInfoArg.TaxId === 7) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt7;
        oIssueTaxInfoArg.Amount = dAmt7;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt7;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt7;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt7;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt7;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt7;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt7;
        oIssueTaxInfoArg.CessAmt = dCessAmt7;
      } else if (oIssueTaxInfoArg.TaxId === 8) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt8;
        oIssueTaxInfoArg.Amount = dAmt8;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt8;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt8;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt8;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt8;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt8;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt8;
        oIssueTaxInfoArg.CessAmt = dCessAmt8;
      } else if (oIssueTaxInfoArg.TaxId === 9) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt9;
        oIssueTaxInfoArg.Amount = dAmt9;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt9;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt9;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt9;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt9;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt9;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt9;
        oIssueTaxInfoArg.CessAmt = dCessAmt9;
      } else if (oIssueTaxInfoArg.TaxId === 10) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt10;
        oIssueTaxInfoArg.Amount = dAmt10;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt10;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt10;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt10;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt10;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt10;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt10;
        oIssueTaxInfoArg.CessAmt = dCessAmt10;
      } else if (oIssueTaxInfoArg.TaxId === 11) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt11;
        oIssueTaxInfoArg.Amount = dAmt11;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt11;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt11;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt11;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt11;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt11;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt11;
        oIssueTaxInfoArg.CessAmt = dCessAmt11;
      } else if (oIssueTaxInfoArg.TaxId === 12) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt12;
        oIssueTaxInfoArg.Amount = dAmt12;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt12;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt12;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt12;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt12;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt12;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt12;
        oIssueTaxInfoArg.CessAmt = dCessAmt12;
      } else if (oIssueTaxInfoArg.TaxId === 13) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt13;
        oIssueTaxInfoArg.Amount = dAmt13;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt13;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt13;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt13;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt13;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt13;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt13;
        oIssueTaxInfoArg.CessAmt = dCessAmt13;
      } else if (oIssueTaxInfoArg.TaxId === 14) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt14;
        oIssueTaxInfoArg.Amount = dAmt14;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt14;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt14;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt14;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt14;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt14;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt14;
        oIssueTaxInfoArg.CessAmt = dCessAmt14;
      } else if (oIssueTaxInfoArg.TaxId === 15) {
        oIssueTaxInfoArg.TaxAmount = dTaxAmt15;
        oIssueTaxInfoArg.Amount = dAmt15;
        oIssueTaxInfoArg.SGSTTaxAmount = dSGSTTaxAmt15;
        oIssueTaxInfoArg.SGSTAmount = dSGSTAmt15;
        oIssueTaxInfoArg.CGSTTaxAmount = dCGSTTaxAmt15;
        oIssueTaxInfoArg.CGSTAmount = dCGSTAmt15;
        oIssueTaxInfoArg.IGSTTaxAmount = dIGSTTaxAmt15;
        oIssueTaxInfoArg.IGSTAmount = dIGSTAmt15;
        oIssueTaxInfoArg.CessAmt = dCessAmt15;
      }

    });
    // Get TCS Amount Calculation New
    let dTCSTaxableAmount = dAmt1 + dAmt2 + dAmt3 + dAmt4 + dAmt5 + dAmt6 + dAmt7 + dAmt8 + dAmt9 + dAmt10 + dAmt11 + dAmt12 + dAmt13 + dAmt14 + dAmt15;
    dTCSTaxableAmount = dTCSTaxableAmount + dTaxAmt1 + dTaxAmt2 + dTaxAmt3 + dTaxAmt4 + dTaxAmt5 + dTaxAmt6 + dTaxAmt7;
    dTCSTaxableAmount = dTCSTaxableAmount + dTaxAmt8 + dTaxAmt9 + dTaxAmt10 + dTaxAmt11 + dTaxAmt12 + dTaxAmt13 + dTaxAmt14 + dTaxAmt15;
    let dTCSTaxPers = this.issueInfoMain.Issue_TCSPers;
    let dTCSTaxAmt = 0;
    if (dTCSTaxPers > 0) {
      dTCSTaxAmt = (dTCSTaxableAmount * dTCSTaxPers) / 100;
    }
    this.issueInfoMain.Issue_TCSAmt = Number(dTCSTaxAmt.toFixed(2));

    dOtherCharge = this.issueInfoMain.Issue_OtherCharge;
    dSalesRetAmt = this.issueInfoMain.Issue_RetValue;
    dPointValue = this.issueInfoMain.Issue_PointSaleValue;
    dFreight = this.issueInfoMain.Issue_Freight;
    dCreditNoteAmt = this.issueInfoMain.Issue_CrAmt;
    dExpiryAmt = this.issueInfoMain.Issue_ExpiryAmt;

    if (strOtherTaxCondition === 'Yes') {

      dOtherChgTaxAmt = (dOtherCharge * dOtherChgTaxPers) / 100;
      dCourierChgTaxAmt = (dFreight * dCourierChgTaxPers) / 100;
      if (strSalesType === 'LOCAL') {
        dOtherChgSGST = (dOtherChgTaxAmt / 2);
        dOtherChgCGST = (dOtherChgTaxAmt / 2);
        dCourierChgSGST = (dCourierChgTaxAmt / 2);
        dCourierChgCGST = (dCourierChgTaxAmt / 2);
      } else {
        dOtherChgIGST = (dOtherChgTaxAmt);
        dCourierChgIGST = (dCourierChgTaxAmt);
      }
    }
    dTotAmt = dTotAmt + dOtherCharge + dFreight - dSalesRetAmt - dPointValue - dCreditNoteAmt - dExpiryAmt + dOtherChgTaxAmt + dCourierChgTaxAmt + dTCSTaxAmt;
    const dTotal = dTotAmt;

    this.issueInfoMain.Issue_ROF = 0;
    const RofDiffValue = dTotAmt - Math.round(dTotAmt);

    if (strRof === 'Yes' && (RofDiffValue === 0.50 || RofDiffValue === (-0.50))) {
      dTotAmt += (0.001);
    }
    this.issueInfoMain.Issue_Total = dTotAmt;
    this.issueInfoMain.Issue_ATotal = dTotAmt;
    this.issueInfoMain.Issue_RetValue = dTotRetAmt;
    this.issueInfoMain.AgentSalesVaue = dTotAgentPrice;

    let dAgentMarginDis = 0, dTotAmtBeforeTaxForAgentSales, dAgentTDSAmt = 0;

    dTotAmtBeforeTaxForAgentSales = dAmt1 + dAmt2 + dAmt3 + dAmt4 + dAmt5 + dAmt6 + dAmt7 + dAmt8 + dAmt10;


    let dAgentSalesDiffAmt = 0;
    dAgentSalesDiffAmt = dTotAmtBeforeTaxForAgentSales - dTotAgentPrice;

    if (this.settings.bAgentCommisionCalcOnMarginPers === 'Yes') {
      dAgentSalesDiffAmt = dTotAgentPrice;
      dAgentMarginDis = this.issueInfoMain.AgentPers;
      this.issueInfoMain.AgentMarginAmt = (dTotAgentPrice * dAgentMarginDis) / 100;
      dAgentTDSAmt = 0;
    } else {
      dAgentMarginDis = this.issueInfoMain.AgentPers;

      dAgentTDSAmt = (dAgentSalesDiffAmt * dAgentMarginDis) / 100;
      this.issueInfoMain.AgentMarginAmt = dAgentSalesDiffAmt - dAgentTDSAmt;
    }


    if (strRof === 'Yes') {
      this.issueInfoMain.Issue_Total = Math.round(dTotAmt);
      const dROF = (this.issueInfoMain.Issue_Total) - dTotAmt;
      this.issueInfoMain.Issue_ROF = dROF;
    }

  }

  onRemove() { }

  onPrinterValidate() { 
    if (this.thermalPrintOption.defaultPrint && this.thermalPrintOption.btAddress) {
      this.fnSaveBill();
    } else {
      this.presentAlert();
    }
  }

  async presentAlert() {
    const alert = await this.alertController.create({
      // header: 'Printer',
      subHeader: 'Warning!',
      message: 'Your Printer is offline.',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'ion-text-capitalize',
        handler: () => {
         
        }
      }, {
          text: 'Continue',
          cssClass: 'ion-text-capitalize',
        handler: () => {
          this.fnSaveBill();
          },
          
        }
        ]
    });

    await alert.present();
  }
  
  fnSaveBill() {
    this.issueInfoMain.BranchId = this.dBranchId;
    this.issueInfoMain.StaffId = this.staffId;
    
    const AcId = this.issueInfoMain.AcId;
    let dBillSerId = 0;
    dBillSerId = this.issueInfoMain.BillSerId;
    const SoftwareName = this.settings.Softwarename;
    const PayTerms = this.issueInfoMain.Issue_PayTerms;
    if (!AcId && (SoftwareName === 'WholeSalePharma' || PayTerms === 'CREDIT')) {
      this.Alert('Select Customer');
      return;
    }
    const SalesMan = this.issueInfoMain.SalesExeId;
    if (SalesMan === 0) {
      this.Alert('Select SalesMan');
      return;
    }

    let varArguements = {};
    varArguements = {
      SoftwareName: this.settings.Softwarename, CustomerForSoftware: this.settings.CustomerForSoftware, AddOrMinus: this.settings.AddOrMinus,
      MrpIncluesiveSales: this.settings.MrpInclusiveSales, TaxIncluded: '', Rof: this.settings.SRof, PackCal: this.settings.PackCal,
      RateDecimalPlace: this.settings.RateDecimalPlace, strOtherTaxCondition: this.settings.OtherAmtTaxCalculation,
      strAgentCommisionCalcOnMarginPers: 'No', strSameItemPrintOneLine: 'No',
      CessInclusiveInSales: this.settings.bCessInclusiveInSales, AdditionalCessInclusiveInSales: this.settings.bAdditionalCessInclusiveInSales
    };

    const DictionaryObject = { dictArgmts: {} };
    DictionaryObject.dictArgmts = varArguements;
    this.issueInfoMain.Issue_SaleType = String(this.issueInfoMain.Issue_SaleType);
    this.issueInfoMain.DirectRBank = this.times;
    this.issueInfoMain.ListIssueSubDetailsInfo = this.issueSub;
    this.issueInfoMain.ListIssueTaxInfo = this.ListIssueTaxInfo;
    this.issueInfoMain.DictionaryObject = DictionaryObject;
    const body = JSON.stringify(this.issueInfoMain);
      
    this.loading = true;
    this.appservice.fnApiPost(this.baseApiUrl + '/Sales/fnSave', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        const jsonobj = data;
        this.presentToast('Saved Successfully!!');
        this.loading = false;
        if (this.thermalPrintOption.defaultPrint && this.thermalPrintOption.btAddress)
          this.saveAndPrint(jsonobj.JsonIssueInfo);
        
          this.modal.dismiss(true);
      }, err => {
        this.loading = false;
        this.presentToast('Server Error!!');
      });
    
  }
  saveAndPrint(value) {
    this.issueInfoMain.Issue_SlNo = value.Issue_SlNo;
    this.issueInfoMain.BillSerId  = value.BillSerId;
    this.issueInfoMain.UniqueBillNo = value.UniqueBillNo;
    this.thermalPrint.invoicePRint(this.issueInfoMain, this.dBranchId, this.baseApiUrl, this.thermalPrintOption);
    
  }
  
  async Alert(value) {
    const alert = await this.alertController.create({
      // subHeader: 'Check',
      message: value,
      buttons: ['OK']
    });
    await alert.present();
  }

  async presentToast(msg) {
    const toast = await this.toastControl.create({
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
