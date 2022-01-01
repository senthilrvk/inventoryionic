import { Component, Input, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal',
  templateUrl: 'modal.page.html',
  styleUrls: ['modal.page.scss'],
})

export class ModalPage implements OnInit {
  @Input() name: string;
  @Input() Addr1: string;
  @Input() Addr2: string;
  @Input() Addr3: string;
  @Input() Phone: string;
  @Input() Mobile: string;
  @Input() Email: string;
  @Input() Image: string;
  @Input() ProductName: string;

  AcName: any;
  AcAddr1: any;
  AcAddr2: any;
  AcAddr3: any;
  AcPhone: any;
  AcEmail: any;
  AcMobile: any;
  Imgagebox: boolean;
  tittle: string;

  constructor(public modalController: ModalController, navParams: NavParams) {
    this.AcName = navParams.get('name');
    this.AcAddr1 = navParams.get('Addr1');
    this.AcAddr2 = navParams.get('Addr2');
    this.AcAddr3 = navParams.get('Addr3');
    this.AcPhone = navParams.get('Phone');
    this.AcMobile = navParams.get('Mobile');
    this.AcEmail = navParams.get('Email');
    this.Image = navParams.get('image');
    this.ProductName = navParams.get('Name');
  }

  ngOnInit() {
    if (this.Image !== undefined) {
      this.Imgagebox = true;
      this.tittle = 'Product Image';
    } else {
      this.tittle = 'User Details';
    }
  }

  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true
    });
  }

}
