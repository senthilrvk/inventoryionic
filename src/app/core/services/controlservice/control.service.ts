import { Injectable } from '@angular/core';
import { DatePicker } from '@ionic-native/date-picker/ngx';
import { ActionSheetController, PopoverController, ModalController, ToastController, LoadingController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Injectable({
  providedIn: 'root'
})
export class ControlService {
  isLoading = false;
  public storage = new Storage()
  constructor(
    public modalCtrl: ModalController,
    private toast: ToastController,
    public datePicker: DatePicker,
    private loadingController: LoadingController,

  ) {
    this.storage.create();
  }


  onDatePicker(today: string, label: string) {
    return this.datePicker.show({
      date: new Date(),
      mode: 'date',
      // minDate: new Date(),
      // maxDate: new Date(),
      titleText: label,
      todayText: today,
      androidTheme: this.datePicker.ANDROID_THEMES
        .THEME_DEVICE_DEFAULT_LIGHT
    });
  }

  async set(key: string, value: any): Promise<any> {
    try {
    const result = await this.storage.set(key, value);
    return true;
    } catch (reason) {
    console.log(reason);
    return false;
    }
  }

  async get(key: string): Promise<any> {
    try {
    const result = await this.storage.get(key);
    if (result != null) {
    return result;
    }
    return null;
    } catch (reason) {
    console.log(reason);
    return null;
    }
  }

  async setObject(key: string, object: Object) {
    try {
    const result = await this.storage.set(key, JSON.stringify(object));
    console.log('set Object in storage: ' + result);
    return true;
    } catch (reason) {
    console.log(reason);
    return false;
    }
  }

  async getObject(key: string): Promise<any> {
    try {
    const result = await this.storage.get(key);
    if (result != null) {
    return JSON.parse(result);
    }
    return null;
    } catch (reason) {
    console.log(reason);
    return null;
    }
  }

  async remove(key: string) {
    try {
      const result = await this.storage.remove(key);
      if (result != null) {
      return result;
      }
      return null;
      } catch (reason) {
      console.log(reason);
      return null;
      }

  }

  clear()
{
this.storage.clear();
}
  async onLoading(msg) {
    if (this.isLoading) {
      this.hideLoader();
      return
    }
    this.isLoading = true;
    return await this.loadingController.create({
      message: msg,
    }).then(a => {
      a.present().then(() => {
        if (!this.isLoading) {
          a.dismiss()
            .then(() =>{});
        }
      });
    });
  }

  async hideLoader() {

    if (!this.isLoading) {
      return
    }
    this.isLoading = false;
    return await this.loadingController.dismiss().then(() => {

    });
  }

  async presentToast(title:string, msg:string) {
    const toast = await this.toast.create({
      header: title,
      message: msg,
      position:'top',
      duration: 2000
    });
    toast.present();
  }

}
