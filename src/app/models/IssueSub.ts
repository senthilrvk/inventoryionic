export class IssueSub {
     IssueSubQty: number;
    IssueSubActualRate: number;
    IssueSubProdDisAmt: number;
    IssueSubSGSTTaxAmount: number;
    IssueSubCGSTTaxAmount: number;
    IssueSubIGSTTaxAmount: number;
    IssueSubSGSTAmount: number;
    IssueSubCGSTTaxPers: number;
    IssueSubCGSTAmount: number;
    IssueSubIGSTTaxPers: number;
    IssueSubIGSTAmount: number;
    IssueSubCessAmt: number;
    IssueSubMrp: number;
    public  ItemDesc: string;
    HSNCode: string;
    IssueSubTaxPers: number;
    IssueSubFreeQty: number;
    IssueSubAmount: number;

    public setName(IssueSubQty, IssueSubActualRate, IssueSubProdDisAmt, IssueSubSGSTTaxAmount,
                   IssueSubCGSTTaxAmount, IssueSubIGSTTaxAmount, IssueSubSGSTAmount, IssueSubCGSTTaxPers, IssueSubCGSTAmount, IssueSubIGSTTaxPers, IssueSubIGSTAmount, IssueSubCessAmt, IssueSubMrp, ItemDesc, HSNCode, IssueSubTaxPers, IssueSubFreeQty, IssueSubAmount)  {
        this.IssueSubQty          = IssueSubQty;
        this.IssueSubActualRate   = IssueSubActualRate;
        this.IssueSubProdDisAmt = IssueSubProdDisAmt;
        this.IssueSubSGSTTaxAmount  = IssueSubSGSTTaxAmount;
        this.IssueSubCGSTTaxAmount  =  IssueSubCGSTTaxAmount;
        this.IssueSubIGSTTaxAmount  =  IssueSubIGSTTaxAmount;
        this.IssueSubSGSTAmount     = IssueSubSGSTAmount;
        this.IssueSubCGSTTaxPers    = IssueSubCGSTTaxPers;
        this.IssueSubCGSTAmount     = IssueSubCGSTAmount;
        this.IssueSubIGSTTaxPers    = IssueSubIGSTTaxPers;
        this.IssueSubIGSTAmount     = IssueSubIGSTAmount;
        this.IssueSubCessAmt        = IssueSubCessAmt;
        this.IssueSubMrp            = IssueSubMrp;
        this.ItemDesc               = ItemDesc;
        this.HSNCode                = HSNCode;
        this.IssueSubTaxPers        = IssueSubTaxPers;
        this.IssueSubFreeQty        = IssueSubFreeQty;
        this.IssueSubAmount         = IssueSubAmount;
     }
  }
