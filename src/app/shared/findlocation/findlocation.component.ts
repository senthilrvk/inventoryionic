import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
declare var google;

@Component({
  selector: 'app-findlocation',
  templateUrl: './findlocation.component.html',
  styleUrls: ['./findlocation.component.scss']
})
export class FindlocationComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapElement', {read: '', static: false}) mapNativeElement: ElementRef;
  directionsService = new google.maps.DirectionsService;
  directionsDisplay = new google.maps.DirectionsRenderer;
  directionForm: FormGroup;
  private currentLocation: any = { 
    lat: 0, // 12.9566932 
    lng: 0, // 80.26557369999999
  };
 
  map: any;

  
  isTracking = false;
  trackedRoute = [];
  previousTracks = [];
 
  positionSubscription: Subscription;
  
    constructor(private fb: FormBuilder, private geolocation: Geolocation) {
    this.createDirectionForm();
   }
 
  ngOnInit() {
    
    
  }

  ngAfterViewInit(): void {
    let options = { enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0};
    this.geolocation.getCurrentPosition(options).then((resp) => {
      this.currentLocation.lat = resp.coords.latitude;
      this.currentLocation.lng = resp.coords.longitude;
      // console.log( this.currentLocation);
    }).catch((err) => {
      console.error(err);
    }) 
  }


  ngOnDestroy() {
    if(this.positionSubscription)
    this.positionSubscription.unsubscribe()
  }
  
  fngetlocation() {
    let latLng = new google.maps.LatLng(this.currentLocation);
    
    
    let mapOptions = {
    center: latLng,
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    mapTypeControl: false,
    streetViewControl: false,
    fullscreenControl: false
    }
  
    this.map = new google.maps.Map(this.mapNativeElement.nativeElement, mapOptions);
    this.directionsDisplay.setMap(this.map);
    this.addMarker();
  }

  addMarker(){

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
  createDirectionForm() {
    this.directionForm = this.fb.group({
      destination: ['', Validators.required]
    });
  }

  

  startTracking() {
    this.isTracking = true;
    this.trackedRoute = [];
    this.positionSubscription = this.geolocation.watchPosition()
      .pipe(filter((p:any) => p.coords !== undefined))
      .subscribe(data => {
        setTimeout(() => {
          this.trackedRoute.push({ lat: data.coords.latitude, lng: data.coords.longitude });
          this.redrawPath(this.trackedRoute);
        }, 0);
      });

  }

  redrawPath(path) {
    
    if (this.directionsDisplay) {
      this.directionsDisplay.setMap(null);
    }
    if (path.length > 1) {
      this.directionsDisplay = new google.maps.Polyline({
        path: path,
        geodesic: true,
        strokeColor: '#ff00ff',
        strokeOpacity: 1.0,
        strokeWeight: 3
      });
      
      
      this.directionsDisplay.setMap(this.map);
    }
  }


// stopTracking() {
//   let newRoute = { finished: new Date().getTime(), path: this.trackedRoute };
//   this.previousTracks.push(newRoute);
//   this.storage.set('routes', this.previousTracks);
 
//   this.isTracking = false;
//   this.positionSubscription.unsubscribe();
//   this.directionsDisplay.setMap(null);
// }
 
// showHistoryRoute(route) {
//   this.redrawPath(route);
// }
}
