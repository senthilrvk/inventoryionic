import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonInput, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.scss'],
})
export class PurchaseFormComponent implements OnInit {

  @ViewChild('Qty') QtyinputElement: IonInput;
  @ViewChild('PurRate') PurRateinputElement: IonInput;
  @ViewChild('RMRP') RMRPinputElement: IonInput;

  @Input() column: string[];
  @Input() data: any;
  @Input() priceColumn: any;
  @Input() settings: any;
  @Input() mainData: any;
  @Input() demotest: any;

  constructor(private modalControl: ModalController, public alertController: AlertController) {



  }

  ngOnInit() {
    // console.log(this.mainData);

  }

  close() {

    this.modalControl.dismiss();

  }

  async Alert(value) {
    const alert = await this.alertController.create({
      mode: "ios",
      // subHeader: 'Check',
      message: value,
      buttons: ['OK']
    });
    await alert.present();
  }

  onProductSubmit(row) {

    if (parseFloat(row.ReceiptSub_ReceiptQty || 0) == 0 && parseFloat(row.ReceiptSub_ReceiptFree || 0) == 0 && parseFloat(row.ReceiptSub_LooseQty || 0) == 0) {

      this.Alert('Enter Quantity');
      // document.getElementById(`Qty`).focus();
      // var input = document.getElementById(`Qty`) as HTMLInputElement;
      // input.select();
      // input.focus();
      setTimeout(() => {
        this.QtyinputElement.setFocus();
      }, 100);

      return;

    }

    if (row.ReceiptSub_ReceiptRate == undefined || parseFloat(row.ReceiptSub_ReceiptRate || 0) == 0) {

      this.Alert('Enter PurchaseRate');
      setTimeout(() => {
        this.PurRateinputElement.setFocus();
      }, 100);
      return;

    }

    if (row.ReceiptSub_SellRate == undefined || parseFloat(row.ReceiptSub_SellRate || 0) == 0) {

      this.Alert('Enter Selling Rate');
      setTimeout(() => {
        this.RMRPinputElement.setFocus();
      }, 100);
      return;

    }

    this.modalControl.dismiss(row);

  }

  onProductCancel() {

    this.modalControl.dismiss();

  }


  fnGetTotal() {

    this.fnAmountCalculation(-1, "");

  }

  fnQtyCalculation() {

    this.fnAmountCalculation(-1, "");

  }


  fnExpDateKey(event, data) {

    let explength = 0;
    let txtSoftwareName = '', txtExpMonthYearFormat = ''
    txtExpMonthYearFormat = this.settingsName("ExpMonthYearFormat");
    txtSoftwareName = this.settingsName("ProductName");
    
    if (txtSoftwareName == 'RetailPharma' || txtSoftwareName == 'WholeSalePharma' ||
      txtExpMonthYearFormat == 'Yes') {
      explength = 7;

      if (event.target.value.length == 2) {
        if (event.keyCode == 8 || event.keyCode == 46) {
          return
        }
        event.target.value += '/';

      } else if (event.target.value.length == 3) {
        if (event.target.value[2] != '/') {
          event.target.value = event.target.value[0] + event.target.value[1] + '/' + event.target.value[2];
        }
      }

      data.ReceiptSub_ExpDate = event.target.value;
    } else {

      explength = 10;
      if (event.target.value.length == 2 || event.target.value.length == 5) {
        if (event.keyCode == 8 || event.keyCode == 46) {
          return
        }

        event.target.value += '/';
        data.ReceiptSub_ExpDate = event.target.value;

      } else if (event.target.value.length == 3) {

        if (event.target.value[2] != '/') {
          event.target.value = event.target.value[0] + event.target.value[1] + '/' + event.target.value[2];
        }

        data.ReceiptSub_ExpDate = event.target.value;

      } else if (event.target.value.length == 6) {

        if (event.target.value[5] != '/') {
          event.target.value = event.target.value[0] + event.target.value[1] + '/' + event.target.value[2] +
            event.target.value[3] + event.target.value[4] + '/' + event.target.value[5];
        }

        data.ReceiptSub_ExpDate = event.target.value;

      }

    }

  }

  fnAmountCalculation(RowId, strInputBoxName) {


    let dDisPerAll = 0;
    let strType, strTaxOn, strTaxName = '';
    let dTotFreightAmt = 0, dAmount = 0, dLCost = 0, dPerLandCost = 0, dAmtBeforeDis = 0;
    let strTaxOnFree = "Yes";
    let dOriginalPurRate = 0, dTotMRPValue = 0, dTotVatCollected = 0, dTotExcempted = 0, dTotSaleValue = 0;
    let dQty = 0, dFreeQty = 0, dLooseQty = 0, dReplaceQty = 0, dPurRate = 0, dSelRate = 0, dWholeSaleRate = 0, dMRP = 0, dTax = 0, dDisPers = 0, dFreight = 0;
    let Pack = 0, dSchmeAmt = 0, dSGSTTaxPers = 0, dCGSTTaxPers = 0, dIGSTTaxPers = 0, dCessPers = 0, dExtraCessPers = 0, dExtraCessAmt = 0;
    let dPerPurRate = 0, dPerSalRate = 0, dPerMrp = 0, dOriginalLoosePurRate = 0, dMarginAmt = 0, dMaxMarginPers = 0, dTotDisPers = 0;
    let dFreightAmtPerRow = 0, dDisAmt = 0, dTotQty = 0, dAmoutBeforTaxRowise = 0, dAmountBeforeTax = 0, dReceiptTotAmtBeforeTax = 0;
    let dIGSTTaxAmount = 0, dIGSTAmount = 0, dSGSTTaxAmount = 0, dSGSTAmount = 0, dCGSTTaxAmount = 0, dCGSTAmount = 0, dCessAmt = 0;
    let dTaxAmt = 0, dPerTaxAmt = 0, dOrginalTaxAmt = 0, dLooseTaxAmt = 0, dLoosePerTaxAmt = 0, dOriginalFreeTaxAmt = 0, dOrginalLooseTaxAmt = 0;
    let dPurRateForPack = 0, dOriginalPerRate = 0;
    let dPersCessAmount = 0, dPerExtraCessAmount = 0;
    dDisPerAll = this.mainData.Receipt_Discount;
    if (dDisPerAll > 99.99) {
      dDisPerAll = 0;
      this.mainData.Receipt_Discount = 0;
    }

    strType = this.mainData.Receipt_Type;
    dTotFreightAmt = this.mainData.Receipt_Freight;

    let bRowCalculation = false;

    if (this.data.ProductId) {

      bRowCalculation = false;
      if (parseFloat(RowId || 0) < 0) {
        bRowCalculation = true;
      } else if (parseFloat(RowId || 0) == parseFloat(this.data.ReceiptSub_Id || 0)) {
        bRowCalculation = true;
      }

      dQty = dFreeQty = dPurRate = dSelRate = dMRP = dAmount = Pack = dWholeSaleRate = dDisPers = 0;
      dTaxAmt = dAmoutBeforTaxRowise = dFreight = dLCost = dAmtBeforeDis = dOriginalFreeTaxAmt = dLoosePerTaxAmt = dLooseTaxAmt = dPerLandCost = 0;
      strTaxOn = strTaxName = "";
      dFreightAmtPerRow = 0;
      dFreight = dTotFreightAmt = dPurRateForPack = dOriginalPerRate = dReplaceQty = 0;

      strTaxOnFree = "Yes";
      dTotQty = 0;
      dPerPurRate = dPerMrp = dPerSalRate = 0;
      dPerTaxAmt = 0;
      dOrginalTaxAmt = 0;
      dSchmeAmt = 0;
      dPersCessAmount = 0;
      dPerExtraCessAmount = 0;
      dOrginalLooseTaxAmt = dOriginalLoosePurRate = 0;
      dSGSTTaxPers = dSGSTTaxAmount = dSGSTAmount = dCGSTTaxPers = 0,
        dCGSTTaxAmount = dCGSTAmount = dIGSTTaxPers = dIGSTTaxAmount = dIGSTAmount = 0;

      dQty = parseFloat(this.data.ReceiptSub_ReceiptQty || 0);
      dFreeQty = parseFloat(this.data.ReceiptSub_ReceiptFree || 0);
      dLooseQty = parseFloat(this.data.ReceiptSub_LooseQty || 0);
      dReplaceQty = parseFloat(this.data.ReceiptSub_ReplaceQty || 0);

      // changes
      if (this.data.ReceiptSub_SellRate == "NaN") {
        this.data.ReceiptSub_SellRate = 0;
      } else if (this.data.ReceiptSub_WholeSaleRate == "NaN") {
        this.data.ReceiptSub_WholeSaleRate = 0;
      }

      if (this.data.ProductId != 0 && (dQty > 0 || dFreeQty > 0 || dLooseQty > 0 || dReplaceQty > 0)) {

        dQty = 0; dFreeQty = 0;
        dQty = parseFloat(this.data.ReceiptSub_ReceiptQty || 0);
        dFreeQty = parseFloat(this.data.ReceiptSub_ReceiptFree || 0);
        dLooseQty = parseFloat(this.data.ReceiptSub_LooseQty || 0);
        dPurRate = parseFloat(this.data.ReceiptSub_ReceiptRate || 0);
        dSelRate = parseFloat(this.data.ReceiptSub_SellRate || 0);
        dWholeSaleRate = parseFloat(this.data.ReceiptSub_WholeSaleRate || 0);
        dMRP = parseFloat(this.data.ReceiptSub_MRP || 0);
        dTax = parseFloat(this.data.ReceiptSub_ActualTaxPers || 0);
        strTaxOn = this.data.ReceiptSub_TaxOn;
        strTaxOnFree = this.data.ReceiptSub_TaxOnFree;
        strTaxName = this.data.ReceiptSub_TaxName;
        dDisPers = parseFloat(this.data.ReceiptSub_ProdDiscount || 0);
        dFreight = parseFloat(this.data.ReceiptSub_Freight || 0);
        Pack = parseFloat(this.data.ReceiptSub_Pack || 0);
        dOriginalPurRate = parseFloat(this.data.ReceiptSub_ReceiptRate || 0);
        dSchmeAmt = parseFloat(this.data.ReceiptSub_SchemeAmt || 0);
        dSGSTTaxPers = parseFloat(this.data.ReceiptSub_SGSTTaxPers || 0);
        dCGSTTaxPers = parseFloat(this.data.ReceiptSub_CGSTTaxPers || 0);
        dIGSTTaxPers = parseFloat(this.data.ReceiptSub_IGSTTaxPers || 0);
        dCessPers = parseFloat(this.data.ReceiptSub_CessPers || 0);
        dExtraCessPers = parseFloat(this.data.ReceiptSub_ExtraCessPers || 0);
        dPerPurRate = dPurRate;
        dPerSalRate = dSelRate;
        dPerMrp = dMRP;
        dOriginalLoosePurRate = dPurRate;
        dPurRateForPack = parseFloat(this.data.ReceiptSub_ReceiptRate || 0);

        if (dPurRate > 0) {
          this.data.ReceiptSub_WholSalMag = (((dSelRate - dPurRate) / dPurRate) * 100);
        }
        if (dMRP > 0) {
          let decMRP4RetailMargin = dMRP;
          decMRP4RetailMargin = decMRP4RetailMargin - (dSelRate * dTax / 100);
          if (this.settingsName("ProductName") == "RetailPharma") {
            if (this.data.ReceiptSub_LandCost != 0) {
              this.data.ReceiptSub_RetlMargin = (((decMRP4RetailMargin - parseFloat(this.data.ReceiptSub_LandCost || 0)) / parseFloat(this.data.ReceiptSub_LandCost || 0)) * 100);
            } else {
              this.data.ReceiptSub_RetlMargin = 0;
            }

            dMarginAmt = (decMRP4RetailMargin - parseFloat(this.data.ReceiptSub_LandCost || 0));
            dMaxMarginPers = ((dMRP - this.data.ReceiptSub_LandCost) * 100) / dMRP;
            dMarginAmt = (decMRP4RetailMargin - dPurRate);
          } else {
            if (dSelRate != 0) {
              this.data.ReceiptSub_RetlMargin = (((dSelRate - parseFloat(this.data.ReceiptSub_ReceiptRate || 0)) / parseFloat(this.data.ReceiptSub_ReceiptRate || 0)) * 100);
            } else {
              this.data.ReceiptSub_RetlMargin = 0;
            }
            dMaxMarginPers = ((dSelRate - parseFloat(this.data.ReceiptSub_LandCost || 0)) * 100) / dSelRate;
            dMarginAmt = (decMRP4RetailMargin - dPurRate);
          }
        }

        if (Pack == 0) { Pack = 1; }
        this.data.ReceiptSub_Pack = Pack;
        if (this.mainData.Receipt_Discount != 0) { dTotDisPers = this.mainData.Receipt_Discount; }
        dFreightAmtPerRow = (dPurRate * dQty * dFreight) / 100;


        dDisAmt = (((dPurRate * dQty) * dDisPers) / 100);
        dPurRate = dPurRate - ((dPurRate * dDisPers) / 100);
        dPurRate = dPurRate - ((dPurRate * dTotDisPers) / 100);
        if (dQty > 0 && dSchmeAmt > 0) { dPurRate = dPurRate - (dSchmeAmt / dQty) }

        dOriginalPurRate = dOriginalPurRate - ((dOriginalPurRate * dDisPers) / 100);
        if (dQty > 0 && dSchmeAmt > 0) { dOriginalPurRate = dOriginalPurRate - (dSchmeAmt / dQty) };
        if (this.settingsName("ProductName") == "RetailPharma") {

          if (dPurRate > 0 && Pack > 0) {
            dPerPurRate = dPurRate / Pack;
            dOriginalLoosePurRate = dOriginalPurRate / Pack;
            dOriginalPerRate = dPurRateForPack / Pack;
          }
          if (dMRP > 0 && Pack > 0) { dPerMrp = dMRP / Pack; }
          if (dSelRate > 0 && Pack > 0) { dPerSalRate = dSelRate / Pack; }
          dTotQty = (Pack * (dQty + dFreeQty + dReplaceQty)) + dLooseQty;

        } else {

          dTotQty = dQty + dFreeQty + dLooseQty + dReplaceQty;

        }

        dAmoutBeforTaxRowise = (dOriginalPurRate * dQty) + (dPerPurRate * dLooseQty);
        dAmountBeforeTax = dAmountBeforeTax + (dPerPurRate * dLooseQty);
        dReceiptTotAmtBeforeTax = dReceiptTotAmtBeforeTax + dAmoutBeforTaxRowise;
        if (bRowCalculation) {
          if (strType == "INTERSTATE") {
            dIGSTTaxAmount = (dQty * ((dPurRate * dIGSTTaxPers) / 100)) + (dLooseQty * ((dPerPurRate * dIGSTTaxPers) / 100));
            dIGSTAmount = (dQty * dPurRate) + (dLooseQty * dPerPurRate)
            if (strTaxOnFree == "Yes") {
              dIGSTAmount = dIGSTAmount + (dFreeQty * dPurRate);
              dIGSTTaxAmount += (dFreeQty * ((dPurRate * dIGSTTaxPers) / 100));

            }
          } else {
            dSGSTTaxAmount = (dQty * ((dPurRate * dSGSTTaxPers) / 100)) + (dLooseQty * ((dPerPurRate * dSGSTTaxPers) / 100));
            dSGSTAmount = (dQty * dPurRate) + (dLooseQty * dPerPurRate);
            dCGSTTaxAmount = (dQty * ((dPurRate * dCGSTTaxPers) / 100)) + (dLooseQty * ((dPerPurRate * dCGSTTaxPers) / 100));
            dCGSTAmount = (dQty * dPurRate) + (dLooseQty * dPerPurRate)
            if (strTaxOnFree == "Yes") {

              dSGSTAmount += (dFreeQty * dPurRate);
              dSGSTTaxAmount += (dFreeQty * ((dPurRate * dSGSTTaxPers) / 100));

              dCGSTAmount += (dFreeQty * dPurRate);
              dCGSTTaxAmount += (dFreeQty * ((dPurRate * dCGSTTaxPers) / 100));
            }
          }
          dTaxAmt = dQty * ((dPurRate * dTax) / 100);
          dPerTaxAmt = 1 * ((dPurRate * dTax) / 100);
          dOrginalTaxAmt = 1 * ((dOriginalPurRate * dTax) / 100);
          dLooseTaxAmt = dLooseQty * ((dPerPurRate * dTax) / 100);
          dLoosePerTaxAmt = dLooseQty * ((dPerPurRate * dTax) / 100);
          if (strTaxOnFree == "Yes") {
            dTaxAmt += dFreeQty * ((dPurRate * dTax) / 100);
            dOriginalFreeTaxAmt = dFreeQty * ((dOriginalPurRate * dTax) / 100);
          }
          dOrginalLooseTaxAmt = (dOriginalLoosePurRate * dTax) / 100;
          if (this.mainData.Receipt_AddCess == 'Yes' && strType != "INTERSTATE") {
            dCessAmt = (dPurRate * dQty * dCessPers) / 100;
            dPersCessAmount = (dPurRate * dCessPers) / 100;

          }
          dExtraCessAmt = (dPurRate * dQty * dExtraCessPers) / 100;
          dPerExtraCessAmount = (dPurRate * dExtraCessPers) / 100;
          dAmount = (dPurRate * dQty) + (dTaxAmt) + (dPerPurRate * dLooseQty) + (dLooseTaxAmt) + dCessAmt + dExtraCessAmt;// - dSchmeAmt;
          dLCost = dPurRate + dPerTaxAmt + dPersCessAmount + dPerExtraCessAmount;
          dPerLandCost = dLCost;

          if (this.settingsName("ProductName") == "RetailPharma") {
            if (dPurRate > 0 && Pack > 0) {
              //  dPerLandCost = dOriginalPurRate / Pack
              dPerLandCost = dPurRate / Pack
            }
            if (dOrginalTaxAmt > 0 && Pack > 0) {
              dPerLandCost = dPerLandCost + dOrginalTaxAmt / Pack
            }
          }

          let dPurRateForOneProduct = dPurRate;

          if (dQty > 0 || dFreeQty > 0 || dReplaceQty > 0) {
            dPurRateForOneProduct = (dPurRate * dQty) / (dQty + dFreeQty + dReplaceQty);
            if (this.settingsName("ProductName") == "RetailPharma") {
              if (dPurRateForOneProduct > 0 && Pack > 0) {
                dPurRateForOneProduct = dPurRateForOneProduct / Pack;
              }
            }
          }

          dTotFreightAmt = (dQty + dFreeQty) * dFreight;
          dAmtBeforeDis = (dOriginalPurRate * dQty) + (dOriginalLoosePurRate * dLooseQty);
          dAmtBeforeDis = dAmtBeforeDis + (dOrginalTaxAmt * dQty) + (dOrginalLooseTaxAmt * dLooseQty) + dOriginalFreeTaxAmt + dExtraCessAmt;//- dSchmeAmt;
          this.data.ReceiptSub_PerRate = dOriginalPerRate;
          this.data.ReceiptSub_PerSelRate = dPerSalRate;
          this.data.ReceiptSub_PerMRP = dPerMrp;
          this.data.ReceiptSub_Amount = dAmount;
          this.data.ReceiptSub_TaxAmt = dTaxAmt + dLooseTaxAmt;

          if (strInputBoxName != 'LandingCost') {
            this.data.ReceiptSub_LandCost = dLCost;
          }

          this.data.ReceiptSub_PerLandCost = dPerLandCost;
          this.data.ReceiptSub_ProdDisAmt = dDisAmt;//
          if (strInputBoxName != 'GrossValue') {
            this.data.ReceiptSub_AmtBeforeTax = dAmoutBeforTaxRowise;
          }

          this.data.ReceiptSub_TotalQty = dTotQty;
          this.data.ReceiptSub_TotLQty = dTotQty;
          this.data.ReceiptSub_NetAmtPerProd = dAmtBeforeDis;
          this.data.ReceiptSub_SGSTTaxAmount = dSGSTTaxAmount;
          this.data.ReceiptSub_SGSTAmount = dSGSTAmount;
          this.data.ReceiptSub_CGSTTaxAmount = dCGSTTaxAmount;
          this.data.ReceiptSub_CGSTAmount = dCGSTAmount;
          this.data.ReceiptSub_IGSTTaxAmount = dIGSTTaxAmount;
          this.data.ReceiptSub_IGSTAmount = dIGSTAmount;
          this.data.ReceiptSub_BarCode = dPurRateForOneProduct;
          this.data.ReceiptSub_CessAmt = dCessAmt;
          this.data.ReceiptSub_ExtraCessAmt = dExtraCessAmt;
          this.mainData.MRPValue = dTotMRPValue;
          this.mainData.VatCollected = dTotVatCollected;
          this.mainData.PurchaseValue = dTotSaleValue;
          this.mainData.Excempted = dTotExcempted;

          let ID = this.data.ReceiptSub_Id;
          let DeceimalPlace = parseFloat(this.settingsName("DecimalPlace") || 0);
          let decMRP4RetailMargin = 0;
          let dTaxPersForRetailMargin = this.data.ReceiptSub_Frgt;
          let dOriginalSelRate = parseFloat(this.data.ReceiptSub_SellRate || 0);

          if (this.settingsName("MRPINCLUSIVESALES") == "Yes") {
            dOriginalSelRate = dOriginalSelRate - ((dOriginalSelRate * dTaxPersForRetailMargin) / (100 + dTaxPersForRetailMargin));
            if (this.data.ReceiptSub_ReceiptRate > 0) {
              this.data.ReceiptSub_WholSalMag = ((dOriginalSelRate - parseFloat(this.data.ReceiptSub_LandCost || 0)) / parseFloat(this.data.ReceiptSub_LandCost || 0)) * 100;
            }
          } else {
            if (this.data.ReceiptSub_ReceiptRate > 0) {
              this.data.ReceiptSub_WholSalMag = ((dOriginalSelRate - parseFloat(this.data.ReceiptSub_ReceiptRate || 0)) / parseFloat(this.data.ReceiptSub_ReceiptRate || 0)) * 100;

            }
          }

          if (this.settingsName("ProductName") == "RetailPharma") {
            if (this.data.ReceiptSub_MRP > 0) {
              decMRP4RetailMargin = parseFloat(this.data.ReceiptSub_MRP || 0);
              if (strTaxOn == "MRP Inclusive")
                decMRP4RetailMargin = decMRP4RetailMargin - (decMRP4RetailMargin * dTaxPersForRetailMargin / (100 + dTaxPersForRetailMargin));
              if (strTaxOn == "SELLING RATE")//SellingRate to PurchaseRate
                decMRP4RetailMargin = decMRP4RetailMargin - (dOriginalSelRate * dTaxPersForRetailMargin / 100);

              if (this.data.ReceiptSub_LandCost != 0)
                this.data.ReceiptSub_RetlMargin = ((decMRP4RetailMargin - parseFloat(this.data.ReceiptSub_LandCost || 0)) / parseFloat(this.data.ReceiptSub_LandCost || 0)) * 100;
              else
                this.data.ReceiptSub_RetlMargin = 0;
            }
          } else {

            if (this.data.ReceiptSub_MRP > 0) {
              decMRP4RetailMargin = this.data.ReceiptSub_MRP;
              if (strTaxOn == "MRP Inclusive")
                decMRP4RetailMargin = decMRP4RetailMargin - (decMRP4RetailMargin * dTaxPersForRetailMargin / (100 + dTaxPersForRetailMargin));
              if (strTaxOn == "SELLING RATE")//SellingRate to PurchaseRate
                decMRP4RetailMargin = decMRP4RetailMargin - (dOriginalSelRate * dTaxPersForRetailMargin / 100);

              if (dOriginalSelRate != 0)
                this.data.ReceiptSub_RetlMargin = ((decMRP4RetailMargin - dOriginalSelRate) / dOriginalSelRate) * 100;
              else { this.data.ReceiptSub_RetlMargin = 0 }
            }

          }

          if (RowId == ID) {
            // this.txtWholeSaleMarginCurRow = parseFloat(this.data.ReceiptSub_WholSalMag || 0).toFixed(DeceimalPlace);
            // this.txtRetailMarginPerRow = parseFloat(this.data.ReceiptSub_RetlMargin || 0).toFixed(DeceimalPlace);
          }

          if (DeceimalPlace != 3) {
            let decLastDegitValue;
            let strSplit = parseFloat(this.data.ReceiptSub_Amount || 0).toFixed(3).split(".");
            if (strSplit.length > 1) {
              decLastDegitValue = strSplit[1];
              if (decLastDegitValue.length >= 3)
                decLastDegitValue = decLastDegitValue.substring(2);
              if (decLastDegitValue == 5)
                this.data.ReceiptSub_Amount += parseFloat(this.data.ReceiptSub_Amount || 0) % .001;
            }
            this.data.ReceiptSub_Amount = Math.round(parseFloat(this.data.ReceiptSub_Amount || 0) * 100) / 100;
            decLastDegitValue = 0;
            strSplit = this.data.ReceiptSub_TaxAmt.toFixed(3).split(".");
            if (strSplit.length > 1) {
              decLastDegitValue = strSplit[1];
              if (decLastDegitValue.length >= 3)
                decLastDegitValue = decLastDegitValue.substring(2);
              if (decLastDegitValue == 5)
                this.data.ReceiptSub_TaxAmt += parseFloat(this.data.ReceiptSub_TaxAmt || 0) % .001;
            }
            this.data.ReceiptSub_TaxAmt = Math.round(parseFloat(this.data.ReceiptSub_TaxAmt || 0) * 100) / 100;
          }

          //if (parseFloat(RowId || 0) >= 0) {
          if (parseFloat(this.data.ProductId || 0) == parseFloat(this.data.ProductId || 0)) {
            this.data.ReceiptSub_WholSalMag = parseFloat(this.data.ReceiptSub_WholSalMag || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_PerRate = parseFloat(this.data.ReceiptSub_PerRate || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_RetlMargin = parseFloat(this.data.ReceiptSub_RetlMargin || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_TotLQty = parseFloat(this.data.ReceiptSub_TotLQty || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_PerSelRate = parseFloat(this.data.ReceiptSub_PerSelRate || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_PerMRP = parseFloat(this.data.ReceiptSub_PerMRP || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_Amount = parseFloat(this.data.ReceiptSub_Amount || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_NetAmtPerProd = parseFloat(this.data.ReceiptSub_NetAmtPerProd || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_TaxAmt = parseFloat(this.data.ReceiptSub_TaxAmt || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_ProdDisAmt = parseFloat(this.data.ReceiptSub_ProdDisAmt || 0).toFixed(DeceimalPlace);
            // this.dynamicArray[RowId].ReceiptSub_AmtBeforeTax = parseFloat(this.data.ReceiptSub_AmtBeforeTax).toFixed(DeceimalPlace);
            if (strInputBoxName != "GrossValue") {
              this.data.ReceiptSub_AmtBeforeTax = parseFloat(this.data.ReceiptSub_AmtBeforeTax || 0).toFixed(2);
            }
            this.data.ReceiptSub_TotalQty = this.data.ReceiptSub_TotalQty;
            if (strInputBoxName != "LandingCost") {
              this.data.ReceiptSub_LandCost = parseFloat(this.data.ReceiptSub_LandCost || 0).toFixed(DeceimalPlace);
            }
            this.data.ReceiptSub_PerLandCost = parseFloat(this.data.ReceiptSub_PerLandCost || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_SGSTTaxAmount = parseFloat(this.data.ReceiptSub_SGSTTaxAmount || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_SGSTAmount = parseFloat(this.data.ReceiptSub_SGSTAmount || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_CGSTTaxAmount = parseFloat(this.data.ReceiptSub_CGSTTaxAmount || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_CGSTAmount = parseFloat(this.data.ReceiptSub_CGSTAmount || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_IGSTTaxAmount = parseFloat(this.data.ReceiptSub_IGSTTaxAmount || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_IGSTAmount = parseFloat(this.data.ReceiptSub_IGSTAmount || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_BarCode = parseFloat(this.data.ReceiptSub_BarCode || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_CessAmt = parseFloat(this.data.ReceiptSub_CessAmt || 0).toFixed(DeceimalPlace);
            this.data.ReceiptSub_ExtraCessAmt = parseFloat(this.data.ReceiptSub_ExtraCessAmt || 0);
          }

        }

      }

    }

    this.fnSelRateOnDispers();
    dTotFreightAmt = Number(this.mainData.Receipt_Freight || 0);

    if (dTotFreightAmt > 0) {
      this.fnActualPurchaseRateChangeOfFreight();
    }

    setTimeout(() => {
      this.fnGetFinalTotal(dReceiptTotAmtBeforeTax, dDisPerAll, strInputBoxName);
    }, 1);

  }

  fnSelRateOnDispers() {

  }

  fnActualPurchaseRateChangeOfFreight() {

  }

  fnGetFinalTotal(dReceiptTotAmtBeforeTax, dDisPerAll, InputBoxName) {

    let oListReceiptTaxInfo = [] //this.jsonTaxData;
    let oListReceiptDetailsInfo = this.data;

    if (oListReceiptDetailsInfo == null)
      return;

    let dTotalAmout = 0, dTotFreightAmt = 0, dFreightPerAmt = 0, dLandingCostPerQty = 0;
    let dTotAmt = 0, dAmt = 0, dTaxAmt = 0, dTotInterstateTaxAmt = 0, dQty = 0, dFreeQty = 0, dExciseDuty = 0, dLooseQty = 0;
    let dTaxAmt1 = 0, dTaxAmt2 = 0, dTaxAmt3 = 0, dTaxAmt4 = 0, dTaxAmt5 = 0, dTaxId;
    let dAmt1 = 0, dAmt2 = 0, dAmt3 = 0, dAmt4 = 0, dAmt5 = 0, dOtherCharge = 0, dRof = 0, dDebitNoteAmt = 0, dPackingChg = 0, dStampingChg = 0;
    let strType = "";
    let dTotDisAmtAll = 0;
    let dTaxAmt6 = 0, dTaxAmt7 = 0, dTaxAmt8 = 0, dTaxAmt9 = 0, dTaxAmt10 = 0, dTaxAmt11 = 0, dTaxAmt12 = 0, dTaxAmt13 = 0, dTaxAmt14 = 0, dTaxAmt15 = 0;
    let dAmt6 = 0, dAmt7 = 0, dAmt8 = 0, dAmt9 = 0, dAmt10 = 0, dAmt11 = 0, dAmt12 = 0, dAmt13 = 0, dAmt14 = 0, dAmt15 = 0;
    let dSGSTTaxAmt = 0, dCGSTTaxAmt = 0, dIGSTTaxAmt = 0, dSGSTAmt = 0, dCGSTAmt = 0, dIGSTAmt = 0;
    let dSGSTTaxAmt1 = 0, dSGSTTaxAmt2 = 0, dSGSTTaxAmt3 = 0, dSGSTTaxAmt4 = 0, dSGSTTaxAmt5 = 0;
    let dSGSTTaxAmt6 = 0, dSGSTTaxAmt7 = 0, dSGSTTaxAmt8 = 0, dSGSTTaxAmt9 = 0, dSGSTTaxAmt10 = 0;
    let dSGSTTaxAmt11 = 0, dSGSTTaxAmt12 = 0, dSGSTTaxAmt13 = 0, dSGSTTaxAmt14 = 0, dSGSTTaxAmt15 = 0;
    let dCGSTTaxAmt1 = 0, dCGSTTaxAmt2 = 0, dCGSTTaxAmt3 = 0, dCGSTTaxAmt4 = 0, dCGSTTaxAmt5 = 0;
    let dCGSTTaxAmt6 = 0, dCGSTTaxAmt7 = 0, dCGSTTaxAmt8 = 0, dCGSTTaxAmt9 = 0, dCGSTTaxAmt10 = 0;
    let dCGSTTaxAmt11 = 0, dCGSTTaxAmt12 = 0, dCGSTTaxAmt13 = 0, dCGSTTaxAmt14 = 0, dCGSTTaxAmt15 = 0;
    let dIGSTTaxAmt1 = 0, dIGSTTaxAmt2 = 0, dIGSTTaxAmt3 = 0, dIGSTTaxAmt4 = 0, dIGSTTaxAmt5 = 0;
    let dIGSTTaxAmt6 = 0, dIGSTTaxAmt7 = 0, dIGSTTaxAmt8 = 0, dIGSTTaxAmt9 = 0, dIGSTTaxAmt10 = 0;
    let dIGSTTaxAmt11 = 0, dIGSTTaxAmt12 = 0, dIGSTTaxAmt13 = 0, dIGSTTaxAmt14 = 0, dIGSTTaxAmt15 = 0;
    let dSGSTAmt1 = 0, dSGSTAmt2 = 0, dSGSTAmt3 = 0, dSGSTAmt4 = 0, dSGSTAmt5 = 0, dSGSTAmt6 = 0;
    let dSGSTAmt7 = 0, dSGSTAmt8 = 0, dSGSTAmt9 = 0, dSGSTAmt10 = 0, dSGSTAmt11 = 0, dSGSTAmt12 = 0;
    let dSGSTAmt13 = 0, dSGSTAmt14 = 0, dSGSTAmt15 = 0;
    let dCGSTAmt1 = 0, dCGSTAmt2 = 0, dCGSTAmt3 = 0, dCGSTAmt4 = 0, dCGSTAmt5 = 0, dCGSTAmt6 = 0, dCGSTAmt7 = 0
    let dCGSTAmt8 = 0, dCGSTAmt9 = 0, dCGSTAmt10 = 0, dCGSTAmt11 = 0, dCGSTAmt12 = 0, dCGSTAmt13 = 0;
    let dCGSTAmt14 = 0, dCGSTAmt15 = 0;
    let dIGSTAmt1 = 0, dIGSTAmt2 = 0, dIGSTAmt3 = 0, dIGSTAmt4 = 0, dIGSTAmt5 = 0, dIGSTAmt6 = 0, dIGSTAmt7 = 0
    let dIGSTAmt8 = 0, dIGSTAmt9 = 0, dIGSTAmt10 = 0, dIGSTAmt11 = 0, dIGSTAmt12 = 0, dIGSTAmt13 = 0;
    let dIGSTAmt14 = 0, dIGSTAmt15 = 0;
    let dOtherChgTaxPers = 0, dOtherChgTaxAmt = 0, dOtherChgSGST = 0, dOtherChgCGST = 0, dOtherChgIGST = 0;
    let dPackingChgTaxPers = 0, dPackingChgTaxAmt = 0, dPackingChgSGST = 0, dPackingChgCGST = 0, dPackingChgIGST = 0;
    let dStampingChgTaxPers = 0, dStampingChgTaxAmt = 0, dStampingChgSGST = 0, dStampingChgCGST = 0;
    let dStampingChgIGST = 0;
    let dCessAmt1 = 0, dCessAmt2 = 0, dCessAmt3 = 0, dCessAmt4 = 0, dCessAmt5 = 0, dCessAmt6 = 0;
    let dCessAmt7 = 0, dCessAmt8 = 0, dCessAmt9 = 0, dCessAmt10 = 0;
    let dCessAmt11 = 0, dCessAmt12 = 0, dCessAmt13 = 0, dCessAmt14 = 0, dCessAmt15 = 0
    let dRowCessAmt = 0, dRowAdditionalCessAmt = 0;
    var dAdditionalCessAmt1 = 0, dAdditionalCessAmt2 = 0, dAdditionalCessAmt3 = 0, dAdditionalCessAmt4 = 0;
    let dAdditionalCessAmt5 = 0, dAdditionalCessAmt6 = 0, dAdditionalCessAmt7 = 0, dAdditionalCessAmt8 = 0;
    let dAdditionalCessAmt9 = 0, dAdditionalCessAmt10 = 0;
    var dAdditionalCessAmt11 = 0, dAdditionalCessAmt12 = 0, dAdditionalCessAmt13 = 0, dAdditionalCessAmt14 = 0, dAdditionalCessAmt15 = 0;
    var dReplaceQty = 0;
    let DeceimalPlace = 2;

    if (dDisPerAll > 0)
      dTotDisAmtAll = (dReceiptTotAmtBeforeTax * dDisPerAll) / 100;


    if (this.mainData.Field3 != 'Amt') {
      this.mainData.DisAmt = dTotDisAmtAll;
    }
    // this.mainData.DisAmt = dTotDisAmtAll;
    dTotFreightAmt = this.mainData.Receipt_Freight;

    strType = this.mainData.Receipt_Type;

    dOtherChgTaxPers = parseFloat(<any>this.mainData.Receipt_OtherTaxPers || 0);
    dPackingChgTaxPers = parseFloat(<any>this.mainData.Receipt_PackingChgTaxPers || 0);
    dStampingChgTaxPers = parseFloat(<any>this.mainData.Receipt_StampingChgTaxPers || 0);
    dOtherCharge = parseFloat(<any>this.mainData.Receipt_Othercharge || 0);
    dExciseDuty = parseFloat(<any>this.mainData.LandingCost || 0);
    dPackingChg = parseFloat(<any>this.mainData.Receipt_PackingChg || 0);
    dStampingChg = parseFloat(<any>this.mainData.Receipt_StampingChg || 0);
    dDebitNoteAmt = parseFloat(<any>this.mainData.Receipt_DbAmt || 0);

    dOtherChgTaxAmt = (dOtherCharge * dOtherChgTaxPers) / 100;
    dPackingChgTaxAmt = (dPackingChg * dPackingChgTaxPers) / 100;
    dStampingChgTaxAmt = (dStampingChg * dStampingChgTaxPers) / 100;

    if (strType == "LOCAL") {
      dOtherChgSGST = (dOtherChgTaxAmt / 2);
      dOtherChgCGST = (dOtherChgTaxAmt / 2);
      dPackingChgSGST = (dPackingChgTaxAmt / 2);
      dPackingChgCGST = (dPackingChgTaxAmt / 2);
      dStampingChgSGST = (dStampingChgTaxAmt / 2);
      dStampingChgCGST = (dStampingChgTaxAmt / 2);
    } else {
      dOtherChgIGST = parseFloat(<any>dOtherChgTaxAmt || 0);
      dPackingChgIGST = parseFloat(<any>dPackingChgTaxAmt || 0);
      dStampingChgIGST = parseFloat(<any>dStampingChgTaxAmt || 0);
    }
    // landing cost calculation
    if (dTotFreightAmt > 0) {
      for (const oReceiptDetailsInfoArg of oListReceiptDetailsInfo) {
        if (oReceiptDetailsInfoArg.ProductId !== undefined) {
          dTotalAmout += parseFloat(oReceiptDetailsInfoArg.ReceiptSub_ReceiptQty || 0) * parseFloat(oReceiptDetailsInfoArg.ReceiptSub_ReceiptRate || 0);
        }
      }

      if (dTotFreightAmt > 0 && dTotalAmout > 0)
        dFreightPerAmt = dTotFreightAmt / dTotalAmout;
    }


    let dTotQty = 0;

    var dTotSaleValue = 0, dTotMrpValue = 0;
    var dTotReplaceQty = 0;

    for (let index = 0; index < oListReceiptDetailsInfo.length; index++) {
      const oReceiptDetailsInfoArg = oListReceiptDetailsInfo[index];
      if (oReceiptDetailsInfoArg.ProductId !== undefined) {
        this.data.ReceiptSub_Id = index;

        dLandingCostPerQty = 0;
        dLandingCostPerQty = dFreightPerAmt * parseFloat(oReceiptDetailsInfoArg.ReceiptSub_ReceiptRate || 0);
        if (InputBoxName != 'LandingCost') {
          oReceiptDetailsInfoArg.ReceiptSub_LandCost = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_LandCost || 0) + dLandingCostPerQty;
        }
        var ID = oReceiptDetailsInfoArg.ReceiptSub_Id;
        if (InputBoxName != 'LandingCost') {
          this.data.ReceiptSub_LandCost = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_LandCost || 0).toFixed(DeceimalPlace);
        }
        let dLandingCost = parseFloat(this.data.ReceiptSub_LandCost || 0);
        let dPurRate = parseFloat(this.data.ReceiptSub_BarCode || 0);
        let dMrp = parseFloat(this.data.ReceiptSub_MRP || 0);
        let dSelRate = parseFloat(this.data.ReceiptSub_SellRate || 0);
        let dMrpMarginAmt = 0, dMrpMarginPers = 0, dSelRateMarginAmt = 0, dSelRateMarginPers = 100;

        if (dLandingCost > 0) {
          dMrpMarginAmt = dMrp - dLandingCost;
          dMrpMarginPers = (dMrpMarginAmt / dLandingCost) * 100;
          if (this.settingsName("MRPINCLUSIVESALES") == 'Yes') {
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


        this.data.txtPurMrpMarginPers = dMrpMarginPers.toFixed(2);
        this.data.txtPurSelRateMarginPers = dSelRateMarginPers.toFixed(2);
        this.data.txtSalesMarginAmt = dSelRateMarginAmt.toFixed(2);
        this.data.txtPurMrpMarginAmt = dMrpMarginAmt.toFixed(2);



        dQty = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_ReceiptQty || 0);
        dFreeQty = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_ReceiptFree || 0);
        dLooseQty = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_LooseQty || 0);
        dReplaceQty = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_ReplaceQty || 0);
        dTotQty = dTotQty + (dQty + dFreeQty);

        if (oReceiptDetailsInfoArg.ProductId != 0 && (dQty > 0 || dFreeQty > 0 || dLooseQty > 0 || dReplaceQty > 0)) {

          dTotSaleValue += (dQty + dFreeQty) * dSelRate;
          dTotMrpValue += (dQty + dFreeQty) * dMrp;
          dTotReplaceQty += (dReplaceQty) * dSelRate;


          dQty = 0; dFreeQty = 0;
          dAmt = dTaxAmt = 0; dLooseQty = 0;
          dSGSTTaxAmt = dCGSTTaxAmt = dIGSTTaxAmt = dSGSTAmt = dCGSTAmt = dIGSTAmt = dRowCessAmt = 0;
          if (oReceiptDetailsInfoArg.ReceiptSub_Amount != 0) {
            dTotAmt += parseFloat(oReceiptDetailsInfoArg.ReceiptSub_Amount || 0);
            dAmt = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_Amount || 0);
            dTaxAmt = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_TaxAmt || 0);
            dSGSTTaxAmt = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_SGSTTaxAmount || 0);
            dCGSTTaxAmt = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_CGSTTaxAmount || 0);
            dIGSTTaxAmt = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_IGSTTaxAmount || 0);
            dSGSTAmt = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_SGSTAmount || 0);
            dCGSTAmt = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_CGSTAmount || 0);
            dIGSTAmt = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_IGSTAmount || 0);
            dRowCessAmt = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_CessAmt || 0);
            dRowAdditionalCessAmt = parseFloat(oReceiptDetailsInfoArg.ReceiptSub_ExtraCessAmt || 0);
          }
          if (oReceiptDetailsInfoArg.TaxId != 0) {
            dTaxId = parseFloat(oReceiptDetailsInfoArg.TaxId || 0);
            if (dTaxId == 1) {

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

            } else if (dTaxId == 2) {

              dTaxAmt2 += dTaxAmt;
              dCessAmt2 += dRowCessAmt;
              dAdditionalCessAmt2 += dRowAdditionalCessAmt;
              dAmt2 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
              dSGSTTaxAmt2 += dSGSTTaxAmt;
              dCGSTTaxAmt2 += dCGSTTaxAmt;
              dIGSTTaxAmt2 += dIGSTTaxAmt;
              dSGSTAmt2 += dSGSTAmt;
              dCGSTAmt2 += dCGSTAmt;
              dIGSTAmt2 += dIGSTAmt;

            } else if (dTaxId == 3) {
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
            } else if (dTaxId == 4) {
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

            } else if (dTaxId == 5) {
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

            } else if (dTaxId == 6) {
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

            } else if (dTaxId == 7) {
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

            } else if (dTaxId == 8) {
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

            } else if (dTaxId == 9) {
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

            } else if (dTaxId == 10) {
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

            } else if (dTaxId == 11) {
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
            } else if (dTaxId == 12) {

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
            } else if (dTaxId == 13) {
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
            } else if (dTaxId == 14) {

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

            } else if (dTaxId == 15) {

              dTaxAmt15 += dTaxAmt;
              dCessAmt15 += dRowCessAmt;
              dAdditionalCessAmt15 += dRowAdditionalCessAmt;
              dAmt15 += dAmt - dTaxAmt - dRowCessAmt - dRowAdditionalCessAmt;
              dSGSTTaxAmt15 += dSGSTTaxAmt;
              dCGSTTaxAmt15 += dCGSTTaxAmt;
              dIGSTTaxAmt15 += dIGSTTaxAmt;
              dSGSTAmt15 += dSGSTAmt;
              dCGSTAmt15 += dCGSTAmt;
              dIGSTAmt15 += dIGSTAmt;

            }

          }
        }
      }
    }

    // this.txtTotQty = dTotQty;

    // this.txtTotalSalesValue = dTotSaleValue.toFixed(this.txtRateDecimalPlace);
    // this.txtTotalMrpValue = dTotMrpValue.toFixed(this.txtRateDecimalPlace);
    // this.txtTotReplaceValue = dTotReplaceQty.toFixed(this.txtRateDecimalPlace);

    for (const oReceiptTaxArg of oListReceiptTaxInfo) {
      oReceiptTaxArg.TaxAmount = 0
      oReceiptTaxArg.Amount = 0;
      oReceiptTaxArg.SGSTTaxAmount = 0;
      oReceiptTaxArg.SGSTAmount = 0;
      oReceiptTaxArg.CGSTTaxAmount = 0;
      oReceiptTaxArg.CGSTAmount = 0;
      oReceiptTaxArg.IGSTTaxAmount = 0;
      oReceiptTaxArg.IGSTAmount = 0;
      oReceiptTaxArg.AdditionalCessAmt = 0;
      oReceiptTaxArg.CessAmt = 0;
      if (oReceiptTaxArg.TaxId == 1) {
        oReceiptTaxArg.TaxAmount = dTaxAmt1;
        oReceiptTaxArg.Amount = dAmt1;
        oReceiptTaxArg.SGSTTaxAmount = dSGSTTaxAmt1;
        oReceiptTaxArg.SGSTAmount = dSGSTAmt1;
        oReceiptTaxArg.CGSTTaxAmount = dCGSTTaxAmt1;
        oReceiptTaxArg.CGSTAmount = dCGSTAmt1;
        oReceiptTaxArg.IGSTTaxAmount = dIGSTTaxAmt1;
        oReceiptTaxArg.IGSTAmount = dIGSTAmt1;
        oReceiptTaxArg.CessAmt = dCessAmt1;
        oReceiptTaxArg.AdditionalCessAmt = dAdditionalCessAmt1;
      } else if (oReceiptTaxArg.TaxId == 2) {
        oReceiptTaxArg.TaxAmount = dTaxAmt2;
        oReceiptTaxArg.Amount = dAmt2;
        oReceiptTaxArg.SGSTTaxAmount = dSGSTTaxAmt2;
        oReceiptTaxArg.SGSTAmount = dSGSTAmt2;
        oReceiptTaxArg.CGSTTaxAmount = dCGSTTaxAmt2;
        oReceiptTaxArg.CGSTAmount = dCGSTAmt2;
        oReceiptTaxArg.IGSTTaxAmount = dIGSTTaxAmt2;
        oReceiptTaxArg.IGSTAmount = dIGSTAmt2;
        oReceiptTaxArg.CessAmt = dCessAmt2;
        oReceiptTaxArg.AdditionalCessAmt = dAdditionalCessAmt2;
      } else if (oReceiptTaxArg.TaxId == 3) {

        oReceiptTaxArg.TaxAmount = dTaxAmt3;
        oReceiptTaxArg.Amount = dAmt3;
        oReceiptTaxArg.SGSTTaxAmount = dSGSTTaxAmt3;
        oReceiptTaxArg.SGSTAmount = dSGSTAmt3;
        oReceiptTaxArg.CGSTTaxAmount = dCGSTTaxAmt3;
        oReceiptTaxArg.CGSTAmount = dCGSTAmt3;
        oReceiptTaxArg.IGSTTaxAmount = dIGSTTaxAmt3;
        oReceiptTaxArg.IGSTAmount = dIGSTAmt3;
        oReceiptTaxArg.CessAmt = dCessAmt3;
        oReceiptTaxArg.AdditionalCessAmt = dAdditionalCessAmt3;

      } else if (oReceiptTaxArg.TaxId == 4) {
        oReceiptTaxArg.TaxAmount = dTaxAmt4;
        oReceiptTaxArg.Amount = dAmt4;
        oReceiptTaxArg.SGSTTaxAmount = dSGSTTaxAmt4;
        oReceiptTaxArg.SGSTAmount = dSGSTAmt4;
        oReceiptTaxArg.CGSTTaxAmount = dCGSTTaxAmt4;
        oReceiptTaxArg.CGSTAmount = dCGSTAmt4;
        oReceiptTaxArg.IGSTTaxAmount = dIGSTTaxAmt4;
        oReceiptTaxArg.IGSTAmount = dIGSTAmt4;
        oReceiptTaxArg.CessAmt = dCessAmt4;
        oReceiptTaxArg.AdditionalCessAmt = dAdditionalCessAmt4;
      } else if (oReceiptTaxArg.TaxId == 5) {
        oReceiptTaxArg.TaxAmount = dTaxAmt5;
        oReceiptTaxArg.Amount = dAmt5;
        oReceiptTaxArg.SGSTTaxAmount = dSGSTTaxAmt5;
        oReceiptTaxArg.SGSTAmount = dSGSTAmt5;
        oReceiptTaxArg.CGSTTaxAmount = dCGSTTaxAmt5;
        oReceiptTaxArg.CGSTAmount = dCGSTAmt5;
        oReceiptTaxArg.IGSTTaxAmount = dIGSTTaxAmt5;
        oReceiptTaxArg.IGSTAmount = dIGSTAmt5;
        oReceiptTaxArg.CessAmt = dCessAmt5;
        oReceiptTaxArg.AdditionalCessAmt = dAdditionalCessAmt5;
      } else if (oReceiptTaxArg.TaxId == 6) {
        oReceiptTaxArg.TaxAmount = dTaxAmt6;
        oReceiptTaxArg.Amount = dAmt6;
        oReceiptTaxArg.SGSTTaxAmount = dSGSTTaxAmt6;
        oReceiptTaxArg.SGSTAmount = dSGSTAmt6;
        oReceiptTaxArg.CGSTTaxAmount = dCGSTTaxAmt6;
        oReceiptTaxArg.CGSTAmount = dCGSTAmt6;
        oReceiptTaxArg.IGSTTaxAmount = dIGSTTaxAmt6;
        oReceiptTaxArg.IGSTAmount = dIGSTAmt6;
        oReceiptTaxArg.CessAmt = dCessAmt6;
        oReceiptTaxArg.AdditionalCessAmt = dAdditionalCessAmt6;
      } else if (oReceiptTaxArg.TaxId == 7) {
        oReceiptTaxArg.TaxAmount = dTaxAmt7;
        oReceiptTaxArg.Amount = dAmt7;
        oReceiptTaxArg.SGSTTaxAmount = dSGSTTaxAmt7;
        oReceiptTaxArg.SGSTAmount = dSGSTAmt7;
        oReceiptTaxArg.CGSTTaxAmount = dCGSTTaxAmt7;
        oReceiptTaxArg.CGSTAmount = dCGSTAmt7;
        oReceiptTaxArg.IGSTTaxAmount = dIGSTTaxAmt7;
        oReceiptTaxArg.IGSTAmount = dIGSTAmt7;
        oReceiptTaxArg.CessAmt = dCessAmt7;
        oReceiptTaxArg.AdditionalCessAmt = dAdditionalCessAmt7;
      } else if (oReceiptTaxArg.TaxId == 8) {
        oReceiptTaxArg.TaxAmount = dTaxAmt8;
        oReceiptTaxArg.Amount = dAmt8;
        oReceiptTaxArg.SGSTTaxAmount = dSGSTTaxAmt8;
        oReceiptTaxArg.SGSTAmount = dSGSTAmt8;
        oReceiptTaxArg.CGSTTaxAmount = dCGSTTaxAmt8;
        oReceiptTaxArg.CGSTAmount = dCGSTAmt8;
        oReceiptTaxArg.IGSTTaxAmount = dIGSTTaxAmt8;
        oReceiptTaxArg.IGSTAmount = dIGSTAmt8;
        oReceiptTaxArg.CessAmt = dCessAmt8;
        oReceiptTaxArg.AdditionalCessAmt = dAdditionalCessAmt8;
      } else if (oReceiptTaxArg.TaxId == 9) {
        oReceiptTaxArg.TaxAmount = dTaxAmt9;
        oReceiptTaxArg.Amount = dAmt9;
        oReceiptTaxArg.SGSTTaxAmount = dSGSTTaxAmt9;
        oReceiptTaxArg.SGSTAmount = dSGSTAmt9;
        oReceiptTaxArg.CGSTTaxAmount = dCGSTTaxAmt9;
        oReceiptTaxArg.CGSTAmount = dCGSTAmt9;
        oReceiptTaxArg.IGSTTaxAmount = dIGSTTaxAmt9;
        oReceiptTaxArg.IGSTAmount = dIGSTAmt9;
        oReceiptTaxArg.CessAmt = dCessAmt9;
        oReceiptTaxArg.AdditionalCessAmt = dAdditionalCessAmt9;
      } else if (oReceiptTaxArg.TaxId == 10) {
        oReceiptTaxArg.TaxAmount = dTaxAmt10;
        oReceiptTaxArg.Amount = dAmt10;
        oReceiptTaxArg.SGSTTaxAmount = dSGSTTaxAmt10;
        oReceiptTaxArg.SGSTAmount = dSGSTAmt10;
        oReceiptTaxArg.CGSTTaxAmount = dCGSTTaxAmt10;
        oReceiptTaxArg.CGSTAmount = dCGSTAmt10;
        oReceiptTaxArg.IGSTTaxAmount = dIGSTTaxAmt10;
        oReceiptTaxArg.IGSTAmount = dIGSTAmt10;
        oReceiptTaxArg.CessAmt = dCessAmt10;
        oReceiptTaxArg.AdditionalCessAmt = dAdditionalCessAmt10;
      } else if (oReceiptTaxArg.TaxId == 11) {
        oReceiptTaxArg.TaxAmount = dTaxAmt11;
        oReceiptTaxArg.Amount = dAmt11;
        oReceiptTaxArg.SGSTTaxAmount = dSGSTTaxAmt11;
        oReceiptTaxArg.SGSTAmount = dSGSTAmt11;
        oReceiptTaxArg.CGSTTaxAmount = dCGSTTaxAmt11;
        oReceiptTaxArg.CGSTAmount = dCGSTAmt11;
        oReceiptTaxArg.IGSTTaxAmount = dIGSTTaxAmt11;
        oReceiptTaxArg.IGSTAmount = dIGSTAmt11;
        oReceiptTaxArg.CessAmt = dCessAmt11;
        oReceiptTaxArg.AdditionalCessAmt = dAdditionalCessAmt11;
      } else if (oReceiptTaxArg.TaxId == 12) {
        oReceiptTaxArg.TaxAmount = dTaxAmt12;
        oReceiptTaxArg.Amount = dAmt12;
        oReceiptTaxArg.SGSTTaxAmount = dSGSTTaxAmt12;
        oReceiptTaxArg.SGSTAmount = dSGSTAmt12;
        oReceiptTaxArg.CGSTTaxAmount = dCGSTTaxAmt12;
        oReceiptTaxArg.CGSTAmount = dCGSTAmt12;
        oReceiptTaxArg.IGSTTaxAmount = dIGSTTaxAmt12;
        oReceiptTaxArg.IGSTAmount = dIGSTAmt12;
        oReceiptTaxArg.CessAmt = dCessAmt12;
        oReceiptTaxArg.AdditionalCessAmt = dAdditionalCessAmt12;
      } else if (oReceiptTaxArg.TaxId == 13) {
        oReceiptTaxArg.TaxAmount = dTaxAmt13;
        oReceiptTaxArg.Amount = dAmt13;
        oReceiptTaxArg.SGSTTaxAmount = dSGSTTaxAmt13;
        oReceiptTaxArg.SGSTAmount = dSGSTAmt13;
        oReceiptTaxArg.CGSTTaxAmount = dCGSTTaxAmt13;
        oReceiptTaxArg.CGSTAmount = dCGSTAmt13;
        oReceiptTaxArg.IGSTTaxAmount = dIGSTTaxAmt13;
        oReceiptTaxArg.IGSTAmount = dIGSTAmt13;
        oReceiptTaxArg.CessAmt = dCessAmt13;
        oReceiptTaxArg.AdditionalCessAmt = dAdditionalCessAmt13;
      } else if (oReceiptTaxArg.TaxId == 14) {
        oReceiptTaxArg.TaxAmount = dTaxAmt14;
        oReceiptTaxArg.Amount = dAmt14;
        oReceiptTaxArg.SGSTTaxAmount = dSGSTTaxAmt14;
        oReceiptTaxArg.SGSTAmount = dSGSTAmt14;
        oReceiptTaxArg.CGSTTaxAmount = dCGSTTaxAmt14;
        oReceiptTaxArg.CGSTAmount = dCGSTAmt14;
        oReceiptTaxArg.IGSTTaxAmount = dIGSTTaxAmt14;
        oReceiptTaxArg.IGSTAmount = dIGSTAmt14;
        oReceiptTaxArg.CessAmt = dCessAmt14;
        oReceiptTaxArg.AdditionalCessAmt = dAdditionalCessAmt14;
      } else if (oReceiptTaxArg.TaxId == 15) {
        oReceiptTaxArg.TaxAmount = dTaxAmt15;
        oReceiptTaxArg.Amount = dAmt15;
        oReceiptTaxArg.SGSTTaxAmount = dSGSTTaxAmt15;
        oReceiptTaxArg.SGSTAmount = dSGSTAmt15;
        oReceiptTaxArg.CGSTTaxAmount = dCGSTTaxAmt15;
        oReceiptTaxArg.CGSTAmount = dCGSTAmt15;
        oReceiptTaxArg.IGSTTaxAmount = dIGSTTaxAmt15;
        oReceiptTaxArg.IGSTAmount = dIGSTAmt15;
        oReceiptTaxArg.CessAmt = dCessAmt15;
        oReceiptTaxArg.AdditionalCessAmt = dAdditionalCessAmt15;
      }
    }

    var dTCSTaxableAmount = dAmt1 + dAmt2 + dAmt3 + dAmt4 + dAmt5 + dAmt6 + dAmt7 + dAmt8 + dAmt9 + dAmt10 + dAmt11 + dAmt12 + dAmt13 + dAmt14 + dAmt15;
    dTCSTaxableAmount = dTCSTaxableAmount + dTaxAmt1 + dTaxAmt2 + dTaxAmt3 + dTaxAmt4 + dTaxAmt5 + dTaxAmt6 + dTaxAmt7;
    dTCSTaxableAmount = dTCSTaxableAmount + dTaxAmt8 + dTaxAmt9 + dTaxAmt10 + dTaxAmt11 + dTaxAmt12 + dTaxAmt13 + dTaxAmt14 + dTaxAmt15;
    var dTCSTaxPers = parseFloat(<any>this.mainData.Receipt_TCSInPers || 0);
    var dTCSTaxAmt = 0;

    if (dTCSTaxPers > 0) {
      dTCSTaxAmt = (dTCSTaxableAmount * dTCSTaxPers) / 100;
    }

    this.mainData.Receipt_TCSInAmt = parseFloat(dTCSTaxAmt.toFixed(DeceimalPlace));

    var dTcsCalValue = parseFloat(<any>this.mainData.Receipt_TCSCalValue || 0)
    if (dTcsCalValue > 0) {

      if (dTCSTaxPers > 0) {
        dTCSTaxableAmount = dTcsCalValue;
        dTCSTaxAmt = (dTCSTaxableAmount * dTCSTaxPers) / 100;
        // $('#txtTCSInAmount').val(dTCSTaxAmt.toFixed(DeceimalPlace));
      }

    }

    let dInvoTotal = 0;
    dRof = 0;
    dInvoTotal = parseFloat(<any>this.mainData.Receipt_InvoAmt || 0);
    dTotAmt = dTotAmt + dOtherCharge + dExciseDuty + dPackingChg + dStampingChg - dDebitNoteAmt + dOtherChgTaxAmt + dPackingChgTaxAmt + dStampingChgTaxAmt + dTCSTaxAmt;
    dRof = dInvoTotal - dTotAmt;

    this.mainData.Receipt_Total = dTotAmt;
    this.mainData.Receipt_ROF = dRof;

    this.mainData.Receipt_Total = parseFloat(this.mainData.Receipt_Total.toFixed(DeceimalPlace));
    this.mainData.Receipt_ROF = parseFloat(this.mainData.Receipt_ROF.toFixed(DeceimalPlace));

    if (this.mainData.Field3 == "Amt")
      this.mainData.Receipt_Discount = parseFloat(this.mainData.Receipt_Discount.toFixed(DeceimalPlace));
    else
      this.mainData.DisAmt = parseFloat(this.mainData.DisAmt.toFixed(DeceimalPlace));

    this.mainData.MRPValue = parseFloat(this.mainData.MRPValue.toFixed(DeceimalPlace));
    this.mainData.VatCollected = parseFloat(this.mainData.VatCollected.toFixed(DeceimalPlace));
    this.mainData.PurchaseValue = parseFloat(this.mainData.PurchaseValue.toFixed(DeceimalPlace));
    this.mainData.Excempted = parseFloat(this.mainData.Excempted.toFixed(DeceimalPlace));
    // this.Receipt_IntrStAmt = parseFloat(this.Receipt_IntrStAmt.toFixed(DeceimalPlace));
    this.mainData.CSTAmt = parseFloat(this.mainData.CSTAmt.toFixed(DeceimalPlace));

    this.mainData.Receipt_OtherTaxAmt = parseFloat(dOtherChgTaxAmt.toFixed(DeceimalPlace));
    this.mainData.Receipt_OtherSGST = parseFloat(dOtherChgSGST.toFixed(DeceimalPlace));
    this.mainData.Receipt_OtherCGST = parseFloat(dOtherChgCGST.toFixed(DeceimalPlace));
    this.mainData.Receipt_OtherIGST = parseFloat(dOtherChgIGST.toFixed(DeceimalPlace));
    this.mainData.Receipt_PackingChgTaxAmt = parseFloat(dPackingChgTaxAmt.toFixed(DeceimalPlace));
    this.mainData.Receipt_PackingChgSGST = parseFloat(dPackingChgSGST.toFixed(DeceimalPlace));
    this.mainData.Receipt_PackingChgCGST = parseFloat(dPackingChgCGST.toFixed(DeceimalPlace));
    this.mainData.Receipt_PackingChgIGST = parseFloat(dPackingChgIGST.toFixed(DeceimalPlace));
    this.mainData.Receipt_StampingChgTaxAmt = parseFloat(dStampingChgTaxAmt.toFixed(DeceimalPlace));
    this.mainData.Receipt_StampingChgSGST = parseFloat(dStampingChgSGST.toFixed(DeceimalPlace));
    this.mainData.Receipt_StampingChgCGST = parseFloat(dStampingChgCGST.toFixed(DeceimalPlace));
    this.mainData.Receipt_StampingChgIGST = parseFloat(dStampingChgIGST.toFixed(DeceimalPlace));

    // for (const iterator of oListReceiptTaxInfo) {

    // }
  }

  settingsName = (value) => {
    return this.settings.find(x => x.KeyValue == value).Value
  }

}
