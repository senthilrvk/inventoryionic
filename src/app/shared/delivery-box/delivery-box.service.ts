import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppService } from 'src/app/app.service';


@Injectable({
  providedIn: 'root'
})
export class DeliveryBoxService {


  constructor(private api: AppService) {
   
  }

  onDeliveryPickupGets(salesmanid, branchId,condition,fromDate, toDate, apiUrl): Observable<any> {
    let ServiceParams = { strProc: '', JsonFileName: '' };
    ServiceParams.strProc = 'IssueDeliveryDetails_PendingListOnSalesmanId';
    ServiceParams.JsonFileName = 'JsonArrayScriptTen';

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "@ParamsBranchId";
    ProcParams["strArgmt"] = String(branchId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsSalesmanId";
    ProcParams["strArgmt"] = String(salesmanid);
    oProcParams.push(ProcParams);
    
    ProcParams = {};
    ProcParams["strKey"] = "@ParamsCondition";
    ProcParams["strArgmt"] = String(condition); // Take Completed
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsFromDate";
    ProcParams["strArgmt"] = String(fromDate); 
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsToDate";
    ProcParams["strArgmt"] = String(toDate); 
    oProcParams.push(ProcParams);

    ServiceParams['oProcParams'] = oProcParams;

    const body = JSON.stringify(ServiceParams);
  
    return this.api.fnApiPost(`${apiUrl}/CommonQuery/fnGetDataReportFromScriptJsonFile`, body);
  }

  onPickedDelivery(branchId, billserId, issueNo, uniqueBillno,takeDate,takeTime, apiUrl):Observable<any> {
    let ServiceParams = { strProc: '', JsonFileName: '' };
    ServiceParams.strProc = 'IssueDeliveryDetails_UpdateIsTake';
    ServiceParams.JsonFileName = 'JsonArrayScriptTen';

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "@ParamsBranchId";
    ProcParams["strArgmt"] = String(branchId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsBillSerId";
    ProcParams["strArgmt"] = String(billserId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsIssueSlNo";
    ProcParams["strArgmt"] = String(issueNo);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsUniqueBillNo";
    ProcParams["strArgmt"] = String(uniqueBillno);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsTakeDate";
    ProcParams["strArgmt"] = String(takeDate);
    oProcParams.push(ProcParams);


    ProcParams = {};
    ProcParams["strKey"] = "@ParamsTakeTime";
    ProcParams["strArgmt"] = String(takeTime);
    oProcParams.push(ProcParams);


    ServiceParams['oProcParams'] = oProcParams;

    const body = JSON.stringify(ServiceParams);
  
    return this.api.fnApiPost(`${apiUrl}/CommonQuery/fnGetDataReportFromScriptJsonFile`, body);
  }

  onDeliveryComplete(branchId,billserId,issueSlno,billNo,reciveDate,reciveTime, apiUrl) {
    let ServiceParams = { strProc: '', JsonFileName: '' };
    ServiceParams.strProc = 'IssueDeliveryDetails_UpdateReceive';
    ServiceParams.JsonFileName = 'JsonArrayScriptTen';

    let oProcParams = [];

    let ProcParams = {};
    ProcParams["strKey"] = "@ParamsBranchId";
    ProcParams["strArgmt"] = String(branchId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsBillSerId";
    ProcParams["strArgmt"] = String(billserId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsIssueSlNo";
    ProcParams["strArgmt"] = String(issueSlno);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsUniqueBillNo";
    ProcParams["strArgmt"] = String(billNo);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsReceiveDate";
    ProcParams["strArgmt"] = String(reciveDate);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "@ParamsReceiveTime";
    ProcParams["strArgmt"] = String(reciveTime);
    oProcParams.push(ProcParams);

    ServiceParams['oProcParams'] = oProcParams;

    const body = JSON.stringify(ServiceParams);
  
    return this.api.fnApiPost(`${apiUrl}/CommonQuery/fnGetDataReportFromScriptJsonFile`, body);
  }
}
