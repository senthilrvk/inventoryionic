import { VoucherReceiptService } from './voucher-receipt.service';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { Printer, PrintOptions } from '@ionic-native/printer/ngx';
import { AlertController, ModalController } from '@ionic/angular';
import { DocShareService } from 'src/app/printpage/components/print-share-pdf/doc-share.service';
import { AddCustomerComponent } from 'src/app/dialogue/add-customer/add-customer.component';
import { ControlService } from 'src/app/core/services/controlservice/control.service';

@Component({
  selector: 'app-voucher-receipt',
  templateUrl: './voucher-receipt.component.html',
  styleUrls: ['./voucher-receipt.component.scss'],
  encapsulation: ViewEncapsulation.None
})
  
export class VoucherReceiptComponent implements OnInit {

  @ViewChild('search', { static: false }) searchFocus;
  @ViewChild('txtbank', { static: false }) bankFocus;

  today = new Date().toISOString();
  fromdate: any;
  Todate: any;
  searchbar: boolean;
  // tslint:disable-next-line:variable-name
  div_create: boolean;
  receiptdate: any;
  chequeDate: any;
  BranchId: any;
  Apiurl: any;
  jsonSalesMan: any;
  salesmanId: any;
  fromname: any;
  address: any;
  receiptId: any;
  jsonBankgets = [];
  bankName: any;
  VoucherNo: any;
  jsonOutstanting = [];
  outstanding: any;
  RetAdjAmt: any;
  BankId: any;
  reciveAmount: any;
  AcId: any;
  StaffId: any;
  popbank: boolean;
  BankTranferId: string = '0';
  // tslint:disable-next-line:variable-name
  bank_customer: string;
  // tslint:disable-next-line:variable-name
  bank_ChequeNo: string;
  balanceAmt: number;
  OutstantingUpdate: any[];
  AmtAdjustCondition: any;
  paidBalanceAmt: any;
  remarks: any;
  AutoAdjustReceiptPending: any;
  // tslint:disable-next-line:variable-name
  bank_loding: boolean;
  searchCondition: any;
  searchCash: any;
  jsonVoucherData: any;
  searchKey: string;
  voucherload: boolean;
  toCustomer: any;
  disBank: boolean;
  disChequeNo: boolean;
  disSelectBank: boolean;
  disTransferType: boolean;
  disChequeDate: boolean;
  disReceiptType: boolean;
  EditdaysCondition: any;
  btnSave: boolean;
  showDiv: boolean;
  UniqueVoucherId: any;
  listVouchersJson = [];
  voucherSaveFlag: boolean;
  phoneNo: any;
  strReceiptSmsFormat: any;
  txtCopyVoucherNo: number = 0;
  saveLoad: boolean = false;

  constructor(
    public modalController: ModalController,
    public alertController: AlertController,
    private ctrlService: ControlService,
    public datePicker: DatePicker,
    public sharePage: DocShareService,
    private printer: Printer,
    public voucherService: VoucherReceiptService) {
  }

  ngOnInit() {
    this.receiptId = 'cash';
    this.div_create = true;
    this.searchCondition = 'EnterDate';

    const date: Date = new Date();
    date.setDate(1);
    this.fromdate = this.DateReverse(date.toISOString());
    const dates: Date = new Date();
    this.Todate = this.DateReverse(this.today);


    this.searchKey = '';
    this.ctrlService.get('SessionBranchId').then(result => {
      if (result != null) {
        this.BranchId = result;
      }
    });

    this.ctrlService.get('sessionInvenBranchId').then(result => {
      if (result != null) {
        this.BranchId = result;
      }
    });

    this.ctrlService.get('SessionSalesmanId').then(result => {
      if (result != null) {
        this.StaffId = result;
      }
    });

    this.ctrlService.get('sessionInvenStaffId').then(result => {
      if (result != null) {
        this.StaffId = result;
      }
    });

    this.ctrlService.get('sessionsurl').then(result => {
      if (result != null) {
        this.Apiurl = result;
        this.fnSettings();
      }
    });


  }

  DateReverse(value) {
    const dateFormat = value.split('T');
    const date = dateFormat[0].split('-').reverse().join('/');
    return date;
  }


  async calenderPicker(val) {
    if (val === 'from') {
      this.ctrlService.onDatePicker(this.fromdate, val).then(
        date => {

          this.fromdate = this.dateFormat(date);
          this.fnVoucherGets();
        },
        err => console.log('Error occurred while getting date: ', err)
      );
    } else if (val === 'receipt') {
      this.ctrlService.onDatePicker(this.receiptdate, val).then(
        date => {
          this.receiptdate = this.dateFormat(date);
        },
        err => console.log('Error occurred while getting date: ', err)
      );

    } else if (val === 'cheque') {
      this.ctrlService.onDatePicker(this.chequeDate, val).then(
        date => {
          this.chequeDate = this.dateFormat(date);
        },
        err => console.log('Error occurred while getting date: ', err)
      );

    } else {
      this.ctrlService.onDatePicker(this.Todate, val).then(
        date => {
          this.Todate = this.dateFormat(date);
          this.fnVoucherGets();
        },
        err => console.log('Error occurred while getting date: ', err)
      );

    }
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

  fnsearchFocus() {
    setTimeout(() => {
      this.searchFocus.setFocus();
    }, 200);
  }

  async presentAlert(value) {
    const alert = await this.alertController.create({
      header: 'Alert',
      mode: "ios",
      // subHeader: 'Subtitle',
      message: value,
      buttons: ['OK']
    });

    await alert.present();
  }

  async fnSettings() {
    const dictArgmts = { ProcName: 'Settings_GetValues' };
    const body = JSON.stringify(dictArgmts);
    this.voucherService.post(this.Apiurl + '/Master/fnSettings', body)
      .subscribe(result => {
        const jsonSettings = result;
        jsonSettings.forEach(element => {
          if (element.KeyValue === 'LeaderSms') {

          } else if (element.KeyValue === 'AccountEditDays') {
            this.EditdaysCondition = element.Value;
          } else if (element.KeyValue === 'AmtAdjustCondition') {

            this.AmtAdjustCondition = element.Value;
          } else if (element.KeyValue === 'AutoAdjustReceiptPending') {
            this.AutoAdjustReceiptPending = element.Value;
          } else if (element.KeyValue === 'ReceiptSmsFormat') {
            this.strReceiptSmsFormat = element.Value;
          }
        });
      });
  }

  fncreate() {
    this.div_create = false;
    this.btnSave = true;
    this.phoneNo = '';
  
    this.fnClear();

    this.disBank = false;
    this.disChequeNo = false;
    this.disSelectBank = true;
    this.disTransferType = false;
    this.disChequeDate = false;
    this.disReceiptType = false;
  }



  logForm(event) {
    // let formlength = event.target.length;
    // for (let i = 0; i < formlength; i++) {
    //   console.log(event.target[i].value);
    // }
    this.fnsave();
  }

  getDateConvert(value) {
    const splitDate = value.split('-');
    const year = splitDate[0];
    const month = splitDate[1];
    const tempDate = splitDate[2].split('T');
    const DateFormat = year + '/' + month + '/' + tempDate[0];
    return DateFormat;
  }

  getDateConvertddmmyy(value) {
    const splitDate = value.split('-');
    const year = splitDate[0];
    const month = splitDate[1];
    const tempDate = splitDate[2].split('T');
    const DateFormat = tempDate[0] + '/' + month + '/' + year;
    return DateFormat;
  }

  fnReceivedAmt(event) {

    const dOldLeaderAmt = Number(this.outstanding);
    let dAdjReceiveAmt: any = Number(event.target.value);
    this.reciveAmount = dAdjReceiveAmt;
    const dLeadgerBalance = dOldLeaderAmt - dAdjReceiveAmt;
    this.balanceAmt = dLeadgerBalance;

    if (this.AutoAdjustReceiptPending !== 'No') {
      this.jsonOutstanting.map(x => x.PaidAmt = 0);
      var PaidAmt = 0;
      for (const data of this.jsonOutstanting) {
        let BalanceAmt = parseFloat(data.BalanceAmt || 0);
        if (BalanceAmt <= dAdjReceiveAmt) {
          PaidAmt = BalanceAmt;
          dAdjReceiveAmt = dAdjReceiveAmt - BalanceAmt;
        } else {
          PaidAmt = dAdjReceiveAmt;
          dAdjReceiveAmt = 0;
        }
        data.PaidAmt = PaidAmt;
      }
    } else {
      for (const data of this.jsonOutstanting) {
        let dPaidAmt = parseFloat(data.PaidAmt || 0);
        dAdjReceiveAmt = dAdjReceiveAmt - dPaidAmt;
      }
    }

    this.paidBalanceAmt = dAdjReceiveAmt;
  }

  fnSalesManGets() {

    const BranchId = this.BranchId;
    this.voucherService.onSalesManGet(BranchId, this.Apiurl)
      .subscribe(data => {
        this.jsonSalesMan = JSON.parse(data);
        this.salesmanId = this.jsonSalesMan[0].AC_Id;
        this.fnNextVoucherNo();
      }, err => console.error(err));
  }

  fnsalesman(event) {
    this.salesmanId = event.detail.value;
  }

  fnreceiptChange(event) {
    this.receiptId = event.detail.value;
    // console.log(this.receiptId);
    if (this.receiptId === 'bank') {
      this.popbank = true;
      setTimeout(() => {
        this.bankFocus.setFocus();
      }, 200);
    }
    this.fnNextVoucherNo();
  }

  
  fnCustomerClick(data) {
    this.AcId = data.AC_Id;
    this.fromname = data.AC_Name;
    this.address = data.Addr1;
    this.phoneNo = data.Phone;
    this.fnOutstanding(data);
  }

  fnback() {
    this.div_create = true;
    this.searchbar = false;
    this.popbank = false;

  }

  fnOutstanding(item) {
    let nVoucherId = 1;
    if (this.receiptId === 'bank') {
      nVoucherId = 3;
    } else { nVoucherId = 1; }

    this.voucherService.onOutStanding(item.AC_Id, nVoucherId, this.BranchId, this.Apiurl)
      .toPromise().then(data => {
        this.jsonOutstanting = JSON.parse(data);
      }).finally(() => {
        this.fnGetLeadgerBalanceOnAccountId(item);
      })
  }

  fnBankClick(item) {
    this.bankName = item.BankName;
    this.BankId = item.AC_Id;
    this.jsonBankgets = [];
  }

  fnBankAccountHeadGets(event) {
    this.bank_loding = true;
    const search = event.target.value;
    if (search) {
      this.voucherService.onBankAccGets(search, this.BranchId, this.Apiurl)
        .subscribe(data => {
          this.jsonBankgets = JSON.parse(data);
          this.bank_loding = false;
        }, err => console.error(err));
    } else {
      this.jsonBankgets = [];
      this.bank_loding = false;
    }
  }

  fnNextVoucherNo() {
    let value = 1;
    const ReceiptType = this.receiptId;

    if (ReceiptType != 'cash') {
      value = 3;
    }

    this.voucherService.onNextVoucherNumber(value, this.BranchId, this.Apiurl)
      .toPromise().then(data => {
        const jsongets = JSON.parse(data);

        this.VoucherNo = jsongets[0].VoucherNo;
        // console.log(this.VoucherNo);

      }, err => console.error(err));
  }

  fnBankTransfer(event) {
    this.BankTranferId = event.detail.value;
  }

  fnGetLeadgerBalanceOnAccountId(data) {

    this.voucherService.onLedgerAcId(data.AC_Id, this.BranchId, this.Apiurl)
      .subscribe(res => {
        const jsonledgerBal = JSON.parse(res);

        this.outstanding = jsonledgerBal[0].OpeningBalance;
        this.RetAdjAmt = jsonledgerBal[0].ReturnAmt;
      });
  }


  fnPaidAmtCalculation() {
    let dReceiveAmt = parseFloat(this.reciveAmount);
    if (dReceiveAmt == 0 || !dReceiveAmt) {
      this.presentAlert('Enter Receive Amount');
      return;
    }
    for (const item of this.jsonOutstanting) {
      let dPaidAmt = parseFloat(item.PaidAmt || 0);
      let dDisAmt = parseFloat(item.DisAmt || 0);
      let dReturn = parseFloat(item.ReturnAmt || 0);
      let dBalanceAmt = parseFloat(item.BalanceAmt || 0);
      let dEnterAmt = dPaidAmt + dDisAmt + dReturn;

      if (dEnterAmt > dBalanceAmt) {
        this.presentAlert('Enter Valid Amount');
        this.fnBalanceAmtCal();
        return;
      }
    }
    this.fnBalanceAmtCal();
  }


  async fnsave() {
    this.fnBalanceAmtCal();
    const BranchId = this.BranchId;
    const StaffId = this.StaffId;
    const VoucherNo = Number(this.txtCopyVoucherNo);
    const CopyUniqueVoucherId = Number(this.UniqueVoucherId);


    let dPrefixId = 0;
    const ReceiptType = this.receiptId;

    if (ReceiptType === 'cash') {
      dPrefixId = 1;
    } else { dPrefixId = 3; }

    const dBankId = this.BankId;
    const AcId = this.AcId;
    const SalesMan = this.salesmanId;

    const ReceiveAmt = this.reciveAmount;
    const totReceiveAmt = this.reciveAmount;

    if (dPrefixId === 3 && dBankId === 0) {
      this.presentAlert('Select Bank');
      return;
    }

    if (dPrefixId === 3 && this.BankTranferId == '0' && !this.bank_ChequeNo) {
      this.presentAlert('Enter Cheque Number');
      return;
    }

    if (ReceiveAmt === '') {
      this.presentAlert('Enter Amount');
      return;
    }

    if (AcId === '') {
      this.presentAlert('Select AccountHead');
      return;
    }


    let strChequeSaveFlag = 'Yes';
    const dTransType = this.BankTranferId;

    if (dPrefixId === 3 && dTransType === '0') {

      this.voucherService.onCheckRepotest(this.bank_ChequeNo,
        VoucherNo,
        CopyUniqueVoucherId,
        BranchId, this.Apiurl)
        .subscribe(data => {
          const jsonobj = JSON.parse(data);
          if (jsonobj.length !== 0) {
            strChequeSaveFlag = 'No';
          }
        });
      if (strChequeSaveFlag === 'No') {
        this.presentAlert('Cheque No Already Exist');
        return;
      }
    }

    let dSumPaidAmt = 0;
    // this.jsonOutstanting.forEach(data => {
    //   dSumPaidAmt += parseFloat(data.ReceiveAmt);
    // });
    const ListOutstandingInfo = [];
    let ListAccountLogFileInfo = [];
    let bAdjustAmoutIsValid = true;
    this.jsonOutstanting.forEach(data => {
      const OutstandingInfo = {
        VType_SlNo: 0, Voucher_VoucherNo: 0, ReceiveAmt: 0,
        DisAmt: 0, RetAmt: 0, BillNo: '', UniqueNo: 0, Issue_Amount: 0, UniqueVoucherId: 0
      };
      OutstandingInfo.VType_SlNo = parseFloat(data.VType_SlNo);
      OutstandingInfo.Voucher_VoucherNo = parseFloat(data.Voucher_VoucherNo);
      OutstandingInfo.ReceiveAmt = parseFloat(data.PaidAmt || 0);
      OutstandingInfo.DisAmt = parseFloat(data.DisAmt || 0);
      OutstandingInfo.RetAmt = parseFloat(data.ReturnAmt || 0);
      OutstandingInfo.BillNo = String(data.BillNo);
      OutstandingInfo.UniqueNo = parseFloat(data.UniqueNo || 0);
      OutstandingInfo.Issue_Amount = parseFloat(data.BillAmount || 0);
      OutstandingInfo.UniqueVoucherId = parseFloat(data.UniqueVoucherId || 0);
      ListOutstandingInfo.push(OutstandingInfo);

      let AccountLogFileInfo = {}
      AccountLogFileInfo["VoucherNo"] = parseFloat(data.Voucher_VoucherNo || 0);
      AccountLogFileInfo["Voucher_Prefix"] = parseFloat(data.VType_SlNo || 0);
      AccountLogFileInfo["ReceiveVoucherNo"] = VoucherNo;
      AccountLogFileInfo["ReceiveVoucherPrifix"] = dPrefixId;
      AccountLogFileInfo["BillAmount"] = parseFloat(data.BillAmount || 0);
      AccountLogFileInfo["AdjustAmt"] = parseFloat(data.PaidAmt || 0);
      AccountLogFileInfo["Date"] = '';
      AccountLogFileInfo["BranchId"] = Number(this.BranchId);
      AccountLogFileInfo["AcId"] = AcId;
      AccountLogFileInfo["Field1"] = '';
      AccountLogFileInfo["DisAmt"] = parseFloat(data.DisAmt || 0);
      AccountLogFileInfo["ReturnAmt"] = parseFloat(data.ReturnAmt || 0);
      AccountLogFileInfo["UniqueNo"] = parseFloat(data.UniqueNo || 0);
      AccountLogFileInfo["UniqueVoucherId"] = parseFloat(data.UniqueVoucherId || 0);
      AccountLogFileInfo["CRUniqueVoucherId"] = CopyUniqueVoucherId;
      ListAccountLogFileInfo.push(AccountLogFileInfo);

      dSumPaidAmt += parseFloat(data.PaidAmt || 0);
    });

   
    await this.voucherService.savepost(this.Apiurl + '/Accounts/fnAmountAdjustmentValidationCheck', ListAccountLogFileInfo)
      .toPromise().then(async res => {
        let jsonobj = JSON.parse(res);
        if (jsonobj.length > 0) {
          bAdjustAmoutIsValid = false;
        }
       
        if (!bAdjustAmoutIsValid) {
          this.presentAlert('Invalid Receive Amount',);
          return;
        }
        if (this.AmtAdjustCondition == 'Yes' && parseFloat(totReceiveAmt || 0) != dSumPaidAmt) {
          this.presentAlert('Receive  Amount Adjusted Against Bill Not Corrected');
          return;
        }
        if (dSumPaidAmt > totReceiveAmt) {
          this.presentAlert('Enter Valid Bill Adjustment Amount.');
          return;
        }

        const receiptdate = this.receiptdate;
        const chequeDate = this.chequeDate;

        const VoucherDetailsInfo = {
          Remarks: '', Voucher_Field6: '', Voucher_Date: '', Voucher_ChequeNo: '', Voucher_ChequeDate: '',
          Voucher_Amt: 0, Voucher_BankName: '', VPrefix_No: 0, AC_Id: '', Voucher_Description2: '',
          BalanceAmt: 0, BankId: '', RepId: '', BranchId: 0, StaffId: '', Voucher_NoField4: 0,
          Voucher_VoucherNo: 0, UniqueVoucherId: 0, Field4: '', VoucherGroupId: 0, ListOutstandingInfo: {}
        };
        VoucherDetailsInfo.Remarks = this.remarks;
        VoucherDetailsInfo.Voucher_Field6 = '',
          VoucherDetailsInfo.Voucher_Date = receiptdate; // this.getDateConvertddmmyy(this.receiptdate);
        VoucherDetailsInfo.Voucher_ChequeNo = String(this.bank_ChequeNo);
        VoucherDetailsInfo.Voucher_ChequeDate = chequeDate;
        VoucherDetailsInfo.Voucher_Amt = Number(this.reciveAmount);
        VoucherDetailsInfo.Voucher_BankName = this.bank_customer;
        VoucherDetailsInfo.VPrefix_No = dPrefixId;
        VoucherDetailsInfo.AC_Id = AcId;
        VoucherDetailsInfo.Voucher_Description2 = '';
        VoucherDetailsInfo.BalanceAmt = Number(this.paidBalanceAmt);
        VoucherDetailsInfo.BankId = dBankId;
        VoucherDetailsInfo.RepId = SalesMan;
        VoucherDetailsInfo.BranchId = Number(BranchId);
        VoucherDetailsInfo.StaffId = StaffId;
        VoucherDetailsInfo.Voucher_VoucherNo = VoucherNo;
        VoucherDetailsInfo.UniqueVoucherId = CopyUniqueVoucherId;
        VoucherDetailsInfo.Field4 = String(this.BankTranferId);
        VoucherDetailsInfo.VoucherGroupId = 0;

        VoucherDetailsInfo.ListOutstandingInfo = ListOutstandingInfo;

        const body = JSON.stringify(VoucherDetailsInfo);
        this.saveLoad = true;
        this.voucherService.savepost(this.Apiurl + '/Accounts/fnReceiptSave', body)
          .toPromise().then(data => {
            const JsonVoucherDetailsInfo = data;
            this.saveLoad = false;
            this.presentSMSConfirm();
          }, error => {
            console.log(error);
            this.saveLoad = false;
          });
      });

    // bSaveFlag = false;

  }
  async presentSMSConfirm() {
    let strmsg;
    strmsg = this.strReceiptSmsFormat;
    // strmsg = strmsg.replace("(BranchName)", $('#txtBranchCompany').val())
    strmsg = strmsg.replace("(AccountHead)", this.fromname)
    strmsg = strmsg.replace("(VoucherNo)", this.VoucherNo)
    strmsg = strmsg.replace("(ReceiveAmt)", this.reciveAmount)
    strmsg = strmsg.replace("(LedgerAmount)", 'Balance Amt: Rs. ' + this.outstanding)

    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      mode: "ios",
      header: 'Confirm!',
      message: 'Do you want send <strong> Message</strong>!!!',
      backdropDismiss: false,
      inputs: [
        {
          name: 'msg',
          type: 'text',
          value: strmsg
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            this.presentAlert('Voucher No ' + this.VoucherNo + ' Saved Successfully');
            this.fnClear();
          }
        }, {
          text: 'Send',
          handler: (res) => {
            this.presentAlert('Voucher No ' + this.VoucherNo + ' Saved Successfully');
            this.fnMsgSend(res.msg);
          }
        }
      ]
    });

    await alert.present();
  }

  fnMsgSend(msg) {
    this.voucherService.onSendMsg(this.phoneNo,msg,this.StaffId, this.BranchId, this.Apiurl)
      .subscribe(data => {
        this.fnClear();
      })
  }

  fnBalanceAmtCal() {
    let dTotPaidAmt = 0;
    this.jsonOutstanting.forEach(data => {
      const dPaidAmt = data.PaidAmt;
      dTotPaidAmt += dPaidAmt;
    });
    const dReceiveAmt = this.reciveAmount;

    this.paidBalanceAmt = dReceiveAmt - dTotPaidAmt;
  }

  fnSearchCondition(event) {
    this.searchCondition = event.detail.value;
    this.fnVoucherGets();
  }

  fnchangeBanktype(event) {
    this.searchCash = event.detail.value;
    setTimeout(() => {
      this.fnVoucherGets();
    }, 2000);

  }
  fnsearch(event) {
    this.searchKey = event.target.value;
    this.fnVoucherGets();
  }

  onReverseDate(value) {
    const dateconvert = value.split('/').reverse().join('/');
    return dateconvert;
  }

  onReverseDatemin(value) {
    const dateconvert = value.split('-').reverse().join('/');
    return dateconvert;
  }

  fnVoucherGets() {
   
    this.jsonVoucherData = [];
    const keyword = this.searchKey;
    let dPrefixId = 0;

    if (this.searchCash === 'cash') {
      dPrefixId = 1;
    } else {
      dPrefixId = 3;
    }
    const isFromdate = this.fromdate;
    const isTodate = this.Todate;
    if (!this.Apiurl) return
      
    this.voucherload = true;
    this.voucherService.onVoucherGets(
      keyword, dPrefixId, this.searchCondition,
      this.onReverseDate(isFromdate),
      this.onReverseDate(isTodate),
      this.BranchId,
      this.Apiurl
    ).subscribe(result => {
      const jsonData = JSON.parse(result.JsonDetails[0]);
      this.jsonVoucherData = jsonData;
      setTimeout(() => {
        this.voucherload = false;
      });
    }, error => {
      console.error(error);
      setTimeout(() => {
        this.voucherload = false;
      });

    });
  }

  async fnAnchorClick(item) {
    if (item.Flag == 'Cancelled@#@#@VoucherDetail') {
      this.presentAlert('Canceled bill Not View in App')
      return
    }

    this.voucherService.onAnchorGets(item, this.BranchId, this.Apiurl)
      .subscribe(data => {
        const jsonAdjustedBill = JSON.parse(data.AdjustBill);
        const JsonVoucherDetails = JSON.parse(data.VoucherDetails);
        if (!JsonVoucherDetails.length) {
          return
        }
        this.phoneNo = JsonVoucherDetails[0].Phone;


        this.fncreate();

        this.fromname = JsonVoucherDetails[0].AC_Name;
        this.reciveAmount = JsonVoucherDetails[0].Voucher_Amt;
        this.address = JsonVoucherDetails[0].Addr1;
        this.VoucherNo = JsonVoucherDetails[0].Voucher_VoucherNo;
        this.receiptdate = this.onReverseDatemin(JsonVoucherDetails[0].Voucher_Date);
        this.bank_customer = JsonVoucherDetails[0].Voucher_BankName;
        // this.preFixId = 0; // $('#VPrefixId').val(JsonVoucherDetails[0].VPrefix_No);
        this.UniqueVoucherId = JsonVoucherDetails[0].UniqueVoucherId;
        this.txtCopyVoucherNo = JsonVoucherDetails[0].Voucher_VoucherNo;
        this.AcId = JsonVoucherDetails[0].AC_Id;
        this.salesmanId = JsonVoucherDetails[0].RepId.toString();
        this.BankTranferId = JsonVoucherDetails[0].Field4; // $('#ddlTransferType').val(JsonVoucherDetails[0].Field4);
        this.remarks = JsonVoucherDetails[0].Remarks;
        let isChecked = false;

        this.fnOutstandingFillForCopyNew(item.VoucherNo1, item.VoucherPrefixNo, item.UniqueVoucherId);
        if (this.searchCash === 'bank') {
          isChecked = true;
        }
        if (item.VoucherPrefixNo === 3) {
          isChecked = true;
        }
        this.receiptId = 'cash';
        // console.log(JSON.parse(data.VoucherDetails));
        // console.log(JSON.parse(data.BankDetails));
        if (isChecked) {
          const JsonBankDetails = JSON.parse(data.BankDetails);
          let jsonbankIndex = JsonBankDetails[0];
          if (JsonBankDetails.length === 0) {
            jsonbankIndex = JsonBankDetails;
          }
          // console.log(jsonbankIndex);
          this.bankName = jsonbankIndex.AC_Name;
          this.bank_ChequeNo = jsonbankIndex.Voucher_ChequeNo;
          this.chequeDate = this.onReverseDatemin(jsonbankIndex.Voucher_ChequeDate);
          this.receiptId = 'bank';
          this.BankId = jsonbankIndex.RevAC_Id;
          this.popbank = true;
          this.disBank = false;
          this.disChequeNo = false;
          this.disSelectBank = false;
          this.disTransferType = false;
          this.disChequeDate = false;
        } else {
          this.toCustomer = 'CASH ACCOUNTS';
          this.disBank = true;
          this.disChequeNo = true;
          this.disSelectBank = true;
          this.disTransferType = true;
          this.disChequeDate = true;
          this.popbank = false;
          this.receiptId = 'cash';
        }
        const today = new Date();
        const dd = today.getDate();
        const mm = today.getMonth() + 1;
        const yyyy = today.getFullYear();

        const BillDate1 = JsonVoucherDetails[0].Voucher_Date.split('-');
        const startDay = new Date(yyyy, mm, dd);
        const endDay = new Date(BillDate1[0], BillDate1[1], BillDate1[2]);
        const millisecondsPerDay = 1000 * 60 * 60 * 24;
        const millisBetween = startDay.getTime() - endDay.getTime();
        let days = millisBetween / millisecondsPerDay;
        days = Math.floor(days);
        const dEditDaysLimit = this.EditdaysCondition;

        if (dEditDaysLimit <= days) {
          this.btnSave = false;
        }
        const BounceFlag = JsonVoucherDetails[0].Voucher_Description2;

        if (BounceFlag.includes('(Bounce)')) {
          this.btnSave = false;
        }
        this.disReceiptType = true;
        this.fnBalanceAmtCal();

      }, err => {
        console.log(err);
      });

  }

  fnOutstandingFillForCopyNew(VoucherNo, PrefixId, UniqueVoucherId) {

    this.voucherService.onOutstandingFillForCopyNew(
      VoucherNo, PrefixId, UniqueVoucherId,
      this.AcId, this.BranchId, this.Apiurl).subscribe(data => {
        const jsonData = JSON.parse(data);
        const ListOutStanding = [];
        jsonData.forEach(res => {
          const outstandinglist = {
            BalanceAmt: 0, BillAmount: 0, BillDate: 0, BillNo: 0,
            DueDays: 0, Field2: 0, ReceiveAmt: 0, SalesExe_Name: '', UniqueNo: 0, UniqueVoucherId: 0,
            VType_SlNo: 0, Voucher_VoucherNo: 0, PaidAmt: 0, DisAmt: 0, RetAmt: 0
          };
          outstandinglist.BalanceAmt = res.BalanceAmt;
          outstandinglist.BillAmount = res.BillAmount;
          outstandinglist.BillDate = res.BillDate;
          outstandinglist.BillNo = res.BillNo;
          outstandinglist.DueDays = res.DueDays;
          outstandinglist.Field2 = res.Field2;
          outstandinglist.ReceiveAmt = res.ReceiveAmt;
          outstandinglist.SalesExe_Name = res.SalesExe_Name;
          outstandinglist.UniqueNo = res.UniqueNo;
          outstandinglist.UniqueVoucherId = res.UniqueVoucherId;
          outstandinglist.VType_SlNo = res.VType_SlNo;
          outstandinglist.Voucher_VoucherNo = res.Voucher_VoucherNo;
          outstandinglist.PaidAmt = res.PaidAmt;
          outstandinglist.DisAmt = res.DisAmt;
          outstandinglist.RetAmt = res.ReturnAmt;
          ListOutStanding.push(outstandinglist);
        });
        // console.log(ListOutStanding);
        this.jsonOutstanting = ListOutStanding;
      }, err => console.error(err));
  }

  fnClear() {
    this.VoucherNo = 0;
    this.txtCopyVoucherNo = 0;
    this.fnSalesManGets();
    this.BankId = 0;
    this.AcId = '';
    this.paidBalanceAmt = 0;
    this.UniqueVoucherId = 0;
    this.BankTranferId = '0';
    this.disReceiptType = false;
    this.fromname = '';
    this.address = '';
    // this.receiptdate = new Date().toISOString();
    this.receiptdate = this.DateReverse(this.today);
    this.outstanding = '';
    this.balanceAmt = 0;
    this.RetAdjAmt = '';
    this.bankName = '';
    this.receiptId = 'cash';
    this.reciveAmount = '';
    this.remarks = '';
    this.jsonOutstanting = [];
    this.bank_customer = '';
    this.bank_ChequeNo = '';
    this.voucherSaveFlag = false;
    this.chequeDate = this.DateReverse(this.today);
   
  }

  toggleChange(event) {
    this.showDiv = !this.showDiv;
  }

  voucherData = {
    branchName: '', BranchAdr1: '', BranchAdr2: '', TinNo1: '', vouchNo: 0, fromName: '', SumOfWord: '', By: '',
    Remarks: '', Date: '', oldBal: '', RcdAmt: '', balAmt: ''
  }


  fnPrint(item, value) {
    
    this.voucherService.onPrint(item, this.BranchId, this.Apiurl)
      .subscribe(data => {
        let voucher = JSON.parse(data);
        let params = voucher[0];
        let type = ''
        if (params.VPrefix_No == 3 || params.VPrefix_No == 4) {
          type = 'BANK'
        }
        this.voucherData = {
          branchName: '', BranchAdr1: '', BranchAdr2: '', TinNo1: '',
          vouchNo: params.VoucherNo, fromName: params.AC_Name, SumOfWord: '',
          By: type, Remarks: params.Remarks, Date: params.Voucher_Date, oldBal: params.OldBalance,
          RcdAmt: params.Voucher_Amt, balAmt: params.LedgerAmount
        }
        this.fnBranchGet(value);

      }, err => console.error(err))

  }

  fnBranchGet(value) {
    
    this.voucherService.onBranchGet(this.BranchId,this.Apiurl)
      .subscribe(data => {
        let jsonData = JSON.parse(data);
        let branch = jsonData[0];
        this.voucherData.branchName = branch.BranchName;
        this.voucherData.BranchAdr1 = branch.BranchAdr1;
        this.voucherData.BranchAdr2 = branch.BranchAdr2;
        this.voucherData.TinNo1 = branch.TinNo1;
        this.fnAmtInWords(value);
      })
  }

  fnAmtInWords(value) {
    
    this.voucherService.onVocherAmount(this.voucherData.RcdAmt,this.Apiurl)
      .subscribe(data => {
        let jsondata = JSON.parse(data);
        this.voucherData.SumOfWord = jsondata[0].Words;
        if (value == 'share') {
         
          let fileName = `Vocher_Report${this.voucherData.vouchNo}`
          this.sharePage.fnSharepage('rPrintContent', fileName)
          return
        }
        let options: PrintOptions = {
          name: `RecieptVoucher${new Date()}`,
          duplex: true,

        }

        let content = document.getElementById('rPrintContent').innerHTML;
        this.printer.print(content, options).then(onSuccess => {
          console.log(onSuccess)
        }, onError => console.error(onError));

      })
  }

  async onAddCustomer() {
    const modal = await this.modalController.create({
      component: AddCustomerComponent,
      componentProps: {
        searchtype: 'voucher'
      },
      cssClass: 'my-custom-class'
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    if (data) {
      this.fnCustomerClick(data);    
    }
  }
}
