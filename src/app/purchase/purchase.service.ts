import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { catchError, shareReplay } from "rxjs/operators";
import { delayedRetry } from "../core/guards/delayed-request";



const httpsOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'charset=utf-8'
  })
};

@Injectable({
  providedIn: 'root'
})
export class PurchasePageService {

  constructor(public https: HttpClient) { }

  onSettings(url): Observable<any> {
    const dictArgmts = { ProcName: 'Settings_GetValues' };
    const body = JSON.stringify(dictArgmts);
    return this.post(url + '/Master/fnSettings', body)
  }

  onSupplierSearch(keyword, branchId,url):Observable<any> {
    let ServiceParams = {};
    ServiceParams['strProc'] = "AccountHead_SearchForPurchase";

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "AC_Name";
    ProcParams["strArgmt"] = keyword;
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(branchId);
    oProcParams.push(ProcParams)
    ServiceParams['oProcParams'] = oProcParams;
    return this.post(url + '/CommonQuery/fnGetDataReportNew', ServiceParams)

  }

  onPurchaseGets(search, Book_FromDate, Book_ToDate, BillSerId, storage):Observable<any> {

    let ServiceParams = {};
    ServiceParams['strProc'] = "Receipt_GetsNew";

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "Receipt_SlNo";
    ProcParams["strArgmt"] = search;
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "FromDate";
    ProcParams["strArgmt"] = Book_FromDate;
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "ToDate";
    ProcParams["strArgmt"] = Book_ToDate;
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "PurBillSerId";
    ProcParams["strArgmt"] = String(BillSerId);
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(storage.branchId);
    oProcParams.push(ProcParams)
    ServiceParams['oProcParams'] = oProcParams;

    return this.post(storage.apiUrl + '/CommonQuery/fnGetDataReportNew', ServiceParams)

  }

  onPurchaseBillGet(params) {
    var varArguements = { Pur_SlNo: params.purSno, PurchaseId: params.PurchaseId, BranchId: params.branchId };

    var DictionaryObject = {};
    DictionaryObject["dictArgmts"] = varArguements;
    DictionaryObject["ProcName"] = 'Receipt_CopyBillNo';
    let body = JSON.stringify(DictionaryObject);
    return this.post(params.apiUrl + '/Purchase/Purchase_Copy', body)
  }

  onBillSeries_Gets(params):Observable<any> {
    let ServiceParams = {};
    ServiceParams['strProc'] = "PurBillSeries_GetsStaffwise";

    let oProcParams = [];
    let ProcParams = {};

    ProcParams["strKey"] = "StaffId";
    ProcParams["strArgmt"] = String(params.staffId);
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(params.branchId);
    oProcParams.push(ProcParams)

    ServiceParams['oProcParams'] = oProcParams;

    return this.post(params.apiUrl + '/CommonQuery/fnGetDataReportBranchStaff', ServiceParams)

  }

  onTaxGets(params):Observable<any> {
    let ProcName = { ProcName: 'Tax_Gets' };
    return this.post(params.apiUrl +'/Master/TaxGets', ProcName)
  }

  onGetMaxBillNo(BillSerId, params):Observable<any> {

    let ServiceParams = {};
    ServiceParams['strProc'] = "PurBillSeries_GetMaxBillNo";

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "BillSerId";
    ProcParams["strArgmt"] = String(BillSerId);
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(params.branchId);
    oProcParams.push(ProcParams)
    ServiceParams['oProcParams'] = oProcParams;
    return this.post(params.apiUrl + '/CommonQuery/fnGetDataReportNew', ServiceParams)

  }

  onProductSearch(keyword, params) {

    let varArguements = { dictArgmts: keyword, BranchId: params.branchId };

    let DictionaryObject = {};
    DictionaryObject["dictArgmts"] = varArguements;
    DictionaryObject["ProcName"] = 'Product_SearchPurchase';

    return this.post(params.apiUrl + '/Purchase/Product_SearchPurchase', DictionaryObject);
  }

  onColOrderForHeader(params):Observable<any> {
    let varParams = {};
    varParams = { ControlType: 'Purchase', BranchId: params.branchId };

    let DictionaryObject = {};
    DictionaryObject["dictArgmts"] = varParams;
    DictionaryObject["ProcName"] = 'ControlOrder_GetOnType';

    return this.post(params.apiUrl + '/Purchase/fnGetControlOrder', DictionaryObject);
  }

  onPriceMenusGets(params):Observable<any> {
    let ServiceParams = {};
    ServiceParams['strProc'] = "PriceMenu_GetsAll";
    return this.post(params.apiUrl + '/CommonQuery/fnGetDataReportNew', ServiceParams)

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

