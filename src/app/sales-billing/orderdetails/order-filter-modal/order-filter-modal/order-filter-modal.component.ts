import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-order-filter-modal',
  templateUrl: './order-filter-modal.component.html',
  styleUrls: ['./order-filter-modal.component.scss'],
})
export class OrderFilterModalComponent implements OnInit {
  @Input() sortPrice: string;
  @Input() sortStock: boolean;
  @Input() sortImage: string;

  constructor(private modalController: ModalController) { }

  ngOnInit() {
  
  }
  dismiss() {
    this.modalController.dismiss();
  }

  apply() {
    let props = {sortPrice: this.sortPrice, sortStock: this.sortStock, sortImage: this.sortImage, refresh: false}
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss(props);
  }

  drefresh() {
    let props = {sortPrice: this.sortPrice, sortStock: this.sortStock, sortImage: this.sortImage, refresh: true}
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss(props);
  }
}
