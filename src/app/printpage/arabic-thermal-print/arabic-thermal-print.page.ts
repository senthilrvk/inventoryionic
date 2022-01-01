import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { ModalController, ToastController } from '@ionic/angular';
import { PrintSettings } from '../print-settings/print-settings.model';
import EscPosEncoder from "esc-pos-encoder-ionic";
import domtoimage from 'dom-to-image';
import html2canvas from 'html2canvas';
import { Subject } from 'rxjs';
import { Invoice } from '@axenda/zatca';

@Component({
  selector: 'app-arabic-thermal-print',
  templateUrl: './arabic-thermal-print.page.html',
  styleUrls: ['./arabic-thermal-print.page.scss'],
})
export class ArabicThermalPrintPage {

  createdCode = 'test';
  @Input() branch: any;
  @Input() main: any
  @Input() sub: any[]
  @Input() printOption: PrintSettings
  @Input() tax: any[];
  strQRCode: string = "";
  private _unsubscribeAll = new Subject();
  constructor(
    private bluetoothSerial: BluetoothSerial,
    private modalpage: ModalController,
    private toastController: ToastController) {

    // var invoice = new Invoice({
    //   sellerName: String( 'senthil'),
    //   vatRegistrationNumber: String('win1'),
    //   invoiceTimestamp: String('date1'),
    //   invoiceTotal: String(300),
    //   invoiceVatTotal: String(100),
    // });



    //  this.strQRCode =  invoice.toBase64();

  }

  ngOnInit() {

    const totalVatAmount = this.sub.map(data => parseFloat(data.IssueSub_TaxAmt || 0))
      .reduce((total, value) => total + value);
    // console.log(this.main);
    // console.log(totalVatAmount);
    var invoice = new Invoice({
      sellerName: String(this.branch.BranchName),
      vatRegistrationNumber: String(this.branch.TinNo1),
      invoiceTimestamp: String(this.main.Issue_BillDate),
      invoiceTotal: String(this.main.Issue_Total),
      invoiceVatTotal: String(totalVatAmount),
    });

    this.strQRCode = invoice.toBase64();

  }

  fnClose(event) {
    event.preventDefault();
    this.modalpage.dismiss();
  }


  taxAmount() {
    if (this.sub) {
      return this.sub.map(x => parseFloat(x.IssueSub_TaxAmt || 0)).reduce((a, b) => a + b);
    } else {
      return 0
    }
  }

  public async print() {

    const img = new Image();
    let printHeight = (80 + this.sub.length * 10) * 8;

    const element = document.getElementById('target');

    const option = { allowTaint: true, useCORS: true };
    await html2canvas(element, option)
      .then((canvas) => {
        if (canvas) {
          var imgSrc = canvas.toDataURL('image/png');
          img.src = imgSrc;
          // numCopies
          img.onload = () => {
            const encoder = new EscPosEncoder();
            encoder
              .initialize()
              .codepage('cp936')
              .align('left')
              .image(img, 70 * 8, printHeight, 'atkinson')
              .newline()
              .newline();
            for (let index = 0; index < this.printOption.extraLine; index++) {
              encoder.newline();
            };

            this.sendPrint(encoder.encode())
          }
        }
      }).catch((err) => {
        console.error(err);
      });
  }

sendPrint(resultByte) {
  this.bluetoothSerial.connect(this.printOption.btAddress)
    .subscribe(() => {
        this.bluetoothSerial.write(resultByte)
          .then(() => {
            this.presentToast('Print success')
            this.bluetoothSerial.disconnect()
        })
        .catch((err) => {
            console.error(err);
            this.presentToast('Make sure Are You Connect Bluetooth Printer!!')
        });
    }, err => {
        this.presentToast('Make sure Are You Connect Bluetooth Printer!!')
  });
}


  async presentToast(msg) {
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
