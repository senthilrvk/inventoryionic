import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  Observable, of } from 'rxjs';
import { catchError,  shareReplay } from 'rxjs/operators';
import { delayedRetry } from '../core/guards/delayed-request';

const httpsOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'charset=utf-8'
  })
};

@Injectable({
  providedIn: 'root'
})
export class SalesPageService {

  constructor(public https: HttpClient) { }

  onSettings(url): Observable<any> {
    const dictArgmts = { ProcName: 'Settings_GetValues' };
    const body = JSON.stringify(dictArgmts);
    return this.post(url + '/Master/fnSettings', body)
  }

  onBranchSettings(branchId, url): Observable<any> {
    let strQuery = " select * from BranchSetting where BranchId = " + String(branchId);

    let objDictionary = { strQuery: strQuery };
    let body = JSON.stringify(objDictionary)
    return this.post(url + '/CommonQuery/fnGetDataReportFromQuery', body)
  }

  onBillGets(varArguements, url): Observable<any> {

    const DictionaryObject = {};
    DictionaryObject['dictArgmts'] = varArguements;
    DictionaryObject['ProcName'] = 'Issue_Gets';

    const body = JSON.stringify(DictionaryObject);

    return this.post(url + '/Sales/Sales_Gets', body);
  }

  onInvoiceCtrlOrder(type: string,branchId, url:string): Observable<any> {

    let varParams = {};
    varParams = { ControlType: type, BranchId: branchId };
    const DictionaryObject = { dictArgmts: {}, ProcName: '' };
    DictionaryObject.dictArgmts = varParams;
    DictionaryObject.ProcName = 'ControlOrder_GetOnType';
    const body = JSON.stringify(DictionaryObject);
    return this.post(url + '/Purchase/fnGetControlOrder', body)

  }

  onGetUserPrevilage(url, staffId): Observable<any> {
    const dictArgmts = { StaffId: staffId };
    const DictionaryObject = { dictArgmts: {}, ProcName: '' };
    DictionaryObject.dictArgmts = dictArgmts;
    DictionaryObject.ProcName = 'UserPrevilage_GetOnStaffId';
    const body = JSON.stringify(DictionaryObject);
    return this.post(url + '/SoftwareSettings/fnGetUserPrevilage_OnStaffId', body);
  }
  onProductCodeGet(keyword, acId, branchId, billSerId, url): Observable<any> {
    const ServiceParams = { strProc: '', oProcParams: [] };
    ServiceParams.strProc = 'Product_SearchSalesForBillingItemCode';

    const oProcParams = [];

    let ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'strItemDesc';
    ProcParams.strArgmt = keyword;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'AcId';
    ProcParams.strArgmt = String(acId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'BranchId';
    ProcParams.strArgmt = String(branchId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'BillSerId';
    ProcParams.strArgmt = String(billSerId);
    oProcParams.push(ProcParams);
    ServiceParams.oProcParams = oProcParams;

    const body = JSON.stringify(ServiceParams);

    return this.post(url + '/CommonQuery/fnGetDataReportNew', body)
  }

  onBillSeriesGets(acId, branchId, url): Observable<any> {

    const ServiceParams = { strProc: '', oProcParams: [] };
    ServiceParams.strProc = 'BillSeries_GetsStaffwiseNewlocalSeries';

    const oProcParams = [];
    let ProcParams = { strKey: '', strArgmt: '' };

    ProcParams.strKey = 'StaffId';
    ProcParams.strArgmt = String(acId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'BranchId';
    ProcParams.strArgmt = String(branchId);
    oProcParams.push(ProcParams);

    ServiceParams.oProcParams = oProcParams;
    const body = JSON.stringify(ServiceParams);

    return this.post(url + '/CommonQuery/fnGetDataReportBranchStaff', body)

  }


  onGetMaxBillNo(seriesSelected, branchId, url): Observable<any> {

    const dictArgmts = { BillSerId: parseFloat(seriesSelected || 0), BranchId: String(branchId) };
    const DictionaryObject = { dictArgmts: {}, ProcName: '' };
    DictionaryObject.dictArgmts = dictArgmts;
    DictionaryObject.ProcName = 'BillSeries_GetMaxBillNo';
    const body = JSON.stringify(DictionaryObject);

    return this.post(url + '/Master/BillSeries_GetMaxBillNo', body)

  }

  onBillSeriesSalesInclusiveSet(billSerId, url): Observable<any> {

    const ServiceParams = { strProc: '', oProcParams: [] };
    ServiceParams.strProc = 'BillSeriesInclusiveSalesSettings';
    const oProcParams = [];
    const ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'BillSerId';
    ProcParams.strArgmt = String(billSerId);
    oProcParams.push(ProcParams);
    ServiceParams.oProcParams = oProcParams;

    const body = JSON.stringify(ServiceParams);

    return this.post(url + '/CommonQuery/fnGetDataReportNew', body)
  }

  onPriceMenuGets(url): Observable<any> {
    const ServiceParams = { strProc: '' };
    ServiceParams.strProc = 'PriceMenu_Gets';
    const body = JSON.stringify(ServiceParams);
    return this.post(url + '/CommonQuery/fnGetData', body)
  }

  onPayTermsGets(billSerId, url): Observable<any> {

    let ServiceParams = {};
    ServiceParams['strProc'] = "PayTermsBillSeriesLink_GetsOnBillSerId";

    let oProcParams = [];
    let ProcParams = {};

    ProcParams["strKey"] = "BillSerId";
    ProcParams["strArgmt"] = String(billSerId);
    oProcParams.push(ProcParams);
    ServiceParams['oProcParams'] = oProcParams;
    const body = JSON.stringify(ServiceParams);    
    return this.post(url + '/CommonQuery/fnGetData', body)
  }

  onSalesManGets(branchId, url): Observable<any> {
    const ServiceParams = { strProc: '', oProcParams: [] };
    ServiceParams.strProc = 'SalesExecutive_GetsNew';

    const oProcParams = [];

    let ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'SalesExe_Name';
    ProcParams.strArgmt = '';
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'BranchId';
    ProcParams.strArgmt = String(branchId);
    oProcParams.push(ProcParams);
    ServiceParams.oProcParams = oProcParams;

    const body = JSON.stringify(ServiceParams);
    return this.post(url + '/CommonQuery/fnGetDataReportNew', body)
  }


  onSalesMan(keyword: string, branchId,salesId, url) {
    
    const ServiceParams = { strProc: "", oProcParams: [] };

    ServiceParams.strProc = "AcccountHead_GetsForReportOnSalesman";

    const oProcParams = [];

    let ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "Ac_Name";
    ProcParams.strArgmt = keyword;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "Type";
    ProcParams.strArgmt = "Customer";
    oProcParams.push(ProcParams);

    ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "BranchId";
    ProcParams.strArgmt = String(branchId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: "", strArgmt: "" };
    ProcParams.strKey = "SalesmanId";
    ProcParams.strArgmt = String(salesId);
    oProcParams.push(ProcParams);

    ServiceParams.oProcParams = oProcParams;
    const body = JSON.stringify(ServiceParams);
    return this.post(url + '/CommonQuery/fnGetDataReportNew', body);
  }

  onVoucherCustomer(keyword: string, branchId, url) {
    
    const ServiceParams = { strProc: '', oProcParams: {} };
    ServiceParams.strProc = 'AccountHead_SearchForAccountReceipt';

    const oProcParams = [];

    let ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'AC_Name';
    ProcParams.strArgmt = keyword;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'BranchId';
    ProcParams.strArgmt = String(branchId);
    oProcParams.push(ProcParams);
    ServiceParams.oProcParams = oProcParams;
    const body = JSON.stringify(ServiceParams);
    
    return this.post(url + '/CommonQuery/fnGetDataReportNew', body)
    
  }
  
    
  onCustomerGets(Search, billSeriesSelected, branchId, url): Observable<any> {
    const ServiceParams = { strProc: '', oProcParams: [] };
    ServiceParams.strProc = 'AccountHead_SearchForSalesFilter';
    ServiceParams['JsonFileName'] = 'JsonArrayScriptTen';
    const oProcParams = [];

    let ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsAC_Name';
    ProcParams.strArgmt = Search;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsBranchId';
    ProcParams.strArgmt = String(branchId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = '@ParamsBillSerId';
    ProcParams.strArgmt = String(billSeriesSelected);
    oProcParams.push(ProcParams);


    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams["strKey"] = "@ParamsAreaId";
    ProcParams["strArgmt"] = String('0');
    oProcParams.push(ProcParams);

    ServiceParams.oProcParams = oProcParams;
    const body = JSON.stringify(ServiceParams);
    
    return this.post(url + '/CommonQuery/fnGetDataReportFromScriptJsonFile', body)

  }

 
  onGetSalesValueForTCS(acId, branchId, billNo, billSerId, uniqeuNo, url): Observable<any> {

    let ServiceParams = {};
    ServiceParams['strProc'] = "IssueSalesValueGetForTCSAmt";
    ServiceParams['JsonFileName'] = 'JsonArrayScriptSix';
    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "@ParamsAcId";
    ProcParams["strArgmt"] = String(acId);
    oProcParams.push(ProcParams);


    ProcParams = {};
    ProcParams["strKey"] = "@ParamsBranchId";
    ProcParams["strArgmt"] = String(branchId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsIssueSlNo";
    ProcParams["strArgmt"] = String(billNo);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsBillSerId";
    ProcParams["strArgmt"] = String(billSerId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsUniqueBillNo";
    ProcParams["strArgmt"] = String(uniqeuNo);
    oProcParams.push(ProcParams);

    ServiceParams['oProcParams'] = oProcParams;
    const body = JSON.stringify(ServiceParams); 
    return this.post(url + '/CommonQuery/fnGetDataReportFromScriptJsonFile', body)
  }

  onGetLeadgerAmtOnAcId(acId, branchId, url): Observable<any> {
    let ServiceParams = {};
    ServiceParams['strProc'] = "LeadgerAmtGetOnAcId";

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "AcId";
    ProcParams["strArgmt"] = String(acId);
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(branchId);
    oProcParams.push(ProcParams)
    ServiceParams['oProcParams'] = oProcParams;
    let body = JSON.stringify(ServiceParams);

    return this.post(url + '/CommonQuery/fnGetDataReportNew', body)
  }

  onBillSeriesgetCustmerBillSeriesLink(AcId, dBranchId, url): Observable<any> {

    let ServiceParams = {};
    ServiceParams['strProc'] = "BillseriesCustomerLink_BillSeriesGetOnAcId";
    ServiceParams['JsonFileName'] = 'JsonArrayScriptFour';
    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "@ParamsAcId";
    ProcParams["strArgmt"] = AcId;
    oProcParams.push(ProcParams);


    ProcParams = {};
    ProcParams["strKey"] = "@ParamsBranchId";
    ProcParams["strArgmt"] = dBranchId;
    oProcParams.push(ProcParams);

    ServiceParams['oProcParams'] = oProcParams;
    const body = JSON.stringify(ServiceParams)
    return this.post(url + '/CommonQuery/fnGetDataReportFromScriptJsonFile', body)
  }

  fnProductGets(val, search, acId, branchId, billSeriesSelected, godownId, url): Observable<any> {

    const ServiceParams = { strProc: '', oProcParams: [] };

    if (val == 'godown')
      ServiceParams.strProc = 'Product_SearchSalesForBillingGodownwise';
    else
      ServiceParams.strProc = 'Product_SearchSalesForBilling';

    const oProcParams = [];

    let ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'strItemDesc';
    ProcParams.strArgmt = search;
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'AcId';
    ProcParams.strArgmt = String(acId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'BranchId';
    ProcParams.strArgmt = String(branchId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'BillSerId';
    ProcParams.strArgmt = String(billSeriesSelected);
    oProcParams.push(ProcParams);

    if (val == 'godown') {
      ProcParams = { strKey: '', strArgmt: '' };
      ProcParams.strKey = 'GodownId';
      ProcParams.strArgmt = String(godownId);
      oProcParams.push(ProcParams);
    }

    ServiceParams.oProcParams = oProcParams;
    const body = JSON.stringify(ServiceParams);
    return this.post(url + '/CommonQuery/fnGetDataReportNew', body)
  }

  onProductKeyDown(nProductId, branchId, url): Observable<any> {

    let strControllerPath = '';
    let varArguements = {};

    const DictionaryObject = { dictArgmts: {}, ProcName: '' };

    varArguements = {
      ProductId: nProductId, BranchId: branchId
    };

    DictionaryObject.dictArgmts = varArguements;
    DictionaryObject.ProcName = 'Store_GetsOnProdIdBranchId';
    strControllerPath = 'fnStoreDetailsOnProductId';

    const body = JSON.stringify(DictionaryObject);
    return this.post(url + '/Sales/' + strControllerPath, body)
  }

  onGodownProductKeyDown(nProductId, godownId, branchId, url): Observable<any> {

    let varArguements = {};
    varArguements = {
      ProductId: nProductId, GodownId: godownId, BranchId: String(branchId)
    };

    var DictionaryObject = {};
    DictionaryObject["dictArgmts"] = varArguements;
    DictionaryObject["ProcName"] = 'Store_GetsOnProdIdBranchIdGodownwise';

    const body = JSON.stringify(DictionaryObject);
    return this.post(url + '/Sales/fnStoreDetailsOnProductIdGodownwise', body)
  }

  addInventry(val, efreeQty, nProductId, branchId, BatchNo, godownId, url): Observable<any> {
    const ServiceParams = { strProc: '', oProcParams: [] };
    if (val == 'godown')
      ServiceParams.strProc = 'store_gettaxdetailsonProdidBatchNoGodownwise';
    else
      ServiceParams.strProc = 'store_gettaxdetailsonProdidBatchNo';

    const oProcParams = [];
    let ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'Qty';
    ProcParams.strArgmt = String(efreeQty);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'ProductId';
    ProcParams.strArgmt = String(nProductId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'BranchId';
    ProcParams.strArgmt = String(branchId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'BatchNo';
    ProcParams.strArgmt = String(BatchNo);
    oProcParams.push(ProcParams);
    if (val == 'godown') {

      ProcParams = { strKey: '', strArgmt: '' };
      ProcParams.strKey = 'GodownId';
      ProcParams.strArgmt = String(godownId);
      oProcParams.push(ProcParams);
    }

    ServiceParams.oProcParams = oProcParams;
    const body = JSON.stringify(ServiceParams);

    return this.post(url + '/CommonQuery/fnGetDataReportNew', body)
  }

  onTaxGets(url): Observable<any> {

    const ProcName = { ProcName: 'Tax_Gets' };
    const body = JSON.stringify(ProcName);
    return this.post(url + '/Master/TaxGets', body)

  }

  onAnchorClick(varArguements, url): Observable<any> {
    const DictionaryObject = { dictArgmts: {} };
    DictionaryObject.dictArgmts = varArguements;

    const body = JSON.stringify(DictionaryObject);
    return this.post(url + '/Sales/Sales_Copy', body)
  }

  onBillwiseOutstandingOnAcId(acId, branchId, url): Observable<any> {

    let ServiceParams = {};

    ServiceParams['strProc'] = 'OutstandingSupplier_GetOnAcId';

    let oProcParams = [];
    let ProcParams = {};
    ProcParams['strKey'] = 'AC_Id';
    ProcParams['strArgmt'] = String(acId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'BranchId';
    ProcParams['strArgmt'] = String(branchId);
    oProcParams.push(ProcParams);

    ServiceParams['oProcParams'] = oProcParams;
    let body = JSON.stringify(ServiceParams);
    return this.post(url + '/CommonQuery/fnGetDataReportNew', body)
  }

  onBracodeWgt(dTempBatchNo, branchId, url): Observable<any> {
    var ServiceParams = {};
    ServiceParams['strProc'] = "Product_SearchPurchaseOnItemCodeOnEnter";

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "strItemDesc";
    ProcParams["strArgmt"] = String(dTempBatchNo);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(branchId);
    oProcParams.push(ProcParams);
    ServiceParams['oProcParams'] = oProcParams;
    const body = JSON.stringify(ServiceParams); 
    return this.post(url + '/CommonQuery/fnGetDataReportNew', body);
  }


  getBarcode(nBatchNo, branchId, url): Observable<any> {
    var ServiceParams = {};
    ServiceParams['strProc'] = "store_gettaxdetailsonBatchNo";

    var oProcParams = [];
    var ProcParams = {};

    ProcParams["strKey"] = "BatchSlNo";
    ProcParams["strArgmt"] = String(nBatchNo);
    oProcParams.push(ProcParams)

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(branchId);
    oProcParams.push(ProcParams)
    ServiceParams['oProcParams'] = oProcParams;
    const body = JSON.stringify(ServiceParams); 
    return this.post(url + '/CommonQuery/fnGetDataReportNew', body);
  }

  onPricemenuRate(MenuPrice, product) {

    if (MenuPrice == 3) // "MRP"
      return parseFloat(product.Store_MRP || 0);
    else if (MenuPrice == 2)//"W MRP"
      return parseFloat(product.Store_DisributRate || 0);
    else if (MenuPrice == 4) //"spRate1"
      return parseFloat(product.SpRate1 || 0);
    else if (MenuPrice == 5) //spdate2
      return parseFloat(product.SpRate2 || 0);
    else if (MenuPrice == 6) //spdate3
      return parseFloat(product.SpRate3 || 0);
    else if (MenuPrice == 7) //spdate4
      return parseFloat(product.SpRate4 || 0);
    else if (MenuPrice == 8) //spdate5
      return parseFloat(product.SpRate5 || 0);
    else
      return parseFloat(product.Store_SellRate || 0);
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

