import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { delay, finalize } from 'rxjs/operators';
import { LoadingController } from '@ionic/angular';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
   
    constructor( public loadingController: LoadingController) {}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      
      if(req.method === 'POST' && 
      req.body.includes('AcccountHead_GetsForReportOnSalesman') || 
      req.body.includes('AccountHead_SearchForAccountReceipt') ||
      req.body.includes('AccountHead_SearchForSalesFilter') ||
        req.body.includes('AccountHead_SearchForReturn') ||
        req.body.includes('fnGetDataReportFromQuery')         
        
      ) {
        return next.handle(req);
      }
     
        // this.present();
        return next.handle(req).pipe(
            // delay(500),
            finalize(() => {
                // this.hideLoader();
                // this.loadingService.idle();
            })
        );
    }


    public loader:any;
    async present() {
        this.loader = await this.loadingController.create({
          cssClass: 'my-custom-class',
          message: 'Loading ...',
          duration: 2000
        });
        await this.loader.present();
      }
    
    
      async hideLoader() {
        let topLoader = await this.loadingController.getTop();
        while (topLoader) {
          if (!(await topLoader.dismiss())) {
            // throw new Error('Could not dismiss the topmost loader. Aborting...');
            break
          }
          topLoader = await this.loadingController.getTop();
        }
      }
}
