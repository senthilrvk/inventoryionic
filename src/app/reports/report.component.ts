import { Router } from "@angular/router";
import { Component, OnInit } from "@angular/core";
import { AppService } from "src/app/app.service";
import { ControlService } from "src/app/core/services/controlservice/control.service";

@Component({
  selector: "app-report",
  templateUrl: "./report.component.html",
  styleUrls: ["./report.component.scss"],
})
export class ReportComponent implements OnInit {
  isOrderLogin = false;
  menuShow = {
    salesRpt: false,
    StockReport: false,
    SalesmanWiseSale: false,
    salesOrderReport:false,
    StockandSale: false,
    AccountsReport: false,
    Leadger: false,
    GodownReport: false,
    GodownwiseStockAndSales: false,
  };
  
  constructor(private router: Router,private ctrlService: ControlService,
     private appService: AppService) {
    
    this.appService.menuItems.subscribe((res) => {
            
      res.forEach((ele) => {
        switch (ele.Menu_FormName) {
          case "SalesReport":
            this.menuShow.salesRpt = true;
            break;

          case "StockReport":
            this.menuShow.StockReport = true;
            break;

          case "AccountsReport":
            this.menuShow.AccountsReport = true;
            break;
          
          case "SalesOrderReport":
            this.menuShow.salesOrderReport = true;
            break;
          case "SalesmanProductwiseSales":
            this.menuShow.SalesmanWiseSale = true;
            break;
          case "StockAndSalesReport":
            this.menuShow.StockandSale = true;
            break;

          case "Leadger":
            this.menuShow.Leadger = true;
            break;
            case "GodownReport":
              this.menuShow.GodownReport = true;
              break;
              case "GodownwiseStockAndSales":
                this.menuShow.GodownwiseStockAndSales = true;
                break;

            
          default:
            break;
        }
      });
    });
    this.ctrlService.get('SessionSalesmanId').then((val) => {
      if (val) {
        this.isOrderLogin = true;;
      }
    });
  }

  ngOnInit() {}
  // /reports/report
  onReport(eve) {
    if (eve === "salesmanwise") {
      this.router.navigate(["reports/salesmanwisesales"]);
    } else if (eve === "stockandsales") {
      this.router.navigate(["reports/stockandsales"]);
    } else if (eve === "remarks") {
      this.router.navigate(["reports/customerremarks"]);
    } else if (eve === "ledger") {
      this.router.navigate(["reports/ledger"]);
    } else if (eve === "godownwiseStockAndSales") {
      this.router.navigate(["reports/godownwiseStockAndSales"]);
    } else if (eve === "salesOrderReport") {
      this.router.navigate(["reports/salesOrderReport"]);
    }
    
  }
}
