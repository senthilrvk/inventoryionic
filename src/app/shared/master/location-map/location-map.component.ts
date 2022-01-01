import { Component, OnInit, ViewChild, ElementRef, Input, NgZone } from '@angular/core';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ModalController } from '@ionic/angular';
import { Screenshot } from '@ionic-native/screenshot/ngx';

declare var google;

@Component({
  selector: 'app-location-map',
  templateUrl: './location-map.component.html',
  styleUrls: ['./location-map.component.scss'],
  providers: []
})
export class LocationMapComponent implements OnInit {
  @ViewChild('map', { read: false, static: true }) mapElement: ElementRef;

  @Input() lat: any;
  @Input() long: string;

  private currentLocation: any = {
    lat: 0, // 12.9566932 
    lng: 0, // 80.26557369999999
  };

  public map: any;
  private screen: any;
  public state: boolean = false;
  public autocomplete: { input: string; };
  public autocompleteItems: any[] = [];
  private GoogleAutocomplete: any;
  
  constructor(public geolocation: Geolocation, public zone: NgZone,
    private modalCtrl: ModalController, private screenshot: Screenshot, ) {
  }

  ngOnInit() {
    // this.fngetlocation();
    this.currentLocation.lat = this.lat;
    this.currentLocation.lng = this.long;
    this.autocomplete = { input: '' };
    this.GoogleAutocomplete = new google.maps.places.AutocompleteService();
    setTimeout(() => {
      this.fngetlocation();
    }, 2000);
    
  }

  reset() {
    var self = this;
    setTimeout(function () {
      self.state = false;
    }, 1000);
  }

  screenShot() {
    
    let filename = `location${new Date().getTime()}`;
    this.screenshot.save('jpg', 80, filename).then(res => {
    
     this.screen = res;
     this.state = true;;
     this.reset();
     this.dismiss(false);
    }).catch((err) => {
      console.error(err)
      this.dismiss(false);
    })

    // this.screenshot.URI(80).then(res => {
    //   this.screen = res.URI;
    //   this.state = true;
    //   this.reset();
    //   this.dismiss(false);
    // }).catch((err) => {
    //   console.error(err)
    //   this.dismiss(false);
    // })

  }
 


  getCurrentCoordinates() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.currentLocation.lat = resp.coords.latitude;
      this.currentLocation.lng = resp.coords.longitude;
      let latLng = new google.maps.LatLng(this.currentLocation);
      let mapOptions = {

        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
      }

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

      this.addMarker();
    }).catch((error) => {
      console.log('Error getting location', error);
    });
  }

  fngetlocation() {

    let latLng = new google.maps.LatLng(this.currentLocation);
    let mapOptions = {

      center: latLng,
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
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

    let content = "<p>Your current position !</p>";
    let infoWindow = new google.maps.InfoWindow({
      content: content
    });
    this.markerBounce(marker)
    google.maps.event.addListener(marker, 'dragend', (evt) => {
      this.currentLocation.lat = evt.latLng.lat();
      this.currentLocation.lng = evt.latLng.lng();
      infoWindow.open(this.map, marker);
    });

  }


  dismiss(value: boolean) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'position': this.currentLocation,
      'imageLoc': this.screen,
      'path': this.screen,
      'dismiss': value
    });
  }


  markerBounce(marker) {
    google.maps.event.addListener(marker, 'click', (evt) => {
      if (marker.getAnimation() !== null) {
        marker.setAnimation(null);
      } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
      }
    });
  }

  UpdateSearchResults() {
    if (this.autocomplete.input == '') {
      this.autocompleteItems = [];
      return;
    }
    this.GoogleAutocomplete.getPlacePredictions({ input: this.autocomplete.input },
      (predictions, status) => {
        this.autocompleteItems = [];
        this.zone.run(() => {
          predictions.forEach((prediction) => {
            this.autocompleteItems.push(prediction);
          });
        });
      });
  }

  SelectSearchResult(item) {
    let mapOptions = {
      center: this.currentLocation,
      zoom: 8,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    const infowindow = new google.maps.InfoWindow();
    const map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);
    ///WE CAN CONFIGURE MORE COMPLEX FUNCTIONS SUCH AS UPLOAD DATA TO FIRESTORE OR LINK IT TO SOMETHING

    const placeId = item.place_id;
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ placeId: placeId }, (results, status) => {
      if (status === "OK") {
        if (results[0]) {
          map.setZoom(8);
          map.setCenter(results[0].geometry.location);
          const marker = new google.maps.Marker({ map, position: results[0].geometry.location });
          infowindow.setContent(results[0].formatted_address);
          infowindow.open(map, marker);
          this.markerBounce(marker);
          let lattitude = marker.getPosition().lat();
          let longtitude = marker.getPosition().lng();
          this.currentLocation.lat = lattitude;
          this.currentLocation.lng = longtitude;

        } else {
          window.alert("No results found");
        }
      } else {
        window.alert("Geocoder failed due to: " + status);
      }
    });
    this.autocomplete.input = item.description;
    setTimeout(() => {
      this.autocompleteItems = [];

    }, 1000);
  }
}
