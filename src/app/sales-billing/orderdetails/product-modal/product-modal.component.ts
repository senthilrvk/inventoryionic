import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AlertController, ModalController, NavParams } from '@ionic/angular';


@Component({
  selector: 'app-product-modal',
  templateUrl: './product-modal.component.html',
  styleUrls: ['./product-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProductModalComponent implements OnInit {
  
  
  public segmentValue = 'product';
  public itemModalData: any[] = [];
  public params: any;
  public typeName = 'product';
  constructor(public alertController: AlertController,
    public modalController: ModalController,
    navParams: NavParams) { 
      this.params = {
      priceId: navParams.get('priceId'),
      imgFolder: navParams.get('imgFolder'),
      categoryId: 0,
      companyId: 0
    }
    }

  ngOnInit() {  }  
  async presentAlertConfirm() {
    const alert = await this.alertController.create({
      cssClass: 'my-custom-class',
      header: 'Are you sure?',
      mode: "ios",
      message: 'Do you want leave this page<strong> Without Saving Data</strong>!!!',
      buttons: [
        {
          text: 'Stay',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            console.log('Confirm Cancel: blah');
          }
        }, {
          text: 'Leave',
          handler: () => {
            this.modalController.dismiss();
          }
        }
      ]
    });

    await alert.present();
  }

  async productQtyAlert(product) {
    
    const alert = await this.alertController.create({
      header: product.ItemDesc,
      mode: "ios",
      subHeader: "Available Stock - " + product.StockQty,
      inputs: [
        {
          label: "Quantity",
          name: "quantity",
          id: "quantity-id",
          placeholder: "enter quantity",
          type: "number",
        },

        {
          label: "Free",
          name: "free",
          id: "free-id",
          placeholder: "enter free",
          type: "number",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: (data) => {
            //  this.dismiss(data, product);
          },
        },
        {
          text: "Add",
          handler: (data) => {
              this.itemModalData.push({product: product, qty: data.quantity, price: product.SelRate, free: data.free})
            // this.fnCartValidate(product, data.quantity, product.SelRate, data.free);
          },
        },
      ],
      backdropDismiss: false,
    });
    await alert.present().then(() => {
      const firstInput: any = document.querySelector("ion-alert #quantity-id");
      firstInput.focus();
      firstInput.before(`Quantity`);

      const secInput: any = document.querySelector("ion-alert #free-id");
      secInput.before(`Free`);
      return;
    });
  }

  dismissWithData() {
    this.modalController.dismiss({
      cartitem: this.itemModalData,
      mode: "ios",
    });
  }
  
  onCategoryClick(eve) {
      this.typeName = 'category';
      this.params.categoryId = eve;
      this.segmentValue = 'product';
      
  }

  onManufactureClick(eve) {
   
    this.typeName = 'company';
    this.params.companyId = eve;
    this.segmentValue = 'product';
   
  }

  resetProduct() {
    this.typeName = 'product';
    this.params.companyId = 0;
    this.params.categoryId = 0;
  }
}
