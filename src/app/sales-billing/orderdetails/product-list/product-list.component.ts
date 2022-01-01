import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { AlertController, ModalController, PickerController, PickerOptions } from '@ionic/angular';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { PrinterService } from 'src/app/printpage/printer.service';
import { ModalPage } from '../allorder/modal/modal.page';
import { OrderFilterModalComponent } from '../order-filter-modal/order-filter-modal/order-filter-modal.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  @Input('params') public params;
  @Input('type') public type;
  @Output() showEvent = new EventEmitter<any>();

  public productimage: boolean = false;
  private _unsubscribeAll = new Subject();
  private baseUrl: string = "";
  public keyword: string = "";
  public productjson: any[] = [];
  private jfilterTempItems: any[] = [];
  private jsonItems: any[];
  private branchId: string = '';
  private filterProps = {sortPrice: "default", sortStock: false, sortImage: "default",refresh: false}
  public itemCodeVis = true;
  public loading = false;
  constructor(private appService: AppService, public modalController: ModalController,
    public ctrlService: ControlService, public alertController: AlertController,

    ) {



  }

  ngOnInit() {

    this.ctrlService.get('SessionBranchId').then(result => {
      if (result != null) {
        this.branchId = result;
      }
    });


  }

  ngOnChanges(changes: SimpleChanges): void {

    this.ctrlService.get('sessionsurl').then(result => {
      if (result != null) {
        this.baseUrl = result;
        this.fnInvoiceCtrlOrder()
      }
    });
  }

  fnInvoiceCtrlOrder() {

    const dictArgmts = { ProcName: 'Settings_GetValues' };
    const body = JSON.stringify(dictArgmts);
    this.appService.fnApiPost(this.baseUrl + '/Master/fnSettings', body)
      .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(result => {
        const settings = result;
        let itemCodevisible = settings.find(x => x.KeyValue == 'SalesItemCode');
        if (itemCodevisible)
          if (itemCodevisible.Value == "No")
            this.itemCodeVis = false;
        if (this.type == "category")
          this.fnProductGetsOnCategoryId(this.params.categoryId)
        else if (this.type == "company")
          this.fnProductGetsOnManufactureId(this.params.companyId)
        else
          this.onGetProduct()
      });
  }


  async onGetProduct() {
    this.productjson = [];

    const ServiceParams = { strProc: "", JsonFileName: "", oProcParams: [] };
    ServiceParams.strProc = "Product_SearchSalesShoppingCart";
    ServiceParams.JsonFileName = "JsonArrayScriptTwo";

    const oProcParams = [];

    let ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "@ParamsstrItemDesc";
    ProcParams.strArgmt = this.keyword;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "@ParamsBranchId";
    ProcParams.strArgmt = String(this.branchId);
    oProcParams.push(ProcParams);
    ServiceParams.oProcParams = oProcParams;

    const body = JSON.stringify(ServiceParams);
    this.loading = true;
    this.appService.fnApiPost(`${this.baseUrl}/CommonQuery/fnGetDataReportFromScriptJsonFile`, body)
      .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then((result) => {
        const datajson = result;
        const json = JSON.parse(datajson.JsonDetails[0]);
        this.onProductFill(json)
        this.loading = false;
      });
  }

  onProductFill(json) {

    this.productjson = [];
    const ListdataJson = [];
    let diffRate = "";
    let priceMenu = Number(this.params.priceId);

    switch (priceMenu) {
      case 1:
        diffRate = "SelRate";
        break;
      case 2:
        diffRate = "WholeSaleRate";
        break;
      case 3:
        diffRate = "MRP";
        break;
      case 4:
        diffRate = "SpRate1";
        break;
      case 5:
        diffRate = "SpRate2";
        break;
      case 6:
        diffRate = "ProdSpRate3";
        break;
      case 7:
        diffRate = "ProdSpRate4";
        break;
      case 8:
        diffRate = "ProdSpRate5";
        break;
      default:
        diffRate = "SelRate";
        break;
    }

    json.forEach((ele) => {
      const dataJson = {
        ProductId: 0,
        ItemCode: 0,
        ItemDesc: 0,
        ManufactureName: 0,
        StockQty: 0,
        TaxOn: 0,
        TaxPercent: 0,
        MRP: 0,
        SelRate: 0,
        ImageLoc: 0,
        OrderQty: 0,
      };
      dataJson.ProductId = ele.ProductId;
      dataJson.ItemCode = ele.ItemCode
      dataJson.ItemDesc = ele.ItemDesc;
      dataJson.ManufactureName = ele.Manufacture;
      dataJson.StockQty = ele.StockQty;
      dataJson.TaxOn = ele.TaxOn;
      dataJson.TaxPercent = ele.TaxPercent;
      dataJson.MRP = ele.MRP;
      dataJson.SelRate = ele[diffRate];
      dataJson.ImageLoc = ele.ImageLoc ? ele.ImageLoc: "";
      dataJson.OrderQty = ele.OrderQty;
      ListdataJson.push(dataJson);
    });

    this.jfilterTempItems = ListdataJson;

    this.jsonItems = this.jfilterTempItems.slice();

    const totalLegth = this.jsonItems.length;
    if (totalLegth >= 20) {
      for (let i = 0; i < 20; i++) {
        this.productjson.push(this.jsonItems[i]);
      }
    } else {
      this.productjson = this.jsonItems;
    }

  }

  fnProductGetsOnManufactureId(id) {

    const ServiceParams = { strProc: "", JsonFileName: "", oProcParams: [] };
    ServiceParams.strProc = "Product_GetsOnManufactureIdSearch";
    ServiceParams.JsonFileName = "JsonArrayScriptTen";

    const oProcParams = [];

    let ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "@ParamsstrItemDesc";
    ProcParams.strArgmt = this.keyword;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "@ParamsBranchId";
    ProcParams.strArgmt = String(this.branchId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "@ParamsManufactureId";
    ProcParams.strArgmt = String(id);
    oProcParams.push(ProcParams);

    ServiceParams.oProcParams = oProcParams;

    let body = JSON.stringify(ServiceParams);
    this.loading = true;
    this.appService.fnApiPost(`${this.baseUrl}/CommonQuery/fnGetDataReportFromScriptJsonFile`, body)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {

        let json = JSON.parse(data.JsonDetails[0]);
        this.onProductFill(json);
        this.loading = false;
      })
  }

  fnProductGetsOnCategoryId(id) {

    const ServiceParams = { strProc: "", JsonFileName: "", oProcParams: [] };
    ServiceParams.strProc = "Product_GetsOnCategoryIdSearch";
    ServiceParams.JsonFileName = "JsonArrayScriptTen";

    const oProcParams = [];

    let ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "@ParamsstrItemDesc";
    ProcParams.strArgmt = this.keyword;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "@ParamsBranchId";
    ProcParams.strArgmt = String(this.branchId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "@ParamsCategoryId";
    ProcParams.strArgmt = String(id);
    oProcParams.push(ProcParams);

    ServiceParams.oProcParams = oProcParams;

    let body = JSON.stringify(ServiceParams);
    this.loading = true;
    this.appService.fnApiPost(`${this.baseUrl}/CommonQuery/fnGetDataReportFromScriptJsonFile`, body)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        let json = JSON.parse(data.JsonDetails[0]);
        this.onProductFill(json);
        this.loading = false;
      });
  }

  onRowClick(product) {
    setTimeout(() => {
      this.showEvent.emit(product);
    }, 200);
  }



  async ImageModal(eve, itemName) {
    const imageurl = eve.path[0].src;

    const modal = await this.modalController.create({
      component: ModalPage,
      showBackdrop: true,
      mode: "md",
      presentingElement: await this.modalController.getTop(),
      componentProps: {
        image: imageurl,
        Name: itemName,
      },
    });
    return await modal.present();
  }

  fnImageGet(product) {
    if (this.params.imgFolder && product.ImageLoc) {
      return `https://s3.ap-south-1.amazonaws.com/productcodeappsimage/${this.params.imgFolder}/${product.ImageLoc}`
    } else {
      return "https://via.placeholder.com/480x365/00838F/fff/?text=Rated%20Product";
    }
  }

  loadData(event) {
    const prevlength = this.productjson.length;
    let nextlength = prevlength + 20;
    const totalLegth = this.jsonItems.length;
    if (prevlength === totalLegth) {
      event.target.complete();
      return;
    }
    if (nextlength > totalLegth) {
      nextlength = totalLegth;
    }

    setTimeout(() => {
      for (let i = prevlength; i < nextlength; i++) {
        this.productjson.push(this.jsonItems[i]);
      }
      // this.numTimesLeft -= 1;
      event.target.complete();
    }, 2000);
  }

  async showFilterPicker() {

    const modal = await this.modalController.create({
      component: OrderFilterModalComponent,
      presentingElement: await this.modalController.getTop() ,
      cssClass: 'my-custom-class',
      componentProps: this.filterProps
    });

    await modal.present();
    const { data } = await modal.onWillDismiss();
    if(data) {
      if(data.refresh) {
        this.jsonItems = this.jfilterTempItems.slice();
        this.onFilterFill();
        this.filterProps = {sortPrice: "default", sortStock: false, sortImage: "default",refresh: false}
        return
      }
      this.filterProps = data;
      this.onFilterStock();
      this.onSortByPrice();
      this.onSortByImage();

    }
  }

  onSortByPrice() {

      if(this.filterProps.sortPrice == "hightolow") {
        this.jsonItems.sort((a, b) => {
          return compare(a.SelRate, b.SelRate, false);
        })
      } else if(this.filterProps.sortPrice == "lowtohigh") {
        this.jsonItems.sort((a, b) => {
          return compare(a.SelRate, b.SelRate, true);
        })
      }

  }

  onSortByImage() {
    const data = this.jfilterTempItems.slice();

    if(this.filterProps.sortImage == "ascending") {
      this.jsonItems.sort((a, b) => {
        return compare(a.ImageLoc, b.ImageLoc, false);
      })
    } else if(this.filterProps.sortImage == "descending") {
      this.jsonItems.sort((a, b) => {
        return compare(a.ImageLoc, b.ImageLoc, true);
      })
    }

    if(this.filterProps.sortPrice == "default" && this.filterProps.sortImage == "default") {
      this.jsonItems = data;
    }

    this.onFilterFill();
  }

  onFilterStock() {
    const data = this.jfilterTempItems.slice();
    if(this.filterProps.sortStock) {
      this.jsonItems = this.jfilterTempItems.filter(x => parseFloat(x.StockQty || 0) > 0)
    } else {
      this.jsonItems = data;
    }

  }

 onFilterFill() {
  this.productjson = []
  const totalLegth = this.jsonItems.length;
  if (totalLegth >= 20) {
    for (let i = 0; i < 20; i++) {
      this.productjson.push(this.jsonItems[i]);
    }
  } else {
    this.productjson = this.jsonItems;
  }
 }

  ngOnDestroy(): void {

    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}

function compare(a: number | string, b: number | string, isAsc: boolean) {
  return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
}
