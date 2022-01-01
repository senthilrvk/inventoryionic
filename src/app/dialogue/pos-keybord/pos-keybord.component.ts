import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-pos-keybord',
  templateUrl: './pos-keybord.component.html',
  styleUrls: ['./pos-keybord.component.scss'],
})
export class PosKeybordComponent implements OnInit {
  @Input() view: string;
  @Input() value: string;
  @Input() total: string;
  constructor(private modalCtrl: ModalController) { }

  ngOnInit() { }

  onKeyPress(val) {
    
    if (val == 'back') {
      const editedText = this.value.slice(0, -1);
      this.value = editedText;
      if (this.value == '') {
        this.value = '0';
      }
      return
    }
    if (this.value == '0') {
      this.value = val;
      return
    }
    this.value += val;
    // if (this.total > this.value) {
      
    // }
  }

  onOkeyDismiss() {
    this.modalCtrl.dismiss(this.value)
  }
}
