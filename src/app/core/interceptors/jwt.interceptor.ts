import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  ToastController } from '@ionic/angular';
import { from, Observable, throwError } from 'rxjs';
import { ControlService } from '../services/controlservice/control.service';

import { catchError, mergeMap } from 'rxjs/operators';
@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    
    constructor(private _ctrlService: ControlService, private toastController: ToastController) { }
    
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        let promise = this._ctrlService.get('auth-token');
        const source = from(new Promise(resolve => resolve(promise)));
        //map to inner observable and flatten
        return source.pipe(mergeMap(token => {
        let clonedReq = this.addToken(request, token);
        return next.handle(clonedReq).pipe(
        catchError(error => {
            // Perhaps display an error for specific status codes here already?
            let msg = error.message;
            // this.presentToast(error.name, msg)
            // Pass the error to the caller of the function
            return throwError(error);
        })
    );
}));

}

    private addToken(request: HttpRequest<any>, token: any) {
        if (token) {
            let clone: HttpRequest<any>;
            clone = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${token}`
                }
            });
            return clone;
        }
 
        return request;
    }
  
      async presentToast(header, subHeader) {
        const toast = await this.toastController.create({
          header: header,
          message: subHeader,
          duration: 2000
        });
        toast.present();
      }
    
}