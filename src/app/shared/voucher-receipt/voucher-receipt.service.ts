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
export class VoucherReceiptService {

  constructor(public https: HttpClient) { }


  onSalesManGet(branchId, url): Observable<any> {

      const ServiceParams = { strProc: '', oProcParams: {} };
      ServiceParams.strProc = 'SalesExecutive_GetsNew';
  
      const oProcParams = [];
  
      let ProcParams = {};
      ProcParams['strKey'] = 'SalesExe_Name';
      ProcParams['strArgmt'] = '';
      oProcParams.push(ProcParams);
  
      ProcParams = {};
      ProcParams['strKey'] = 'BranchId';
      ProcParams['strArgmt'] = String(branchId);
      oProcParams.push(ProcParams);
  
      ServiceParams.oProcParams = oProcParams;
  
      const body = JSON.stringify(ServiceParams);
      return this.post(url + '/CommonQuery/fnGetDataReportNew', body)
  }

  onOutStanding(acId, nVoucherId, branchId, url): Observable<any> {
    let varArguements = {};
    varArguements = { AcId: acId, VoucherPrefixId: nVoucherId, BranchId: branchId };
    const DictionaryObject = { dictArgmts: {}, ProcName: '' };
    DictionaryObject.dictArgmts = varArguements;
    DictionaryObject.ProcName = 'Outstanding_Get';
    const body = JSON.stringify(DictionaryObject);
    return this.post(url + '/Accounts/fnOutstanding', body)
  }

  onBankAccGets(search, branchId, url): Observable<any> {
    const ServiceParams = { strProc: '', oProcParams: {} };
      ServiceParams.strProc = 'AccountHead_GetBanksNew';

      const oProcParams = [];

      let ProcParams = { strKey: '', strArgmt: '' };
      ProcParams.strKey = 'Search';
      ProcParams.strArgmt = search;
      oProcParams.push(ProcParams);

      ProcParams = { strKey: '', strArgmt: '' };
      ProcParams.strKey = 'BranchId';
      ProcParams.strArgmt = String(branchId);
      oProcParams.push(ProcParams);
      ServiceParams.oProcParams = oProcParams;
      const body = JSON.stringify(ServiceParams);
      return this.post(url + '/CommonQuery/fnGetDataReportNew', body)
  }

  onNextVoucherNumber(value,branchId, url): Observable<any> {
    var ServiceParams = {};
    ServiceParams['strProc'] = "VoucherPrefix_GetVoucherNoOnVoucherId";

    let oProcParams = [];
    let ProcParams = {};
    ProcParams["strKey"] = "Value";
    ProcParams["strArgmt"] = String(value);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams["strKey"] = "BranchId";
    ProcParams["strArgmt"] = String(branchId);
    oProcParams.push(ProcParams);
    ServiceParams['oProcParams'] = oProcParams;

    const body = JSON.stringify(ServiceParams);

    return this.post(url + '/CommonQuery/fnGetDataReportNew', body)
  }

  onLedgerAcId(acId, branchId, url): Observable<any> {
    const ServiceParams = { strProc: '', oProcParams: {} };
    ServiceParams.strProc = 'GetLeaderAmtOnAcId';
    const oProcParams = [];

    let ProcParams = {};
    ProcParams['strKey'] = 'BranchId';
    ProcParams['strArgmt'] = String(branchId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'AcId';
    ProcParams['strArgmt'] = String(acId);
    oProcParams.push(ProcParams);
    ServiceParams.oProcParams = oProcParams;

    const body = JSON.stringify(ServiceParams);
    return this.post(url + '/CommonQuery/fnGetDataReportNew', body);
  }
  onCheckRepotest(chequeNo,voucherNo, voucherId, branchId, url): Observable<any> {
    const ServiceParams = { strProc: '', oProcParams: {} };
    ServiceParams.strProc = 'ChequeNoExistsCheck';

    const oProcParams = [];

    let ProcParams = {};
    ProcParams['strKey'] = 'ChequeNo';
    ProcParams['strArgmt'] = chequeNo;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'Voucher_VoucherNo';
    ProcParams['strArgmt'] = voucherNo;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'UniqueVoucherId';
    ProcParams['strArgmt'] = voucherId;
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'BranchId';
    ProcParams['strArgmt'] = String(branchId);
    oProcParams.push(ProcParams);
    ServiceParams.oProcParams = oProcParams;

    // tslint:disable-next-line:no-shadowed-variable
    const body = JSON.stringify(ServiceParams);
    return this.savepost(url + '/CommonQuery/fnGetDataReportNew', body)
  }
  
  onVoucherGets(keyword, dPrefixId, searchCondition, isFromdate,isTodate, branchId, url): Observable<any> {
    const strQuerys = 'DECLARE @BranchId          VARCHAR(10)     ' +
      '\n DECLARE @FromDate          VARCHAR(10)       ' +
      '\n DECLARE @ToDate            VARCHAR(10)  ' +
      '\n DECLARE @search            VARCHAR(300)  ' +
      '\n DECLARE @VoucherPrefixId   VARCHAR(10)   ' +
      '\n DECLARE @DateCondition     VARCHAR(30)   ' +
      '\n set @BranchId=   @@@' + branchId + '@@@    ' +
      '\n set @FromDate=   @@@' + isFromdate + '@@@    ' +
      '\n set @ToDate =  @@@' + isTodate + '@@@    ' +
      '\n set @search= @@@' + keyword + '@@@ ' +
      '\n set @VoucherPrefixId = ' + dPrefixId + '   ' +
      '\n set @DateCondition  = @@@' + searchCondition + '@@@ ' +
      '\n if(@DateCondition  = @@@EnterDate@@@)' +
      '\n begin' +
      '\n  set @DateCondition = @@@EnterDate@@@' +
      '\n end' +
      '\n else' +
      '\n begin' +
      '\n   set @DateCondition = @@@Voucher_Date@@@  ' +
      '\n end' +
      '\n DECLARE @dbPrefix as VARCHAR(100) ' +
      '\n DECLARE @nFromMonth as VARCHAR(5)  ' +
      '\n DECLARE @nToMonth as VARCHAR(5)     ' +
      '\n DECLARE @nFromYear as VARCHAR(5)  ' +
      '\n DECLARE @nToYear as VARCHAR(5)   ' +
      '\n declare @query as VARCHAR(max)   ' +
      '\n declare @QtyDecPlace varchar(10) ' +

      '\n select @QtyDecPlace =Value from Settings where KeyValue=@@@DecimalPlace@@@     ' +

      '\n SET     @nFromMonth=substring(@FromDate,6,2)   ' +
      '\n SET     @nToMonth=substring(@ToDate,6,2)   ' +
      '\n SET     @nFromYear=substring(@FromDate,1,4) ' +
      '\n SET     @nToYear=substring(@ToDate,1,4)    ' +
      '\n SELECT  @dbPrefix= Value from Settings where KeyValue=@@@dbname@@@' +

      '\n create table #tblStaff' +
      '\n (' +
      '\n StaffId  numeric(18,0),' +
      '\n EmployeeName  varchar(1200)' +

      '\n )                ' +

      '\n insert into #tblStaff(StaffId,EmployeeName) select AC_Id,AC_Name from AccountHead where StaffFlag=1  ' +
      '\n Create Table #tbl                ' +
      '\n (   ' +
      '\n UniqueId            numeric(18,0) identity(1,1) primary key,   ' +
      '\n VoucherNo             VARCHAR(40)     ,                ' +
      '\n VoucherDate           VARCHAR(20)     ,      ' +
      '\n AccountName           VARCHAR(1500)   ,' +
      '\n VoucherAmt            decimal(18,3)   ,   ' +
      '\n VoucherNo1            NUMERIC(18,0)   ,  ' +
      '\n VoucherDate1          datetime        ,  ' +
      '\n VoucherPrefixNo       NUMERIC(18,0)   ,  ' +
      '\n EmployeeName          varchar(300)     ,' +
      '\n UniqueVoucherId       numeric(18,0)    ,' +
      '\n Voucher_VoucherPrefix  varchar(100)    ,' +
      '\n Flag                   varchar(120),' +
      '\n Remarks               varchar(2000)	 ' +
      '\n )                 ' +

      '\n SET  @search  = ISNULL( @search,@@@@@@)   ' +
      '\n if(@search like @@@%[0-9]%@@@ and  @search<>@@@@@@ )  ' +
      '\n begin   ' +


      '\n set @query=@@@  insert into #tbl   ' +
      '\n SELECT  VoucherDetails.Voucher_VoucherPrefix+@@@@@@-@@@@@@+CONVERT(varchar(18),voucher_voucherno) VoucherNo,  ' +
      // tslint:disable-next-line: max-line-length
      '\n @@@@@@ @@@@@@+CONVERT(varchar(10), Voucher_Date,103) VoucherDate, AC_Name+@@@@@@,@@@@@@+isnull(addr1,@@@@@@@@@@@@) AccountName,' +
      '\n Voucher_Amt,Voucher_VoucherNo,Voucher_Date,VPrefix_No ,ISNULL(EmployeeName,@@@@@@@@@@@@) EmployeeName,' +
      '\n UniqueVoucherId,Voucher_VoucherPrefix,@@@@@@@@@@@@,isnull(Remarks,@@@@@@@@@@@@) Remarks FROM dbo.VoucherDetails    ' +
      '\n inner join dbo.AccountHead on VoucherDetails.AC_Id=AccountHead.AC_Id   ' +
      '\n left outer join #tblStaff on VoucherDetails.StaffId=#tblStaff.StaffId   ' +
      // tslint:disable-next-line: max-line-length
      '\n WHERE VoucherDetails.Field3=1 and VoucherDetails.BranchId=@@@@@@@@@+@BranchId+@@@@@@@@@       and VPrefix_No=@@@@@@@@@+@VoucherPrefixId+@@@@@@@@@ ' +
      '\n and ( CONVERT(varchar(18),voucher_voucherno)  like @@@@@@@@@+ @search+@@@%@@@@@@ ' +
      // tslint:disable-next-line: max-line-length
      '\n or CONVERT(varchar(18),isnull( Voucher_ChequeNo,@@@@@@@@@@@@))  like @@@@@@@@@+ @search+@@@%@@@@@@ or CONVERT(varchar(18),isnull( Remarks,@@@@@@@@@@@@))  like @@@@@@@@@+ @search+@@@%@@@@@@ ) and ' +
      '\n convert(datetime,@@@+@DateCondition+@@@,120) >=@@@@@@@@@+@FromDate+@@@@@@@@@ ' +
      '\n AND convert(datetime,@@@+@DateCondition+@@@,120) <=@@@@@@@@@+@ToDate +@@@@@@@@@  ' +
      '\n order by EnterDate desc, voucher_voucherno ASC@@@             ' +
      '\n exec(@query) ' +

      '\n set @query=@@@  insert into #tbl    ' +
      // tslint:disable-next-line: max-line-length
      '\n SELECT distinct EditVoucherDetails.Voucher_VoucherPrefix+@@@@@@-@@@@@@+CONVERT(varchar(18),voucher_voucherno) VoucherNo,  ' +
      // tslint:disable-next-line: max-line-length
      '\n @@@@@@ @@@@@@ VoucherDate, @@@@@@@@@@@@ AccountName, 0,Voucher_VoucherNo,null,VPrefix_No ,@@@@@@@@@@@@ EmployeeName,UniqueVoucherId,Voucher_VoucherPrefix,' +
      '\n @@@@@@Cancelled@#@#@VoucherDetail@@@@@@ ,isnull(Remarks,@@@@@@@@@@@@) Remarks FROM dbo.EditVoucherDetails     ' +
      '\n inner join dbo.AccountHead on EditVoucherDetails.AC_Id=AccountHead.AC_Id ' +
      '\n left outer join #tblStaff on EditVoucherDetails.StaffId=#tblStaff.StaffId   ' +
      '\n WHERE 	  UniqueVoucherId not in ' +
      // tslint:disable-next-line: max-line-length
      '\n ( select UniqueVoucherId from VoucherDetails where VPrefix_No=@@@@@@@@@+@VoucherPrefixId+@@@@@@@@@  and VoucherDetails.BranchId=@@@@@@@@@+@BranchId+@@@@@@@@@ ) and Voucher_VoucherNo not in ' +
      // tslint:disable-next-line: max-line-length
      '\n ( select Voucher_VoucherNo from VoucherDetails where VPrefix_No=@@@@@@@@@+@VoucherPrefixId+@@@@@@@@@ and VoucherDetails.BranchId=@@@@@@@@@+@BranchId+@@@@@@@@@ )  and ' +
      // tslint:disable-next-line: max-line-length
      '\n EditVoucherDetails.Field3=1 and EditVoucherDetails.BranchId=@@@@@@@@@+@BranchId+@@@@@@@@@       and VPrefix_No=@@@@@@@@@+@VoucherPrefixId+@@@@@@@@@       ' +
      '\n and ( CONVERT(varchar(18),voucher_voucherno)  like @@@@@@@@@+ @search+@@@%@@@@@@ ' +
      '\n or CONVERT(varchar(18),isnull( Voucher_ChequeNo,@@@@@@@@@@@@))  like @@@@@@@@@+ @search+@@@%@@@@@@ or CONVERT(varchar(18),isnull( Remarks,@@@@@@@@@@@@))  like @@@@@@@@@+ @search+@@@%@@@@@@ ) and   ' +
      '\n convert(datetime,@@@+@DateCondition+@@@,120) >=@@@@@@@@@+@FromDate+@@@@@@@@@   ' +
      '\n            AND convert(datetime,@@@+@DateCondition+@@@,120) <=@@@@@@@@@+@ToDate +@@@@@@@@@     ' +
      '\n order by voucher_voucherno ASC,Voucher_VoucherPrefix asc@@@' +

      '\n exec(@query) ' +

      '\n END' +
      '\n ELSE' +
      '\n BEGIN' +

      '\n set @query=@@@  insert into #tbl  ' +
      '\n  SELECT  VoucherDetails.Voucher_VoucherPrefix+@@@@@@-@@@@@@+CONVERT(varchar(18),voucher_voucherno) VoucherNo,' +
      '\n @@@@@@ @@@@@@+CONVERT(varchar(10), Voucher_Date,103) VoucherDate, AC_Name+@@@@@@,@@@@@@+isnull(addr1,@@@@@@@@@@@@) AccountName,    ' +
      '\n Voucher_Amt,Voucher_VoucherNo,Voucher_Date,VPrefix_No ,ISNULL(EmployeeName,@@@@@@@@@@@@) EmployeeName,UniqueVoucherId ' +
      '\n ,Voucher_VoucherPrefix,@@@@@@@@@@@@,isnull(Remarks,@@@@@@@@@@@@) Remarks  FROM dbo.VoucherDetails    ' +
      '\n inner join dbo.AccountHead on VoucherDetails.AC_Id=AccountHead.AC_Id   ' +
      '\n left outer join #tblStaff on VoucherDetails.StaffId=#tblStaff.StaffId ' +
      '\n WHERE VoucherDetails.Field3=1  and VoucherDetails.BranchId=@@@@@@@@@+@BranchId+@@@@@@@@@  and VPrefix_No=@@@@@@@@@+@VoucherPrefixId+@@@@@@@@@' +
      '\n and (AC_Name like @@@@@@@@@+@search+@@@%@@@@@@ or CONVERT(varchar(18),voucher_voucherno)  like @@@@@@@@@+ @search+@@@%@@@@@@' +
      '\n or CONVERT(varchar(18),isnull( Voucher_ChequeNo,@@@@@@@@@@@@))  like @@@@@@@@@+ @search+@@@%@@@@@@ or CONVERT(varchar(18),isnull( Remarks,@@@@@@@@@@@@))  like @@@@@@@@@+ @search+@@@%@@@@@@ ) and   ' +
      '\n convert(date,@@@+@DateCondition+@@@,120) >=@@@@@@@@@+@FromDate+@@@@@@@@@          ' +
      '\n AND convert(date,@@@+@DateCondition+@@@,120) <=@@@@@@@@@+@ToDate +@@@@@@@@@  ' +
      '\n order by EnterDate desc, voucher_voucherno desc,Voucher_VoucherPrefix asc  @@@   ' +
      '\n exec(@query)' +

      '\n set @query=@@@  insert into #tbl       ' +
      '\n SELECT distinct EditVoucherDetails.Voucher_VoucherPrefix+@@@@@@-@@@@@@+CONVERT(varchar(18),voucher_voucherno) VoucherNo,    ' +
      '\n @@@@@@ @@@@@@ VoucherDate, @@@@@@@@@@@@ AccountName,      ' +
      '\n 0,Voucher_VoucherNo,null,VPrefix_No ,@@@@@@@@@@@@ EmployeeName,UniqueVoucherId,Voucher_VoucherPrefix,' +
      '\n @@@@@@Cancelled@#@#@VoucherDetail@@@@@@,isnull(Remarks,@@@@@@@@@@@@) Remarks  FROM dbo.EditVoucherDetails     ' +
      '\n inner join dbo.AccountHead on EditVoucherDetails.AC_Id=AccountHead.AC_Id   ' +
      '\n left outer join #tblStaff on EditVoucherDetails.StaffId=#tblStaff.StaffId ' +
      '\n WHERE ' +
      '\n UniqueVoucherId not in' +
      '\n ( select UniqueVoucherId from VoucherDetails where VPrefix_No=@@@@@@@@@+@VoucherPrefixId+@@@@@@@@@  and VoucherDetails.BranchId=@@@@@@@@@+@BranchId+@@@@@@@@@) and Voucher_VoucherNo not in ' +
      '\n ( select Voucher_VoucherNo from VoucherDetails where VPrefix_No=@@@@@@@@@+@VoucherPrefixId+@@@@@@@@@  and VoucherDetails.BranchId=@@@@@@@@@+@BranchId+@@@@@@@@@) and ' +
      '\n EditVoucherDetails.Field3=1 and EditVoucherDetails.BranchId=@@@@@@@@@+@BranchId+@@@@@@@@@       and VPrefix_No=@@@@@@@@@+@VoucherPrefixId+@@@@@@@@@  ' +
      '\n and (AC_Name like @@@@@@@@@+@search+@@@%@@@@@@ or CONVERT(varchar(18),voucher_voucherno)  like @@@@@@@@@+ @search+@@@%@@@@@@ ' +
      '\n or CONVERT(varchar(18),isnull( Voucher_ChequeNo,@@@@@@@@@@@@))  like @@@@@@@@@+ @search+@@@%@@@@@@ or CONVERT(varchar(18),isnull( Remarks,@@@@@@@@@@@@))  like @@@@@@@@@+ @search+@@@%@@@@@@ ) and ' +
      '\n convert(datetime,@@@+@DateCondition+@@@,120) >=@@@@@@@@@+@FromDate+@@@@@@@@@       AND convert(datetime,@@@+@DateCondition+@@@,120) <=@@@@@@@@@+@ToDate +@@@@@@@@@ ' +
      '\n order by voucher_voucherno ASC,Voucher_VoucherPrefix asc@@@ ' +

      '\n exec(@query) ' +

      '\n END   ' +

      '\n UPDATE #TBL SET #TBL.VoucherDate=CONVERT(varchar(10) ,EditVoucherDetails.Voucher_Date,103) ,#tbl.VoucherDate1=EditVoucherDetails.Voucher_Date, ' +
      '\n AccountName=AccountHead.AC_Name+ @@@,@@@ +isnull(AccountHead.Addr1,@@@@@@),#tbl.VoucherAmt=EditVoucherDetails.Voucher_Amt, ' +
      '\n #TBL.EmployeeName=isnull( #tblStaff.EmployeeName,@@@@@@) ' +
      '\n  from #tbl  ' +
      '\n inner join EditVoucherDetails on #tbl.VoucherNo1=EditVoucherDetails.Voucher_VoucherNo ' +
      '\n inner join dbo.AccountHead on EditVoucherDetails.AC_Id=AccountHead.AC_Id   ' +
      '\n left outer join #tblStaff on EditVoucherDetails.StaffId=#tblStaff.StaffId  ' +
      '\n and #tbl.UniqueVoucherId=EditVoucherDetails.UniqueVoucherId where #tbl.Flag=@@@Cancelled@#@#@VoucherDetail@@@ and  EditVoucherDetails.Field3=1 ' +
      '\n and VPrefix_No=@VoucherPrefixId ' +
      '\n and EditVoucherDetails.BranchId=@BranchId ' +

      '\n update #tbl set VoucherAmt= convert(decimal(18,3),(-1))*VoucherAmt where VoucherAmt<0     ' +

      '\n if(@QtyDecPlace=@@@3@@@)  ' +
      '\n BEGIN     ' +
      '\n select  * from #tbl order by VoucherNo1   desc   ' +
      '\n END  ' +
      '\n ELSE  ' +
      '\n BEGIN  ' +
      '\n select  VoucherNo , VoucherDate , AccountName ,CONVERT(DECIMAL(18,2), VoucherAmt)   VoucherAmt,VoucherNo1, VoucherDate1 , VoucherPrefixNo,EmployeeName , ' +
      '\n UniqueVoucherId,Flag   ,Remarks  ' +
      '\n from #tbl order by VoucherNo1   desc    ' +
      '\n  END    ';

    const objDictionary = { strQuery: strQuerys };
    const body = JSON.stringify(objDictionary);
   
    return this.post(url +'/CommonQuery/fnGetDataReportFromQuery', body)
  }

  onAnchorGets(item, branchId, url): Observable<any> {
    let varArguements = {};
    varArguements = {
      VoucherNo: item.VoucherNo1,
      PrefixId: item.VoucherPrefixNo, UniqueVoucherId: item.UniqueVoucherId,
      BranchId: branchId
    };
    const DictionaryObject = { dictArgmts: {}, ProcName: '' };
    DictionaryObject.dictArgmts = varArguements;
    DictionaryObject.ProcName = 'AccountLogFile_Get';
    const body = JSON.stringify(DictionaryObject);
    return  this.post(url + '/Accounts/fnOutstandingPaidAmtForCopy', body)
  }

  onOutstandingFillForCopyNew(VoucherNo, PrefixId, UniqueVoucherId, acId, branchId, url): Observable<any> {

    const ServiceParams = { strProc: '', oProcParams: {} };
    ServiceParams.strProc = 'OutstandingBillGetForCopy';

    const oProcParams = [];
    let ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'ReceiveVoucherNo';
    ProcParams.strArgmt = String(VoucherNo);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'ReceiveVoucherPrifix';
    ProcParams.strArgmt = String(PrefixId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'BranchId';
    ProcParams.strArgmt = String(branchId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'AcId';
    ProcParams.strArgmt = String(acId);
    oProcParams.push(ProcParams);

    ProcParams = { strKey: '', strArgmt: '' };
    ProcParams.strKey = 'UniqueVoucherId';
    ProcParams.strArgmt = String(UniqueVoucherId);
    oProcParams.push(ProcParams);
    ServiceParams.oProcParams = oProcParams;

    const body = JSON.stringify(ServiceParams);

    return this.post(url + '/CommonQuery/fnGetDataReportNew', body)
  }

  onPrint(item, branchId, url): Observable<any> {
    let ServiceParams = {};
    ServiceParams['strProc'] = 'VoucherDetails_GetForPrint';

    let oProcParams = [];

    let ProcParams = {};
    ProcParams['strKey'] = 'ReceiveVoucherNo';
    ProcParams['strArgmt'] = String(item.VoucherNo1);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'ReceiveVoucherPrifix';
    ProcParams['strArgmt'] = String(item.VoucherPrefixNo);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'BranchId';
    ProcParams['strArgmt'] = String(branchId);
    oProcParams.push(ProcParams);

    ProcParams = {};
    ProcParams['strKey'] = 'UniqueVoucherId';
    ProcParams['strArgmt'] = String(item.UniqueVoucherId);
    oProcParams.push(ProcParams);

    ServiceParams['oProcParams'] = oProcParams;

    let body = JSON.stringify(ServiceParams);

    return this.post(url + '/CommonQuery/fnGetDataReportNew', body)
  }

  onBranchGet(branchId, url): Observable<any> {
    let ServiceParams = {};
    ServiceParams['strProc'] = 'Branch_Get';

    let oProcParams = [];
    let ProcParams = {};
    ProcParams['strKey'] = 'BranchId';
    ProcParams['strArgmt'] = String(branchId);
    oProcParams.push(ProcParams);

    ServiceParams['oProcParams'] = oProcParams;

    let body = JSON.stringify(ServiceParams);
    return this.post(url + '/CommonQuery/fnGetDataReportNew', body)
  }

  onVocherAmount(rcdAmt, url): Observable<any> {
    var ServiceParams = {};
    ServiceParams['strProc'] = 'fnNumToWords_GetValue';

    let oProcParams = [];
    let ProcParams = {};

    ProcParams['strKey'] = 'Value';
    ProcParams['strArgmt'] = String(rcdAmt);
    oProcParams.push(ProcParams);
    ServiceParams['oProcParams'] = oProcParams;

    let body = JSON.stringify(ServiceParams);

    return this.post(url + '/CommonQuery/fnGetDataReport', body)
  }
  
  onSendMsg(phoneNo, msg, staffId,branchId, url): Observable<any> {
    let MessageCounterInfo = {}
    MessageCounterInfo["MessageTo"] = phoneNo;
    MessageCounterInfo["Information"] = msg;
    MessageCounterInfo["StaffId"] = staffId;
    MessageCounterInfo["BranchId"] = branchId;
    return this.post(url + '/Common/SmsSent', MessageCounterInfo)
  }
  public post(url: string, body: any): Observable<any> {
    return this.https.post<any>(`${url}`, body, httpsOptions)
      .pipe(
        delayedRetry(2000, 2),
        catchError(this.handleError<any>('post')),
        shareReplay()
      )
  }

  public savepost(url: string, body: any): Observable<any> {
    return this.https.post<any>(`${url}`, body, httpsOptions)
      .pipe(
        catchError(this.handleError<any>('savepost')),
      )
  }

  


  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      return of(result as T);
    };
  }
}
