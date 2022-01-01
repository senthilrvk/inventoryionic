import { AlertController, ModalController } from '@ionic/angular';
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Input } from '@angular/core';

// import { Http, Headers } from '@angular/http';
import { FormGroup, FormControl } from '@angular/forms';
import { Geolocation, Geoposition, GeolocationOptions } from '@ionic-native/geolocation/ngx';
import { LocationMapComponent } from './location-map/location-map.component';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest } from '@angular/common/http';

import { File, FileEntry } from '@ionic-native/file/ngx';
import { AppService } from 'src/app/app.service';
import { ControlService } from 'src/app/core/services/controlservice/control.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
declare var google;

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'charset=utf-8'
  })
};

@Component({
  selector: 'app-master',
  templateUrl: './master.component.html',
  styleUrls: ['./master.component.scss']

})

export class MasterComponent implements OnInit, AfterViewInit {
  @Input() popup: boolean;
  @Input() keyword: string;
  @ViewChild('name', { static: false }) myname;
  @ViewChild('maps', { read: false, static: false }) mapElement: ElementRef;
  @ViewChild('searchEle', { static: false }) private searchFocus;
  private branchId: any;
  private Apiurl: any;
  public jsonAreas: any;
  public AreaId: any;
  public PriceId: any;
  public TypeId: any;
  private latitude: any = '0';
  private longitude: any = '0';
  public progress = 0;
  public message = ''
  private dataURI: any = null;
  public myForm = new FormGroup({
    CustomerName: new FormControl(''),
    Address1: new FormControl(''),
    Address2: new FormControl(''),
    Phone: new FormControl(''),
    TinNo: new FormControl(''),
  });
  private _unsubscribeAll: Subject<any>;
  private StaffId: string;
  public isNew = true;
  public listSource: any;
  public pricemenu: any;
  public screenShot: string = '';
  public listview = false;
  public acId = 0;
  private folder = '';
  private salesmanActive = false;
  public search: string = '';
  mapFlag: boolean;
  constructor(private alertcontroller: AlertController, public http: HttpClient,
    public ctrlService: ControlService, public geolocation: Geolocation,
    private appService: AppService,
    public modalController: ModalController, private file: File) {
    this.fnMapsId();
    
  }


  async ngOnInit() {
    // this.inputName.nativeElement.focus();
    this._unsubscribeAll = new Subject();
    this.ctrlService.get('SessionBranchId').then((val) => {
      if (val != null) {
        this.branchId = val;
      }
    });
    this.ctrlService.get('sessionInvenBranchId').then((val) => {
      if (val != null) {
        this.branchId = val;
      }
    });
    
    this.ctrlService.get('SessionSalesmanId').then((val) => {
      if (val != null) {
        this.StaffId = val;
        this.salesmanActive = true;
      }
    });

    this.ctrlService.get('sessionInvenStaffId').then((val) => {
      if (val != null) {
        this.StaffId = val;
        this.salesmanActive = false;
      }
    });

    this.ctrlService.get('sessionsurl').then((val) => {
      if (val != null) {
        this.Apiurl = val;
        this.fnSettings()
      }
    });

    this.myForm.get('CustomerName').setValue(this.keyword);
    this.PriceId = '1';
    this.TypeId = 'LOCAL';
  }

  async fnSettings() {

    var dictArgmts = { ProcName: 'Settings_GetValues' };

    let body = JSON.stringify(dictArgmts);

    await this.appService.fnApiPost(this.Apiurl + '/Master/fnSettings', body)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise()
      .then(data => {
        let jsondata: any = data;

        let imagePath = jsondata.find(x => x.KeyValue == 'ImageSaveFolderName');
        if (imagePath) {
          this.folder = imagePath.Value;
        }
        this.fnArea_GetsForSales();
      }).catch(() => {
        this.ctrlService.presentToast('Sorry', 'Server busy!');
      })
  }

  async fnlocationMap() {

    const modal = await this.modalController.create({
      component: LocationMapComponent,
      componentProps: { lat: this.latitude, long: this.longitude }
    });

    modal.present();
    const { data } = await modal.onWillDismiss();

    if (data.dismiss) {
      this.screenShot = '';
    }
    if (!data.dismiss) {
      let cur = data.position
      // this.dataURI = data.path;
      // this.screenShot = data.imageLoc.filePath;
      this.latitude = cur.lat;
      this.longitude = cur.lng;

      if (this.latitude && this.longitude) {
        this.mapFlag = true;
        setTimeout(() => {
          this.fngetlocation();
        }, 200);
      }
    }
  }

  dismissPop() {
    this.modalController.dismiss()
  }

  async fnMapsId() {
   
    let options: GeolocationOptions = {
      maximumAge: 1000, timeout: 5000,
      enableHighAccuracy: true
    }
    await this.geolocation.getCurrentPosition(options).then((resp: Geoposition) => {
     
      this.latitude = resp.coords.latitude;
      this.longitude = resp.coords.longitude;
    }).catch((error) => {
      this.ctrlService.presentToast('', 'Turn on location (optional)');
    });


  }

  fnCreate() {
    this.listview = false;
    this.fnClear();
  }

  fnClear() {
    this.TypeId = 'LOCAL';
    this.mapFlag = false;
    this.latitude = '0';
    this.longitude = '0';
    this.acId = 0;
    this.screenShot = '';
    this.dataURI = null;
    this.myForm.reset();
    if (this.jsonAreas.length)
      this.AreaId = this.jsonAreas[0].Area_Id;
    if (this.pricemenu.length)
      this.PriceId = this.pricemenu[0].PriceMenu_Id;
    this.fnMapsId();
    
  }

  fnAccountGets() {

    if (this.salesmanActive) {
      this.onSalesmanAccHead();
      return
    }
    this.listview = true;
    this.mapFlag = false;
    let ServiceParams = {};
    ServiceParams['strProc'] = "AccountHead_GetsNew";

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "Search";
    ProcParams["strArgmt"] = this.search;
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "TypeFlag";
    ProcParams["strArgmt"] = 'Customer';
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(this.branchId);
    oProcParams.push(ProcParams)

    ServiceParams['oProcParams'] = oProcParams;

    let body = JSON.stringify(ServiceParams);
    this.appService.fnApiPost(this.Apiurl + '/CommonQuery/fnGetDataReportNew', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        this.listSource = JSON.parse(<any>data);

        this.searchFocus.setFocus();
      }, err => {
        this.ctrlService.presentToast('Sorry', 'Server busy!');
      });
  }

  onSalesmanAccHead() {
    this.listview = true;
    this.mapFlag = false;
    const ServiceParams = { strProc: "", oProcParams: [] };

    ServiceParams.strProc = "AcccountHead_GetsForReportOnSalesman";

    const oProcParams = [];

    let ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "Ac_Name";
    ProcParams.strArgmt = this.search;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "Type";
    ProcParams.strArgmt = "Customer";
    oProcParams.push(ProcParams);

    ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "BranchId";
    ProcParams.strArgmt = String(this.branchId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "SalesmanId";
    ProcParams.strArgmt = String(this.StaffId);
    oProcParams.push(ProcParams);

    ServiceParams.oProcParams = oProcParams;
    const body = JSON.stringify(ServiceParams);
    this.appService.fnApiPost(this.Apiurl + "/CommonQuery/fnGetDataReportNew", body)
    .pipe(takeUntil(this._unsubscribeAll))
    .toPromise()
      .then((data) => {

        const CustomerName = JSON.parse(data);
        this.listSource = CustomerName;

        this.searchFocus.setFocus();


      }).catch((err) => console.error(err));

  }


  anchorclick(value) {
    let ServiceParams = {};
    ServiceParams['strProc'] = "AccountHead_GetAll";

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "AC_Id";
    ProcParams["strArgmt"] = String(value);
    oProcParams.push(ProcParams)

    ServiceParams['oProcParams'] = oProcParams;
    let body = JSON.stringify(ServiceParams);

    this.appService.fnApiPost(this.Apiurl + '/CommonQuery/fnGetDataReportNew', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        let items = JSON.parse(<any>data);
        let res = items[0];
        // EntryMatch

        this.listview = false;
        this.acId = res.AC_Id;
        this.AreaId = res.AreaId;
        this.TypeId = res.PurType;
        this.PriceId = res.PriceMenuId;
        this.latitude = parseFloat(res.Field1 || 0);
        this.longitude = parseFloat(res.Field2 || 0);
        // if (res.EntryMatch) {
        //   this.screenShot = `https://s3.ap-south-1.amazonaws.com/productcodeappsimage/${this.folder}/${res.EntryMatch}`;
        // }
        if (this.latitude && this.longitude) {
          this.mapFlag = true;
          setTimeout(() => {
            this.fngetlocation();
          }, 200);
        }

        this.myForm.patchValue({
          CustomerName: res.AC_Name,
          Address1: res.Addr1, Address2: res.Addr2, Phone: res.Phone,
          TinNo: res.Tin1
        });
       

      }, err => {
        this.ctrlService.presentToast('', 'No internet Connection');
      });
  }
  public map: any;
  fngetlocation() {
    let latLng = new google.maps.LatLng({ lat: this.latitude, lng: this.longitude });
    let mapOptions = {

      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: false,

    }

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.addMarker();
  }

  addMarker() {

    let marker = new google.maps.Marker({
      map: this.map,
      animation: google.maps.Animation.DROP,
      position: this.map.getCenter(),
      draggable: false
    });

  }

  

  ngAfterViewInit() {
    // this.AreaId = 0;

    setTimeout(() => {
      this.myname.setFocus();
    }, 1000);


  }

  customerSubmitForm(event) {
    
    const customergets = this.myForm.value;

    event.preventDefault();
    const AC_Id = this.acId;
    const ServiceParams = {};
    ServiceParams['strProc'] = 'AccountHead_InsertOrUpdateAll';

    const oProcParams = [];

    let ProcParams = {};
    ProcParams['strKey'] = 'AC_Id';
    ProcParams['strArgmt'] = String(this.acId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'AdjAmount';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'AC_Name';
    ProcParams['strArgmt'] = customergets.CustomerName;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Addr1';
    ProcParams['strArgmt'] = customergets.Address1;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Addr2';
    ProcParams['strArgmt'] = customergets.Address2;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Addr3';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'DescEditFlag';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Phone';
    ProcParams['strArgmt'] = String(customergets.Phone);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Mobile';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Email';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Web';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Transporter';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);
    //NEW 

    ProcParams = {};
    ProcParams['strKey'] = 'Fax';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'DLNo1';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'DLNo2';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Tin1';
    ProcParams['strArgmt'] = customergets.TinNo;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Tin2';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'CstNo1';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'CrLmtDays';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'CrLmtAmt';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'CustOrSupp';
    ProcParams['strArgmt'] = 'Customer';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'AreaId';
    ProcParams['strArgmt'] = String(this.AreaId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Alias';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Type';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);


    ProcParams = {};
    ProcParams['strKey'] = 'OBalance';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'ScheduleType';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Schedule1';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Schedule2';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Schedule3';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Schedule4';
    ProcParams['strArgmt'] = "32";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'EntryMatch';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'BankYesNo';
    ProcParams['strArgmt'] = 'No';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Flag';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'UserID';
    ProcParams['strArgmt'] = String(this.StaffId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'CreateDate';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'BranchId';
    ProcParams['strArgmt'] = String(this.branchId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'PurType';
    ProcParams['strArgmt'] = this.TypeId;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'CategoryId';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'StartDate';
    ProcParams['strArgmt'] = '2017-10-10';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'ExpiryDate';
    ProcParams['strArgmt'] = '2017-10-10';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'DateOfBirth';
    ProcParams['strArgmt'] = '2017-10-10';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'IntroducedBy';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Currency';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'IFSCode';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'ModelPoint';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'ModelPointAmt';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'PriceMenuId';
    ProcParams['strArgmt'] = String(this.PriceId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'AgentPriceMenuId';
    ProcParams['strArgmt'] = '0';
    oProcParams.push(ProcParams);


    ProcParams = {};
    ProcParams['strKey'] = 'CustomerFlag';
    ProcParams['strArgmt'] = '1';
    oProcParams.push(ProcParams);


    ProcParams = {};
    ProcParams['strKey'] = 'SupplierFlag';
    ProcParams['strArgmt'] = '0';
    oProcParams.push(ProcParams);


    ProcParams = {};
    ProcParams['strKey'] = 'StaffFlag';
    ProcParams['strArgmt'] = '0';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'LoginFlag';
    ProcParams['strArgmt'] = '0';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'AgentFlag';
    ProcParams['strArgmt'] = '0';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'SalesmanFlag';
    ProcParams['strArgmt'] = '0';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'ActiveFlag';
    ProcParams['strArgmt'] = '1';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'MediaId';
    ProcParams['strArgmt'] = '0';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'CurrencyId';
    ProcParams['strArgmt'] = '0';
    oProcParams.push(ProcParams);


    ProcParams = {};
    ProcParams['strKey'] = 'Field1';
    ProcParams['strArgmt'] = `${parseFloat(this.latitude || 0)}`;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Field2';
    ProcParams['strArgmt'] = `${parseFloat(this.longitude || 0)}`;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Field3';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);


    ProcParams = {};
    ProcParams['strKey'] = 'UserName';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Pwd';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'UniqueDeviceId';
    ProcParams['strArgmt'] = '';
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'OtherFlag';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'AccessLevel';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'AgentMarginPers';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'bSelect';
    ProcParams['strArgmt'] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "ServiceDisPers";
    ProcParams["strArgmt"] = "0";
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "AcDisPers";
    ProcParams["strArgmt"] = "0";
    oProcParams.push(ProcParams);

    ServiceParams['oProcParams'] = oProcParams;

    let body = JSON.stringify(ServiceParams);
    
    this.appService.fnApiPost(this.Apiurl + '/Master/fnAccountHeadInsertAll', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        let jsonSave = JSON.parse(<any>data);
        let Flag = jsonSave[0].flag;
        let RetAcId = 0;
        if (Flag !== 'Already Exists') {
          RetAcId = parseFloat(Flag || 0);
          if (AC_Id !== 0) {
            this.preventAlert(`Added account for: <b>${this.myForm.value.CustomerName}</b>`);
            RetAcId = AC_Id;
            this.startUpload(RetAcId)
          } else {
            this.preventAlert(`Added account for: <b>${this.myForm.value.CustomerName}</b>`);
            this.startUpload(RetAcId)
          }
        } else {
          this.startUpload(RetAcId);
          this.preventAlert(`Customer Saved Successfully !!`);
          return;
        }
      }, err => {
        this.ctrlService.presentToast('Sorry', 'Server Busy!');
      });
  }

  preventAlert(msg) {
    this.alertcontroller.create({
      header: 'Success!!',
      message: msg,
      buttons: [{
        text: 'OK',
        handler: () => {
          this.fnClear();
        }
      }]
    }).then(alert => alert.present());
  }


  fnArea_GetsForSales() {

    const ServiceParams = { strProc: '', oProcParams: [] };
    ServiceParams.strProc = 'AreaGetsOnBranchId';

    const oProcParams = [];

    let ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsArea_Name';
    ProcParams.strArgmt = '';
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsBranchId';
    ProcParams.strArgmt = String(this.branchId);
    oProcParams.push(ProcParams);

    ServiceParams.oProcParams = oProcParams;
    const body = JSON.stringify(ServiceParams);
    
    this.appService.fnApiPost(this.Apiurl + '/CommonQuery/fnGetDataReportFromScriptJsonFile', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .toPromise().then(data => {
        
        let jsonData: any = data
        const dataObj = jsonData.JsonDetails;
        this.jsonAreas = JSON.parse(dataObj);
        if (this.jsonAreas.length) {
          this.AreaId = this.jsonAreas[0].Area_Id;
        }
        this.fnPriceMenuGets();
      }).catch(() => {
        this.ctrlService.presentToast('', 'No internet Connection');
      })

  }

  fnPriceMenuGets() {

    const ServiceParams = { strProc: '' };

    ServiceParams.strProc = 'PriceMenu_Gets';
    const body = JSON.stringify(ServiceParams);
    this.appService.fnApiPost(this.Apiurl + '/CommonQuery/fnGetDataReportOnlineOrder', body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(result => {
        this.pricemenu = JSON.parse(<any>result);
        this.PriceId = this.pricemenu[0].PriceMenu_Id
      }, err => {
        this.ctrlService.presentToast('', 'No internet Connection');
      });
  }

  fnAreaChange(event) {
    this.AreaId = event.target.value;
  }
  fnPriceChange(event) {
    this.PriceId = event.target.value;
  }

  fnTypeChange(event) {
    this.TypeId = event.target.value;
  }
 

  // const base64 = this.screen;
  // this.uploadBase64(base64, 'image.png');
  startUpload(acid) {

    if (!this.dataURI) {
      return
    }
    this.file.resolveLocalFilesystemUrl(this.dataURI.filePath)
      .then(entry => {
        (<FileEntry>entry).file(file => this.readFile(file, acid));
      })
      .catch(err => {
        this.ctrlService.presentToast('', 'No internet Connection');
      });
  }



  readFile(file: any, acid) {
    const reader = new FileReader();
    reader.onload = () => {
      const formData = new FormData();
      const imgBlob = new Blob([reader.result], {
        type: file.type
      });

      formData.append("FileUpload", file);
      formData.append("AcId", acid);
      // formData.append('file', imgBlob, file.name);
      this.uploadImageData(formData);
    };
    reader.readAsArrayBuffer(file);
  }

  async uploadImageData(formData: FormData) {

    this.http.post(`${this.Apiurl}/Master/UploadImageAccountHeadS3Browser`, formData, { reportProgress: true, observe: 'events' })
    .pipe(takeUntil(this._unsubscribeAll))
    .subscribe(event => {
        if (event.type === HttpEventType.UploadProgress)
          this.progress = Math.round(100 * event.loaded / event.total);
        else if (event.type === HttpEventType.Response) {
          this.progress = 0;

        }
      }, err => {
        this.ctrlService.presentToast('', 'No internet Connection');
      })
  }


  // uploadBase64(acid) {

  //   if (!this.dataURI) {
  //     return
  //   }

  //   // call method that creates a blob from dataUri
  //   const imageBlob = this.dataURItoBlob(this.dataURI);
  //   const imageFile = new File([imageBlob], 'imageName', { type: 'image/jpeg' })

  //   const formData = new FormData();
  //   formData.append("FileUpload", imageFile);
  //   formData.append("AcId", acid);

  //   this.http.post(`${this.Apiurl}/Master/UploadImageAccountHeadS3Browser`, formData, { reportProgress: true, observe: 'events' })
  //     .subscribe(event => {
  //       if (event.type === HttpEventType.UploadProgress)
  //         this.progress = Math.round(100 * event.loaded / event.total);
  //       else if (event.type === HttpEventType.Response) {
  //         this.progress = 0;

  //       }
  //     })
  // }


  dataURItoBlob(dataURI) {

    const byteString = window.atob(dataURI.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const int8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      int8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([int8Array], { type: 'image/jpeg' });
    return blob;
  }

  
ngOnDestroy(): void {

  this._unsubscribeAll.next();
  this._unsubscribeAll.complete();
}
}

