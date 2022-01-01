import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { BehaviorSubject } from 'rxjs';
import { ControlService } from '../controlservice/control.service';
const TOKEN_KEY = 'auth-token';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authenticationState = new BehaviorSubject(false);
  dataClear = new BehaviorSubject(false);
  constructor(private ctrlService: ControlService,
    private plt: Platform) {
    this.plt.ready().then(() => {
      this.checkToken();
    });
  }

  checkToken() {
    this.ctrlService.get(TOKEN_KEY).then(res => {
      if (res) {
        this.authenticationState.next(true);
      }
    })
  }
  
  login(token) {
    return this.ctrlService.set(TOKEN_KEY, token).then(() => {
      this.authenticationState.next(true);
    });
  }
  
  logout() {
    return this.ctrlService.remove(TOKEN_KEY).then(() => {
      this.authenticationState.next(false);
    });
  }
 
  isAuthenticated() {
    return this.authenticationState.value;
  }

  
  storageDataSet(value) {
    this.dataClear.next(value)
  }
  

}
