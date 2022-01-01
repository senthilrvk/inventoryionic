import { AfterViewInit, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ModalController, NavParams, ToastController } from '@ionic/angular';
import { Geolocation, GeolocationOptions, Geoposition } from '@ionic-native/geolocation/ngx';
declare var google;
@Component({
  selector: 'app-view-details',
  templateUrl: './view-details.component.html',
  styleUrls: ['./view-details.component.scss'],
})
export class ViewDetailsComponent implements OnInit, AfterViewInit {
  @Input() deliveryItem: any;
  @ViewChild('mapElement', { read: '', static: false }) mapNativeElement: ElementRef;

  private customerLocation: {lat: number, lng: number} = {
    lat: 12.9566932,
    lng: 80.26557369999999
  };
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  trackResult: { km: string; time: string } = {
    km: '0 km',time: '0 min'
  }
  btnNavigate:boolean = false;
  private currentLocation: {lat: number, lng: number} = { 
    lat: 0, // 12.9566932 
    lng: 0, // 80.26557369999999
  };
  itemData: any;

  private map: any;
  constructor(navParams: NavParams,
    public toastController: ToastController,
    private geolocation: Geolocation, public modalCtrl: ModalController) {
    this.itemData = navParams.get('deliveryItem');

    this.customerLocation.lat = parseFloat(this.itemData.latitude || 0)
    this.customerLocation.lat = parseFloat(this.itemData.longitude || 0)
  }

  ngOnInit() {
   
  }
  ngAfterViewInit() {
    setTimeout(() => {
      let options = { enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0};
      this.geolocation.getCurrentPosition(options).then((resp) => {
        this.currentLocation.lat = resp.coords.latitude;
        this.currentLocation.lng = resp.coords.longitude;
        this.fngetlocation();
        // console.log( this.currentLocation);
      }); 
    
   });
  }


  fngetlocation() {
    let latLng = new google.maps.LatLng(this.currentLocation);
    let mapOptions = {
      center: latLng,
      zoom: 15,
      // mapId:'181a6309aab72264',
      mapTypeId: google.maps.MapTypeId.TERRAIN ,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: false,
      scaleControl: false,
    }

    this.map = new google.maps.Map(this.mapNativeElement.nativeElement, mapOptions);
    this.directionsDisplay.setMap(this.map);
    this.startTracking();
    
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
    }, async (response, status) => {
          // distance
        // duration
      if (status === 'OK') {
        this.directionsDisplay.setDirections(response);
        const directionResult = response.routes[0].legs[0];
        const totalKmph = directionResult.distance.text;
        const totalTimeReached = directionResult.duration.text;
        this.trackResult = { km: totalKmph, time: totalTimeReached };
        
      } else {
        this.btnNavigate = true;
        // window.alert('Directions request failed due to ' + status);
        const toast = await this.toastController.create({
          message: 'Directions request failed',
          position: 'top',
          color: 'danger',
          duration: 2000
        });
        toast.present();
      }
    });
  }
  startNavigate() {
    let mapWindow = `https://www.google.com/maps/dir/?api=1&origin=${this.currentLocation.lat},${this.currentLocation.lng}&destination=${this.customerLocation.lat},${this.customerLocation.lng}`;
    //  &travelmode=bicycling
    window.open(mapWindow)
  }
  onActive() {
    this.modalCtrl.dismiss('active');
  }

  onAccept() {
    this.modalCtrl.dismiss('accept');
  }

  
}
