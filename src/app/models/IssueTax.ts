export class IssueTax {
    IssueTaxId: number;
    TaxId: number;
    TaxAmount: number;
    Amount: number;
    SGSTTaxPers: number;
    SGSTTaxAmount: number;
    SGSTAmount: number;
    CGSTTaxPers: number;
    CGSTTaxAmount: number;
    CGSTAmount: number;
    IGSTTaxPers: number;
    IGSTTaxAmount: number;
    IGSTAmount: number;
    CessAmt: number;

    public setTax(IssueTaxId, TaxId, TaxAmount, Amount, SGSTTaxPers, SGSTTaxAmount,
                  SGSTAmount, CGSTTaxPers, CGSTTaxAmount, CGSTAmount, IGSTTaxPers, IGSTTaxAmount, IGSTAmount, CessAmt) {
                    this.IssueTaxId = IssueTaxId;
                    this.TaxId      = TaxId;
                    this.TaxAmount = TaxAmount;
                    this.Amount = Amount;
                    this.SGSTTaxPers = SGSTTaxPers;
                    this.SGSTTaxAmount = SGSTTaxAmount;
                    this.SGSTAmount = SGSTAmount;
                    this.CGSTTaxPers = CGSTTaxPers;
                    this.CGSTTaxAmount = CGSTTaxAmount;
                    this.CGSTAmount = CGSTAmount;
                    this.IGSTTaxPers = IGSTTaxPers;
                    this.IGSTTaxAmount = IGSTTaxAmount;
                    this.IGSTAmount = IGSTAmount;
                    this.CessAmt = CessAmt;
        }
}
