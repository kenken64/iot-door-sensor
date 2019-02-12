import { Component, OnInit, ViewChild } from "@angular/core";
import { ExcelService } from "../../services/excel-service";
import { Router } from "@angular/router";
import { EventsService } from "../../services/events.service";
import { map } from "rxjs/operators";
import * as _ from "lodash";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";

@Component({
  selector: "app-events",
  templateUrl: "./events.component.html",
  styleUrls: ["./events.component.css"]
})
export class EventsComponent implements OnInit {
  @ViewChild(InfiniteScrollDirective) infiniteScroll: InfiniteScrollDirective;
  events: any;
  batch = 200; // size of each query
  lastKey = ""; // key to offset next query from
  finished = false; // boolean when end of database is reached
  nextKey: any; // for next button
  prevKeys: any[] = []; // for prev button

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
    this.svc
      .getAllHistoricalEvents()
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      )
      .subscribe(events => {
        events.sort((n1, n2) => {
          if (n1.eventDatetime < n2.eventDatetime) {
            return 1;
          }
          if (n1.eventDatetime > n2.eventDatetime) {
            return -1;
          }
          return 0;
        });
        this.excelService.exportAsExcelFile(events, "door-events");
      });
  }

  back() {
    this.router.navigate(["/"]);
  }

  onScroll() {
    console.log("scrolled!!");
    console.log("this.nextKey!!" + this.nextKey);
    console.log("this.batch!!" + this.batch);

    this.svc
      .getAllEvents()
      .snapshotChanges()
      .pipe(
        map(changes => {
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }));
        })
      )
      .subscribe(events => {
        if (typeof events !== "undefined") {
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
        }
      });
    this.infiniteScroll.ngOnDestroy();
    this.infiniteScroll.setup();
  }
}