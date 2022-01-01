import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {  Observable, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";

const httpsOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'charset=utf-8'
    })
  };
  
@Injectable({
    providedIn:'root'
  })
  export class LoginService {
  
    constructor(public https: HttpClient) { }

    inventoryLogin(username, password, branchId, url):Observable<any> {
        let varArguments = {};
        varArguments = { EmployeeID: username, Pwd: password, BranchId: branchId };
        const DictionaryObject = {dictArgmts: {}, ProcName: '' };
        DictionaryObject.dictArgmts = varArguments;
        DictionaryObject.ProcName = 'StaffLogin';
        const body = JSON.stringify(DictionaryObject);
       
        return this.https.post<any>(`${url}/Login/StaffLogin`, body, httpsOptions)
    
      }

      orderLogin(username, password, url):Observable<any> {
        let varArguements = {};
        varArguements = { Name: username, Pwd: password };
        const DictionaryObject = { dictArgmts: {}, ProcName: '' };
        DictionaryObject.dictArgmts = varArguements;
        DictionaryObject.ProcName = 'SalesRep_Login';
        const body = JSON.stringify(DictionaryObject);
        return this.https.post<any>(`${url}/Master/SalesExecutive_GetonLogin`, body, httpsOptions)
      }

      fnBranchGet(url):Observable<any> {
        let ServiceParams = {};
        ServiceParams['strProc'] = "Branch_GetsForLogin";
        ServiceParams['JsonFileName'] = 'JsonArrayScriptTen';
        let oProcParams = [];
        let ProcParams = {};
        ProcParams["strKey"] = "@ParamsBranchName";
        ProcParams["strArgmt"] = '';
        oProcParams.push(ProcParams);
    
        ServiceParams['oProcParams'] = oProcParams;
    
        let body = JSON.stringify(ServiceParams);
        
        return this.https.post<any>(`${url}/CommonQuery/fnGetDataReportFromScriptJsonFileUnauthorize`, body, httpsOptions)
          .pipe(
            retry(1),
            catchError(this.errorHandler)
        )
        
          
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
        console.log(errorMessage);
        return throwError(errorMessage);
      }
  }