import { Component, OnInit } from "@angular/core";
import { ExcelService } from "../../services/excel-service";
import { Router } from "@angular/router";
import { EventsService } from "../../services/events.service";
import { map } from "rxjs/operators";

@Component({
  selector: "app-events",
  templateUrl: "./events.component.html",
  styleUrls: ["./events.component.css"]
})
export class EventsComponent implements OnInit {
  events: any;

  constructor(
    private excelService: ExcelService,
    private router: Router,
    private svc: EventsService
  ) {}

  ngOnInit() {
    this.svc
      .getAllEvents()
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      )
      .subscribe(events => {
        this.events = events;
        this.events.sort((n1, n2) => {
          if (n1.eventDatetime < n2.eventDatetime) {
            return 1;
          }
          if (n1.eventDatetime > n2.eventDatetime) {
            return -1;
          }
          return 0;
        });
      });
  }

  exportToExcel() {
    this.excelService.exportAsExcelFile(this.events, "door-events");
  }

  back() {
    this.router.navigate(["/"]);
  }
}
