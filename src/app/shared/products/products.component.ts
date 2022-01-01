import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { AppService } from 'src/app/app.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  providers: [BarcodeScanner]
})
export class ProductsComponent implements OnInit {
  search:string = "";
  private apiurl:string = "";
  private branchId:string = "";
  productSource:any[] = [];
  productlist:boolean = true;
  scheduleSource:any[] = [];
  categoryHeadSource:any[] = [];
  categorySource:any[] = [];
  textSource:any[] = [];
  prodTypeSource:any[] = [];
  staffId:string = "";
  manufactureData:any[] = [];
  autocomplete:boolean;
  manufactureName:string = "";
  hsnSource:any[] = [];
  hsnautocomplete:boolean = false;

  product: any = {
    ProductId: '', SkuCode: '', ItemCode: '', ItemDesc: '', CategoryCode: '0', VendorCode: '', Brand: '',
    Model: '', PackQty: '1', PackType: '0', PurRate: '', SelRate: '', WholeSaleRate: '', MRP: '',
    Discount: '', SecSelPrice: '0', SecDiscount: '0', ValidFrom: '', ValidTo: '', ImageLoc: '',
    FullItemDesc: '', UOM: '', MarginType: '', RewardPts: '', Margin1: 0, MarginFrom: '', bfree: false,
    bBarcode: '', bActive: true, bNonInventory: '', bConsignment: '', dtEditDate: '', EditStaff: '',
    bQtyDiscount: '', imageData: '', bPackage: '', ColorCode: '', ProductUsed: 0, CountryFrom: '',
    Color: '', bCancel: '', CancelDate: '', StaffId: 0, TaxGroupId: '0', BranchId: this.branchId, Freight: '',
    OpenStk: '', Batch: '', ExpDate: '', ColdeStorage: '', EnterDate: '', Times: '', Location: '',
    DisPers: '', ChemicalId: 0, GroupId: '0', UniversalCode: '', Manufacture_Id: '', SpRate1: 0,
    SpRate2: 0, Field1: '', Field2: '', SpRate3: 0, SpRate4: 0, SpRate5: 0, ProdTitle: '', ProdLumen: '',
    ProdMaterial: '', ProdBeamAngle: '', ProdIPRating: '', Hsn_Id: '', ProductLinkId: '', ProductType: 'Product',
    ProdSpecification: '', ProdDimension: '', ProdWeight: 0, ProductGrpId: 0, ProdWgtTypeId: '0'
  };

  constructor(public toastController: ToastController, private appService: AppService,
    private barcodeScanner: BarcodeScanner,
     private ctrlService: ControlService) {

      this.ctrlService.storage.forEach((val,key) => {
          if(key == "sessionsurl" && val != null) this.apiurl = val;
          if(key == "SessionBranchId" && val != null) this.branchId = val;
          if(key == "sessionInvenBranchId" && val != null) this.branchId = val;
          if(key == "SessionSalesmanId" && val != null) this.staffId = val;
          if(key == "sessionInvenStaffId" && val != null) this.staffId = val;

      }).finally(() =>{
        this.onProductGet().then(_ => {
          this.fnScheduleGets()
        })

      })


   }

  ngOnInit() {

  }


  onProductGet() {
    let promise = new Promise((res, rej) => {

    let ServiceParams = {};
    ServiceParams['strProc'] = "Product_GetsNew";

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "ItemDesc";
    ProcParams["strArgmt"] = this.search;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(this.branchId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "SearchType";
    ProcParams["strArgmt"] = "Product";
    oProcParams.push(ProcParams);

    ServiceParams['oProcParams'] = oProcParams;

    this.appService.fnApiPost(`${this.apiurl}/CommonQuery/fnGetDataReportNew`, ServiceParams)
    .subscribe(data => {

        this.productSource = JSON.parse(data);
        res(this.productSource)
      }, err => {
        rej(err)
      })
    });
    return promise
  }

  fnCreate() {
    this.productlist = false;
    this.fnclear();
  }


  async fnScheduleGets() {
    let varArguements = { Id: 15 };

    let DictionaryObject = {};
    DictionaryObject["dictArgmts"] = varArguements;
    DictionaryObject["ProcName"] = 'Category_GetOnTypeId';

    await this.appService.fnApiPost(`${this.apiurl}/Master/CategoryGetsOnTypeId`, DictionaryObject).toPromise()
      .then(data => {
        this.scheduleSource = data;
        this.fnProductCategoryHeadGets();
      })
  }



  onHsnCodeSearch(value) {

    if(!value) {
      this.hsnSource.length = 0;
      this.hsnautocomplete = false;
      return
    }

    let ServiceParams = {};
    ServiceParams['strProc'] = "Hsn_Gets";

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "Hsn_Code";
    ProcParams["strArgmt"] = String(value);
    oProcParams.push(ProcParams)

    ServiceParams['oProcParams'] = oProcParams;

    this.appService.fnApiPost(`${this.apiurl}/CommonQuery/fnGetDataReportNew`, ServiceParams).toPromise()
      .then(data => {
        let jsonData = JSON.parse(data);
        this.hsnSource = jsonData
        if(jsonData.length) this.hsnautocomplete = true
      })
  }

  async fnProductCategoryHeadGets() {

    let varArguements = { Id: 1 };

    let DictionaryObject = {};
    DictionaryObject["dictArgmts"] = varArguements;
    DictionaryObject["ProcName"] = 'CategoryHead_GetOnTypeId';

    await this.appService.fnApiPost(`${this.apiurl}/Master/CategoryHeadGetsOnTypeId`, DictionaryObject).toPromise()
      .then(data => {
        this.categoryHeadSource = data;
        this.fnGetCategorys();
      })
  }


  async fnGetCategorys() {
    let varArguements = { Id: 1 };

    let DictionaryObject = {};
    DictionaryObject["dictArgmts"] = varArguements;
    DictionaryObject["ProcName"] = 'Category_GetOnTypeId';

    await this.appService.fnApiPost(`${this.apiurl}/Master/CategoryGetsOnTypeId`, DictionaryObject).toPromise()
      .then(data => {
        this.categorySource = data;
        this.fnGetTaxGroups();
      });

  }


  async fnGetTaxGroups() {
    let ServiceParams = {};
    ServiceParams['strProc'] = "TaxGroup_GetsNew";

    await this.appService.fnApiPost(`${this.apiurl}/CommonQuery/fnGetDataReportNew`, ServiceParams).toPromise()
      .then(data => {
        let jsonObj = JSON.parse(data);
        this.textSource = jsonObj;
        this.fnGetPackType();
      })
  }


  async fnGetPackType() {

    let varArguements = { Id: 11 };
    let DictionaryObject = {};
    DictionaryObject["dictArgmts"] = varArguements;
    DictionaryObject["ProcName"] = 'Category_GetOnTypeId';

    await this.appService.fnApiPost(`${this.apiurl}/Master/CategoryGetsOnTypeId`, DictionaryObject).toPromise()
      .then(data => {
        this.prodTypeSource = data;

      })
  }

  selectHsnCode(value) {
    this.product.SkuCode = value.Hsn_Code;
    this.product.Hsn_Id  = value.Hsn_Id;
    this.hsnautocomplete = false;
  }


  async fnManufactureGets(value) {
    if(!value) {
      this.manufactureData.length = 0;
      this.autocomplete = false;
      return
    }

    let ServiceParams = {};
    ServiceParams['strProc'] = "Manufacture_GetsOnBranchId";
    ServiceParams['JsonFileName'] = 'JsonArrayScriptFour';
    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "@ParamsManufacture_Name";
    ProcParams["strArgmt"] = value;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsBranchId";
    ProcParams["strArgmt"] = String(this.branchId);
    oProcParams.push(ProcParams);

    ServiceParams['oProcParams'] = oProcParams;

    await this.appService.fnApiPost(`${this.apiurl}/CommonQuery/fnGetDataReportFromScriptJsonFile`, ServiceParams)
    .toPromise().then(data => {
        let jsonData = JSON.parse(data.JsonDetails[0]);
        this.manufactureData = jsonData
        if (jsonData.length) {
          this.autocomplete = true
        }
      });
  }

  selectManufacture(item) {
    this.product.Manufacture_Id = item.Manufacture_Id;
    this.manufactureName = item.Manufacture_Name;
    this.autocomplete = false
  }

  onProductGets(id) {
    this.fnclear();

    this.productlist = false;

    let varArguements = { ProductId: id, BranchId: this.branchId };

    let DictionaryObject = {};
    DictionaryObject["dictArgmts"] = varArguements;
    DictionaryObject["ProcName"] = 'Product_GetNew';

   this.appService.fnApiPost(`${this.apiurl}/Master/Product_GetNew`, DictionaryObject).toPromise()
   .then(result => {

     let x = result[0];

     this.product = {
       ProductId: x.ProductId.toString(), SkuCode: x.SkuCode, ItemCode: x.ItemCode, ItemDesc: x.ItemDesc,
       CategoryCode: x.CategoryCode, VendorCode: x.VendorCode, Brand: x.Brand, Model: x.Model,
       PackQty: x.PackQty, PackType: parseFloat(x.PackType), PurRate: x.PurRate, SelRate: x.SelRate,
       WholeSaleRate: x.WholeSaleRate, MRP: x.MRP, Discount: x.Discount, SecSelPrice: x.SecSelPrice.toString(),
       SecDiscount: x.SecDiscount, ValidFrom: '', ValidTo: '', ImageLoc: x.ImageLoc,
       FullItemDesc: x.FullItemDesc, UOM: x.UOM, MarginType: '', RewardPts: x.RewardPts,
       Margin1: 0, MarginFrom: '', bfree: x.bfree, bBarcode: x.bBarcode,
       bActive: x.bActive == 1 ? true : false, bNonInventory: '', bConsignment: '',
       dtEditDate: '', EditStaff: '', bQtyDiscount: '', imageData: x.imageData, bPackage: '',
       ColorCode: '', ProductUsed: x.ProductUsed, CountryFrom: x.CountryFrom, Color: x.Color, bCancel: '',
       CancelDate: '', StaffId: this.staffId, TaxGroupId: x.TaxGroupId,
       BranchId: this.branchId, Freight: x.Freight, OpenStk: '', Batch: '', ExpDate: '',
       ColdeStorage: '', EnterDate: '', Times: '', Location: x.Location, DisPers: x.DisPers,
       ChemicalId: x.ChemicalId, GroupId: x.GroupId, UniversalCode: '',
       Manufacture_Id: x.Manufacture_Id, SpRate1: x.SpRate1, SpRate2: x.SpRate2, Field1: '',
       Field2: '', SpRate3: x.ProdSpRate3, SpRate4: x.ProdSpRate4, SpRate5: x.ProdSpRate5,
       ProdTitle: x.ProdTitle, ProdLumen: x.ProdLumen, ProdMaterial: x.ProdMaterial,
       ProdBeamAngle: x.ProdBeamAngle, ProdIPRating: x.ProdIPRating, Hsn_Id: x.Hsn_Id,
       ProductLinkId: x.ProductLinkId, ProductType: x.ProductType, ProdSpecification: x.ProdSpecification,
       ProdDimension: x.ProdDimension, ProdWeight: x.ProdWeight, ProductGrpId: x.ProductGrpId,
       ProdWgtTypeId: x.ProdWgtTypeId
     };
     this.manufactureName = x.ManufactureName;
   })
  }

  barScan() {
    let options = {
      prompt: "Scan your barcode ",
      // preferFrontCamera: false
    }

    this.barcodeScanner.scan(options).then((barcodeData) => {

      this.product.ItemCode = barcodeData.text;

      if (barcodeData.cancelled) {

        return
      }

    }, (err) => {

      console.log("Error occured : " + err);
    });
  }

  fnInsert() {

    if (this.product.ItemDesc == "") {
        this.presentToast("Enter Product  Name");
      return;
    }
    if (this.product.ItemCode == "") {
        this.presentToast("Enter Item  Code");
      return;
    }

    if (!this.product.Manufacture_Id) {
        this.presentToast("Select Manufacture ");
      return;
    }
    if (this.product.TaxGroupId == '0') {
        this.presentToast("Select tax  Group ");
      return;
    }

    if (this.product.PackType == "0") {
        this.presentToast("Select Unit ");
      return;
    }

    if (this.product.Hsn_Id == '') {
        this.presentToast("Select Hsn Code ");
      return;
    }

    let varArguements = this.product;

    if (this.product.ProductId != '') {

      let DictionaryObject = {};
      DictionaryObject["dictArgmts"] = varArguements;
      DictionaryObject["ProcName"] = 'Product_Update';
      this.appService.fnApiPost(`${this.apiurl}/Master/Product_Update`, DictionaryObject).toPromise()
      .then(data => {
       data = JSON.parse(data)[0];
          if (data.Flag == 'Already Exists') {
            this.presentToast(data.Result);
            return;
          } else {
            this.presentToast('Update Successfully');
          }
          this.fnclear();
      });
    } else {
      let DictionaryObject = {};
      DictionaryObject["dictArgmts"] = varArguements;
      DictionaryObject["ProcName"] = 'Product_Insert';
      let body = JSON.stringify(DictionaryObject);

       this.appService.fnApiPost(`${this.apiurl}/Master/Product_Insert`, body).toPromise()
        .then(async result => {
          result = JSON.parse(result)[0];
          if (result.Flag == 'Already Exists') {
            this.presentToast(result.Result);
            return;
          } else {
            this.presentToast('Saved Successfully');
          }
          this.fnclear();
        });
    }
  }

  fnclear() {
    this.product = {
      ProductId: '', SkuCode: '', ItemCode: '', ItemDesc: '', CategoryCode: '0', VendorCode: '', Brand: '',
      Model: '', PackQty: '1', PackType: '0', PurRate: '', SelRate: '', WholeSaleRate: '', MRP: '',
      Discount: '', SecSelPrice: '0', SecDiscount: '0', ValidFrom: '', ValidTo: '', ImageLoc: '',
      FullItemDesc: '', UOM: '', MarginType: '', RewardPts: '', Margin1: 0, MarginFrom: '', bfree: false,
      bBarcode: '', bActive: true, bNonInventory: '', bConsignment: '', dtEditDate: '', EditStaff: '',
      bQtyDiscount: '', imageData: '', bPackage: '', ColorCode: '', ProductUsed: 0, CountryFrom: '',
      Color: '', bCancel: '', CancelDate: '', StaffId: this.staffId, TaxGroupId: '0', BranchId: this.branchId, Freight: '',
      OpenStk: '', Batch: '', ExpDate: '', ColdeStorage: '', EnterDate: '', Times: '', Location: '',
      DisPers: '', ChemicalId: 0, GroupId: '0', UniversalCode: '', Manufacture_Id: '', SpRate1: 0,
      SpRate2: 0, Field1: '', Field2: '', SpRate3: 0, SpRate4: 0, SpRate5: 0, ProdTitle: '', ProdLumen: '',
      ProdMaterial: '', ProdBeamAngle: '', ProdIPRating: '', Hsn_Id: '', ProductLinkId: 0, ProductType: 'Product',
      ProdSpecification: '', ProdDimension: '', ProdWeight: 0, ProductGrpId: '0', ProdWgtTypeId: '0'
    };
    this.manufactureName = '';
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
    });
    toast.present();
  }
}
