import { Component, OnInit } from "@angular/core";
import { ExcelService } from "../../services/excel-service";

@Component({
  selector: "app-events",
  templateUrl: "./events.component.html",
  styleUrls: ["./events.component.css"]
})
export class EventsComponent implements OnInit {
  messages: any = [
    {
      from: "Kenneth",
      subject: "Hello",
      content: "Hihu"
    }
  ];

  data: any = [
    {
      eid: "e101",
      ename: "ravi",
      esal: 1000
    },
    {
      eid: "e102",
      ename: "ram",
      esal: 2000
    },
    {
      eid: "e103",
      ename: "rajesh",
      esal: 3000
    }
  ];

  constructor(private excelService: ExcelService) {}

  ngOnInit() {}

  exportToExcel() {
    this.excelService.exportAsExcelFile(this.data, "sample");
  }
}
