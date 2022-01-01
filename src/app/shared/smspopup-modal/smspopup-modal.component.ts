import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { SMS } from '@ionic-native/sms/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { AppService } from 'src/app/app.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';


@Component({
  selector: 'app-smspopup-modal',
  templateUrl: './smspopup-modal.component.html',
  styleUrls: ['./smspopup-modal.component.scss'],
})
export class SmspopupModalComponent implements OnInit {
  staffId: string;
  BranchId: string;
  messageInfo: string;
  phoneNo: string;
  baseUrl: any;
  constructor(public modalController: ModalController, navParams: NavParams,
    private appService: AppService,
     public ctrlService: ControlService, private sms: SMS,
    private socialSharing: SocialSharing) {
    this.ctrlService.get('sessionsurl').then((val) => {
      if (val != null) 
      this.baseUrl = val;
    });
    this.staffId = navParams.get('id');
    this.BranchId = navParams.get('branchid');
    this.messageInfo = navParams.get('sms');
    this.phoneNo = navParams.get('phoneNo');

  }

  ngOnInit() { }

  cancel() {
    this.modalController.dismiss();
  }

  fnSendSms() {
    
    const MessageCounterInfo = {MessageTo: '', Information: '', StaffId: 0, BranchId: 0};
    MessageCounterInfo.MessageTo = String(this.phoneNo);
    MessageCounterInfo.Information = String(this.messageInfo);
    MessageCounterInfo.StaffId = Number(this.staffId);
    MessageCounterInfo.BranchId = Number(this.BranchId);
    const body = JSON.stringify(MessageCounterInfo);
   
    this.appService.fnApiPost(`${this.baseUrl}/Common/SmsSent`, body).toPromise()
    .then(data => {
      this.ctrlService.presentToast('Message sent', ' successfully !!!');
      this.modalController.dismiss();
    }, err => {
        console.error(err);
        
          this.socialSharing.shareViaSMS(this.messageInfo, this.phoneNo).then(() => {
            // Sharing via SMS is possible
          }).catch(() => {
            this.sms.hasPermission().then(hasPermission => {
              console.log("hasPermission", hasPermission);
              if (hasPermission) {
                this.sms.send(this.phoneNo, this.messageInfo);
              } else{
                console.log("eror");
              }
              
          });
        })
       
        this.modalController.dismiss();
    });


  }

}
