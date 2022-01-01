import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppService } from 'src/app/app.service';
declare var google;

const httpOptions = {
  headers: new Headers({
    'Content-Type': 'application/json',
    Authorization: 'charset=utf-8'
  })
};
@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss'],

})

export class LocationListComponent implements OnInit {
  @ViewChild('mapElement', { read: '', static: false }) mapNativeElement: ElementRef;
  @ViewChild('directionsPanel', { read: '', static: false }) directionsPanel: ElementRef;
  private branchId: any;
  dataSource: any;
  listshow: boolean = false;
  footer: boolean = false;
  private apiUrl: string = '';
  private _unsubscribeAll: Subject<any>;
  private customerLocation: any = { 
    lat: 0, // 12.9566932 
    lng: 0, // 80.26557369999999
  };

  private currentLocation: any = { 
    lat: 0, // 12.9566932 
    lng: 0, // 80.26557369999999
  };
  trackResult = {
    km: '', time: ''
  }
  public storage = new Storage()
  private directionsService = new google.maps.DirectionsService;
  private directionsDisplay = new google.maps.DirectionsRenderer;
  private map: any;
  constructor(private _appService: AppService,  private geolocation: Geolocation) { }

  ngOnInit() {
    this._unsubscribeAll = new Subject();
    this.getcurrentLocation();
    this.storage.create();
    this.storage.forEach((val, key) => {
      switch (key) {
        case 'SessionBranchId':
          this.branchId = val;
          break;

        case 'sessionInvenBranchId':
          this.branchId = val;
          break;
          case 'sessionsurl':
            this.apiUrl = val;
            break;
        
      }
    }).finally(() => {
      this.fnAccountGets();
    });
  }

  onDismiss() {
    this.footer = false;
    this.listshow = false;
    this.customerLocation = { 
      lat: 0, 
      lng: 0, 
    };
  
    this.map = null;
    this.fngetlocation()
  }

  fnAccountGets() {

    let ServiceParams = { strProc: '', JsonFileName: '' };
    ServiceParams.strProc = 'AccountHead_GoogleRouteMapGets';
    ServiceParams.JsonFileName = 'JsonArrayScriptFour';

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "@ParamsBranchId";
    ProcParams["strArgmt"] = String(this.branchId);
    oProcParams.push(ProcParams);

    ServiceParams['oProcParams'] = oProcParams;

    const body = JSON.stringify(ServiceParams);
    
    this._appService.fnApiPost(`${this.apiUrl}/CommonQuery/fnGetDataReportFromScriptJsonFile`, body)
    .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(data => {
        this.dataSource = JSON.parse(data.JsonDetails)
        
      });
  }

  locationGet(map) {
    this.listshow = true;
    this.customerLocation.lat = parseFloat( map.Field1 || 0);
    this.customerLocation.lng = parseFloat( map.Field2 || 0);
    setTimeout(() => {
      this.fngetlocation();
    }, 1000);
    
    // Field1 Field2
  }

  fngetlocation() {
    let latLng = new google.maps.LatLng(this.customerLocation);
    let mapOptions = {
    center: latLng,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false
    }
  
    this.map = new google.maps.Map(this.mapNativeElement.nativeElement, mapOptions);
    
    this.addMarker();
  }

  addMarker() {

    let marker = new google.maps.Marker({
    map: this.map,
    animation: google.maps.Animation.DROP,
    position: this.map.getCenter()
    });

    let content = "<p>Salesman current position !</p>";          
    let infoWindow = new google.maps.InfoWindow({
    content: content
    });

    google.maps.event.addListener(marker, 'click', () => {
    infoWindow.open(this.map, marker);
    });

  }

  getcurrentLocation() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.currentLocation = { 
        lat: resp.coords.latitude, // 12.9566932 
        lng: resp.coords.longitude, // 80.26557369999999
      };
     }).catch((error) => {
       console.log('Error getting location', error);
     });
     
  }
  
  startTracking() {
    this.directionsDisplay.setMap(this.map);
    // this.directionsDisplay.setPanel(this.directionsPanel.nativeElement);
    let destlatLng = new google.maps.LatLng(this.customerLocation);
    let originlatLng = new google.maps.LatLng(this.currentLocation);

    this.directionsService.route({
      origin: originlatLng,
      destination: destlatLng,
      travelMode: 'DRIVING',
    }, (response, status) => {
          // distance
        // duration
      if (status === 'OK') {
        this.directionsDisplay.setDirections(response);
        const directionResult = response.routes[0].legs[0];
        const totalKmph = directionResult.distance.text;
        const totalTimeReached = directionResult.duration.text;
        this.trackResult = { km: totalKmph, time: totalTimeReached };
        
        this.footer = true;
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }

  
ngOnDestroy(): void {

  this._unsubscribeAll.next();
  this._unsubscribeAll.complete();
}
}
