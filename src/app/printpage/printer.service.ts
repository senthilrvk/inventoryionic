import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { AlertController, LoadingController, ModalController, ToastController } from '@ionic/angular';
import { BehaviorSubject, Observable } from 'rxjs';
import { PrintSettings } from './print-settings/print-settings.model';
import { ArabicThermalPrintPage } from './arabic-thermal-print/arabic-thermal-print.page';
import EscPosEncoder from 'esc-pos-encoder-ionic';

const httpsOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'charset=utf-8'
  })
};
@Injectable({
  providedIn: 'root'
})

export class PrinterService {
  newGroup = new PrintSettings();
  printerBehaviour$ = new BehaviorSubject<PrintSettings>(this.newGroup);


  // buff: any;


  constructor(public btSerial: BluetoothSerial,
    public toastController: ToastController,
    private alertCtrl: AlertController,
    private loadCtrl: LoadingController,
    public https: HttpClient,
    public modalController: ModalController) {
  }


  onPrinterSet(data) {

  }
  onPrinterGet(): Observable<PrintSettings> {
    return this.printerBehaviour$.asObservable();
  }




  searchBluetoothPrinter() {
    //This will return a list of bluetooth devices
    return this.btSerial.list();
  }
  connectToBluetoothPrinter(macAddress) {
    //This will connect to bluetooth printer via the mac address provided
    return this.btSerial.connect(macAddress)
  }

  disconnectBluetoothPrinter() {
    //This will disconnect the current bluetooth connection
    return this.btSerial.disconnect();
  }
  //macAddress->the device's mac address
  //data_string-> string to be printer

  sendToBluetoothPrinter(macAddress, data_string) {

    //1. Try connecting to bluetooth printer
    // this.btSerial.connect("60:A4:4C:96:22:F8", connectSuccess, connectFailure);
    let xyz = this.connectToBluetoothPrinter(macAddress)
      .subscribe((success) => {
        //2. Connected successfully
        this.btSerial.write(data_string)
          .then(async _ => {
            //3. Print successful
            //If you want to tell user print is successful,
            //handle it here
            //4. IMPORTANT! Disconnect bluetooth after printing
            this.presentToast('Printing........');
            let alert = await this.alertCtrl.create({
              header: 'Printing Successful!',
              // subHeader:'Click OK',
              message: 'Click OK (after printing!!!)',
              backdropDismiss: false,
              mode: 'ios',
              buttons: [{
                text: 'Ok',
                handler: () => {
                  this.disconnectBluetoothPrinter();
                },
              }, {
                text: 'Copy',
                handler: () => {
                  this.disconnectBluetoothPrinter();
                  setTimeout(async () => {
                    await this.sendToBluetoothPrinter(macAddress, data_string);
                  });

                },
              }
              ],
            });
            await alert.present();
            xyz.unsubscribe();
          }).catch(err => {
             //If there is an error printing to bluetooth printer
            //handle it here
            console.error(err);
            this.disconnectBluetoothPrinter();
            this.presentToast('printing not Completed');
          })
      }, error  => {
        console.log("Connection Error" +  error);
        if(this.loadCtrl.getTop())
        this.onDismissLoader()
        this.presentToast('printer not connecting to bluetooth');
        //If there is an error connecting to bluetooth printer
        //handle it here
      })
  }

  async onPrintingLoader() {
    if (await this.loadCtrl.getTop()) {
      await this.loadCtrl.dismiss()
      return
    }

    let load = await this.loadCtrl.create({
      message: 'Printing...',
      mode: 'ios'
    });
    await load.present();
  }

  async onDismissLoader() {
    let topLoader = await this.loadCtrl.getTop();
    while (topLoader) {
      if (!(await topLoader.dismiss())) {
        // throw new Error('Could not dismiss the topmost loader. Aborting...');
        break
      }
      topLoader = await this.loadCtrl.getTop();
    }
  }

  onIssuePrint(BillSerId, BillNo, UniqueNo, BranchId, apiurl): Observable<any> {

    let varArguements = {};
    varArguements = { BillSerId, BillNo, UniqueNo, BranchId };

    const DictionaryObject = { dictArgmts: {}, ProcName: '' };
    DictionaryObject.dictArgmts = varArguements;
    DictionaryObject.ProcName = '';

    const body = JSON.stringify(DictionaryObject);
    // tslint:disable-next-line:new-parens

    return this.https.post(apiurl + '/Sales/Sales_CopyPrint', body, httpsOptions)
  }

  async invoicePRint(params: any, branchId, apiurl: string, printOption: PrintSettings) {

    const billno = params.Issue_SlNo;
    const BillSerId = params.BillSerId;
    const UniqueBillNo = params.UniqueBillNo;


    this.onIssuePrint(BillSerId, billno, UniqueBillNo, branchId, apiurl)
      .subscribe(res => {
        let jsonData: any = res;

        const JsonIssueSubDetailsInfo = JSON.parse(jsonData.JsonIssueSubDetailsInfo);

        const JsonIssueTaxInfo = JSON.parse(jsonData.JsonIssueTaxInfo);
        const JsonBranchInfo = JSON.parse(jsonData.JsonBranchInfo)[0];
        const JsonIssueInfo = JSON.parse(jsonData.JsonIssueInfo)[0];

        if (!JsonIssueSubDetailsInfo.length) {

          return
        }
        this.thermalPrintReady(JsonIssueSubDetailsInfo, JsonIssueTaxInfo, JsonBranchInfo, JsonIssueInfo, printOption)
      }, err => {

      })
  }


  async thermalPrintReady(subSource, taxSource, branchSource, mainSource, printOption: PrintSettings) {

    if (printOption.arabic) {
      const myModal = await this.modalController.create({
        component: ArabicThermalPrintPage,
        // mode: "ios",
        componentProps: {
          branch: branchSource,
          main: mainSource,
          sub: subSource,
          tax: taxSource,
          printOption: printOption
        }

      });

      await myModal.present();
      const { data } = await myModal.onWillDismiss();
    } else {


      this.onNormalPrint(subSource, taxSource, branchSource, mainSource, printOption);
    }

  }



  async onNormalPrint(subSource, taxSource, branchSource, mainSource, printOption: PrintSettings) {

    let is3Inch = '';
    let underline = '--------------------------------';

    if (printOption.pageSize == '3inch') {
      is3Inch = '\x20\x20\x20';
      underline = '------------------------------------------------';
    }
    let branchAddress = '';
    let branchMbTin = '';

    let tableHead = `Name\x20\x20\x20\x20\x20\x20\x20${is3Inch}Qty\x20\x20\x20${is3Inch}Price\x20\x20\x20\x20${is3Inch}Amount`;
    if (printOption.serielNumberVisible) {
      tableHead = `Sl\x20Name\x20\x20\x20\x20${is3Inch}Qty\x20\x20\x20${is3Inch}Price\x20\x20\x20\x20${is3Inch}Amount`;
    }
    let taxAmount = 0;
    let produtItems = '';
    let totalQty = 0;
    let decimal = 0;
    if (printOption.decimal) {
      decimal = 2;
    }
    let dRatePlusTax = 0;
    let strRateDisplay = 0;
    let dActualRate = 0;
    for (let index = 0; index < subSource.length; index++) {
      const item = subSource[index];
      let qty = this.onQtyLength(`${item.IssueSub_Qty.toFixed(decimal)}`);
      if (item.Field2 != "Yes") {
        dRatePlusTax = dRatePlusTax + (dRatePlusTax * parseFloat(item.IssueSub_TaxPers || 0)) / 100;
        strRateDisplay = parseFloat(item.IssueSub_OriginalRate);
      } else {
        dActualRate = parseFloat(item.IssueSub_OriginalRate);
        dActualRate = parseFloat(item.IssueSub_OriginalRate) - ((parseFloat(item.IssueSub_OriginalRate) * parseFloat(item.IssueSub_TaxPers)) / (100 + parseFloat(item.IssueSub_TaxPers)));
        strRateDisplay = dActualRate;
      }

      const rate = this.onRateLength(`${strRateDisplay.toFixed(decimal)}`);
      if (printOption.serielNumberVisible) {
        produtItems += `${this.onNumberBeforeDeci(index + 1)}${item.ItemDesc}\x0a`;
      } else {
        produtItems += `${item.ItemDesc}\x0a`;
      }

      produtItems += this.getPoductList(item, printOption);
      produtItems += `\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20${is3Inch}`;
      produtItems += `${qty}${is3Inch}${rate}${is3Inch}${(item.IssueSub_Amount).toFixed(decimal)}\x0a`;
      totalQty += parseFloat(item.IssueSub_Qty);
      taxAmount += parseFloat(item.IssueSub_TaxAmt);
    }

    if (branchSource.Phone) {
      branchMbTin += branchSource.Phone + '\x0a\x1b\x61\x01';
    }

    if (branchSource.TinNo1) {
      branchMbTin += branchSource.TinNo1;
    }
    if (printOption.address) {
      branchAddress = branchSource.BranchAdr1 + '\x0a\x1b\x61\x01' +
        branchSource.BranchAdr2 + '\x0a\x1b\x61\x01' +
        branchSource.BranchAdr3 + '\x0a\x1b\x61\x01' +
        branchMbTin+ '\x0a';
    }

    let taxAmountVisible = '';
    if (printOption.taxDetail) {
      taxAmountVisible = "Tax\x20Amount\x20:\x20\x20\x20" +
        taxAmount.toFixed(decimal) + '\x0a';
    }
    let bankDetails = '';
    if (printOption.bankDetails) {
      bankDetails += `Bank\x20\x20\x20:\x20${branchSource.Branch_BankName}` + '\x0a'
      bankDetails += `IFSC\x20\x20\x20:\x20${branchSource.Branch_IFSCCODE}` + '\x0a'
      bankDetails += `AccNo\x20\x20:\x20${branchSource.Branch_BankAcNo}` + '\x0a'
      bankDetails += `Branch\x20:\x20${branchSource.Branch_BankAddr1}` + '\x0a'
    }
    let description = '';

    if (printOption.tandc) {
      if (branchSource.BranchFtr1)
        description += branchSource.BranchFtr1 + '\x0a\x1b\x61\x01';
      if (branchSource.BranchFtr2)
        description += branchSource.BranchFtr2 + '\x0a\x1b\x61\x01';
      if (branchSource.BranchFtr3)
        description += branchSource.BranchFtr3 + '\x0a\x1b\x61\x01';
      for (const desc of printOption.description) {
        description += desc + '\x0a\x1b\x61\x01';
      }

    }

    const encoder = new EscPosEncoder();
    let result = encoder
      .initialize()
      .bold()
      .align('center')
      .size('normal')
      .line(branchSource.BranchName)
      .align('center')
      .size('small')
      .text(branchAddress)
      .align('center')
      .bold()
      .text(`${mainSource.BillSerDescription}\x0a'`)
      .text(`${underline}\x0a`)
      .align('left')
      .text(`${mainSource.AC_Name}\x0a`)
      .align('left')
      .text(`${mainSource.Addr1}\x0a`)
      .align('left')
      .text(`GSTIN: ${mainSource.Tin1}\x0a`)

      .align('right')
      .text(`Date: ${mainSource.BillDate}\x0a`)
      .align('right')
      .text(`Invoice No: ${mainSource.BillSerPrefix}-${mainSource.Issue_SlNo}\x0a`)
      .text(`${underline}\x0a`)
      .align('left')
      .text(`${tableHead}\x0a`)
      .text(`${underline}\x0a`)
      .text(produtItems)
      .text(`${underline}\x0a`)
      .text(`Total\x20\x20\x20\x20\x20\x20${is3Inch}${this.onTotalQtyLength(totalQty.toFixed(decimal))}${is3Inch}${is3Inch}${mainSource.Issue_ATotal.toFixed(decimal)}\x0a`)
      .text(`${underline}\x0a`)
      // .align('right')
      // .bold()
      // .text(`Sub Total : ${mainSource.Issue_ATotal.toFixed(decimal)}\x0a`)
      .align('right')
      .bold()
      .text(taxAmountVisible)
      .align('right')
      .bold()
      .text(`Rof\x20:${mainSource.Issue_ROF.toFixed(decimal)}\x0a`)
      .align('right')
      .bold()
      .text(`Total\x20:${mainSource.Issue_Total.toFixed(decimal)}\x0a`)
      .align('left')
      .text(bankDetails)
      .align('center')
      .text(description + '\x0a')
      .text(underline)
      .newline()
      .encode();
      // let buffer;
      // for (let index = 0; index < printOption.numCopies; index++) {
      //   buffer += result
      // }

    await this.sendToBluetoothPrinter(printOption.btAddress, result);
  }


  getPoductList(item, printOption: PrintSettings) {
    let spaceSno = '';
    if (printOption.serielNumberVisible) {
      spaceSno = '\x20\x20\x20'
    }
    let decimal = 0;
    if (printOption.decimal) {
      decimal = 2;
    }
    let listItems = ''
    if (printOption.itemCodeVisible) {
      listItems += `${spaceSno}Code:\x20${item.ItemCode}\x0a`
    }
    if (printOption.hsnCodeVisible) {
      listItems += `${spaceSno}HSN\x20Code:\x20${item.HSNCode}\x0a`
    }

    if (printOption.mrpVisible) {
      listItems += `${spaceSno}Mrp:\x20${item.IssueSub_Mrp.toFixed(decimal)}\x0a`
    }
    if (printOption.taxVisible) {
      listItems += `${spaceSno}Tax(%):\x20${item.IssueSub_TaxPers}\x0a`
    }
    if (printOption.discVisible) {
      listItems += `${spaceSno}Disc(%):\x20${item.IssueSub_PdodDis}\x0a`
    }
    return listItems
  }

  async presentToast(mgs) {
    const toast = await this.toastController.create({
      message: mgs,
      duration: 2000
    });
    toast.present();
  }

  onQtyLength(item) {
    const lengths = item.length;
    const str = '\x20\x20\x20\x20\x20\x20'
    const substr = str.slice(lengths);
    return `${item}${substr}`;
  }
  onNumberBeforeDeci(myNumber) {
    const lengths = myNumber.toString().length;
    const str = '\x20\x20\x20'
    const substr = str.slice(lengths);
    return `${myNumber}${substr}`
  }
  onRateLength(item) {
    const lengths = item.length;
    const str = '\x20\x20\x20\x20\x20\x20\x20\x20'
    const substr = str.slice(lengths);
    return `${item}${substr}`;
  }

  onTotalQtyLength(item) {
    const lengths = item.length;
    const str = '\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20'
    const substr = str.slice(lengths);
    return `${item}${substr}`;
  }

  onTotalItemDescLength(item) {
    const lengths = item.length;
    const str = '\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20\x20'
    const substr = str.slice(lengths);
    return `${item}${substr}`;
  }

}
