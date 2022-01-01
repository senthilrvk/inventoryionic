import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { NavigationExtras } from '@angular/router';
import { Injectable } from '@angular/core';
import { catchError, delay } from 'rxjs/operators';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../services/auth/auth.service';
@Injectable()
export class ErrorInterceptor implements HttpInterceptor  {
    constructor(private toastr: ToastController,private _authService: AuthService ) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            catchError((error) => {
                  console.log(error);
                  
                if (error) {
                    if (error.status === 400) {
                        if (error.error.errors) {
                            throw error.error;
                        } else {
                            this.presentToast(error.error.message, error.error.statusCode);
                        }
                    }
                    if (error.status === 401) {
                        this.presentToast(error.error.message, error.error.statusCode);
                        this._authService.logout()
                    }
                    if (error.status === 404) {
                        // this.router.navigateByUrl('/not-found');
                    }
                    if (error.status === 500) {
                        const navigationExtras: NavigationExtras = {state: {error: error.error}};
                        // this.router.navigateByUrl('/server-error', navigationExtras);
                    }
                }
                return throwError(error);
            })
        );
    }
    async presentToast(title:string, msg:string) {
        const toast = await this.toastr.create({
          header: title,
          message: msg,
          duration: 2000
        });
        toast.present();
      }
}
