import { Injectable } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { AlertController } from '@ionic/angular';

export enum ConnectionStatusEnum {
    Online,
    Offline
}


@Injectable()
export class NetworkProvider {

    protected   previousStatus;

  constructor(public alertCtrl: AlertController,
              public network: Network,
              ) {

    console.log('Hello NetworkProvider Provider');

    this.previousStatus = ConnectionStatusEnum.Online;

  }
  onConnect() {
return  this.network.onConnect()
}

onDisConnect() {
  return  this.network.onDisconnect()
  }

}
