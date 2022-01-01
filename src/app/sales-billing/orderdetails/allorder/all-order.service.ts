import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { delayedRetry } from 'src/app/core/guards/delayed-request';
const httpsOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'charset=utf-8'
  })
};
@Injectable({
  providedIn: 'root'
})
export class AllOrderService {

  constructor(public https: HttpClient) { }

  onGetData(isFromdate, isTodate, salesId, url): Observable<any> {
    const ServiceParams = { strProc: "", oProcParams: {} };
    ServiceParams.strProc = "SalesOrderMain_GetDetailsDatewiseRepwise";

    const oProcParams = [];

    let ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "FromDate";
    ProcParams.strArgmt = isFromdate;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "ToDate";
    ProcParams.strArgmt = isTodate;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "RepId";
    ProcParams.strArgmt = String(salesId);
    oProcParams.push(ProcParams);

    ServiceParams.oProcParams = oProcParams;
   
    const body = JSON.stringify(ServiceParams);
    return this.post(url + '/CommonQuery/fnGetData', body)
  }
  onBillwiseOutstandingOnAcId(acId, branchId, url): Observable<any> {
    let ServiceParams = {};

    ServiceParams["strProc"] = "OutstandingSupplier_GetOnAcId";

    let oProcParams = [];
    let ProcParams = {};
    ProcParams["strKey"] = "AC_Id";
    ProcParams["strArgmt"] = String(acId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(branchId);
    oProcParams.push(ProcParams);

    ServiceParams["oProcParams"] = oProcParams;
    let body = JSON.stringify(ServiceParams);
    return this.post(url + "/CommonQuery/fnGetDataReportNew", body)
  }


  onProductsearch(keyword, branchId, url): Observable<any> {
    const varArguements = {
      BranchId: branchId,
      dictArgmts: keyword,
    };
    const DictionaryObject = { ProcName: "", dictArgmts: {} };
    DictionaryObject.ProcName = "Product_SearchSales";
    DictionaryObject.dictArgmts = varArguements;

    const body = JSON.stringify(DictionaryObject);
    return this.post(url + "/Sales/Product_SearchSales", body)
  }
  
  onGetLeadgerAmtOnAcId(AcId, branchId,url): Observable<any> {
    let ServiceParams = {};
    ServiceParams["strProc"] = "LeadgerAmtGetOnAcId";

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "AcId";
    ProcParams["strArgmt"] = String(AcId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(branchId);
    oProcParams.push(ProcParams);
    ServiceParams["oProcParams"] = oProcParams;
    let body = JSON.stringify(ServiceParams)
    return this.post(url + "/CommonQuery/fnGetDataReportNew", body);
  }
  public post(url: string, body: any): Observable<any> {
    return this.https.post<any>(`${url}`, body, httpsOptions)
      .pipe(
        delayedRetry(2000, 2),
        catchError(this.handleError<any>('post')),
        shareReplay()
      )
  }


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      return of(result as T);
    };
  }


 
}
