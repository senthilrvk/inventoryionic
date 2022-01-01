
import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, retry } from 'rxjs/operators';
import { Storage } from '@ionic/storage';
import { BehaviorSubject, Observable, of, Subject, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { AuthService } from './core/services/auth/auth.service';

const httpOptions = {
  headers: new Headers({
    'Content-Type': 'application/json',
    'Authorization': 'charset=utf-8'
  })
};


const httpsOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'charset=utf-8'
  })
};

@Injectable({
  providedIn:'root'
})
export class AppService {
  public CartData = new BehaviorSubject<any[]>([]);
  public urlvalidate  = new Subject<boolean>();
  public Apiurl: any;
  
  branchId: any;
  BranchData: any;
 
  private _isBoolean = new BehaviorSubject<boolean>(false);
  private _menuItems = new BehaviorSubject<any[]>([]);
  private _api = new BehaviorSubject<string>('');
  public storage = new Storage();
  constructor(public http: Http, public https: HttpClient,
    private router: Router, 
    public toastController: ToastController,
    private authenticationService: AuthService) {
      this.storage.create()
    this.storage.get('SessionBranchId').then((val) => {
      this.branchId = val;
    });
    this.storage.get('sessionsurl').then((val) => {
      this._api.next(val)
      this.Apiurl = val;
    });
    
    this._api.subscribe(res => {
      this.Apiurl = res;
      
    })
  }

  public get isBoolean(): Observable<boolean> {
    //return this._isBoolean.value; // Returns boolean, but throws error "Type 'boolean' is not assignable to type 'Observable<boolean>'."
    return this._isBoolean; // Returns object, but I want the value
  }

  public get menuItems(): Observable<any[]> {
    return this._menuItems; 
  }

  updateMenu(value) {
    this._menuItems.next(value)
  }

  fnApiPost(url: string, body: any): Observable<any> {
    return this.https.post<any>(url, body, httpsOptions).pipe(
      catchError(this.errorHandler)
    );
  }

  fnApiget(url: string) {
    return this.http.get(this.Apiurl + url);
  }

  
  setCartData(val) {
    this.CartData.next(val);
  }

  setloginUrl(value) {
    this.urlvalidate.next(value)
  }

  
  fnReplogin(name, pwd) {

    let varArguements = {};
    varArguements = { Name: name, Pwd: pwd };
    const DictionaryObject = { dictArgmts: {}, ProcName: '' };
    DictionaryObject.dictArgmts = varArguements;
    DictionaryObject.ProcName = 'SalesRep_Login';
    const body = JSON.stringify(DictionaryObject);

    return this.http.post(this.Apiurl + '/Master/SalesExecutive_GetonLogin', body, httpOptions).pipe(
      map(login => login.json())
    );
  }

updateLogin(val) {
  this._isBoolean.next(val);
}

fnLogOut() {
  this.storage.remove('SessionSalesmanId');
  this.storage.remove('SessionBranchId');
  this.storage.remove('sessionInvenStaffId');
  this.storage.remove('sessionInvenBranchId');
  this.storage.remove('GodownId');
  // this.updateLogin(false);
  this.authenticationService.logout();
  }
  
errorHandler(error) {
  let errorMessage = '';
  if (error.error instanceof ErrorEvent) {
    // Get client-side error
    errorMessage = error.error.message;
  } else {
    // Get server-side error
    errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
  }
  console.error(errorMessage);
  return throwError(errorMessage);
}
 
}

