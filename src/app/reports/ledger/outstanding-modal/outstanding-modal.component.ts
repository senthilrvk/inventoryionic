import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-outstanding-modal',
  templateUrl: './outstanding-modal.component.html',
  styleUrls: ['./outstanding-modal.component.scss'],
})
export class OutstandingModalComponent implements OnInit {
  JsonObj: any;
 
  constructor(public navParams: NavParams) { }

  ngOnInit() {
    this.JsonObj = this.navParams.get('item');
  }
  
 fnClose() {
  this.navParams.data.modal.dismiss();
 }
}
