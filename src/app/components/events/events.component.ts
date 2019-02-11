import { Component, OnInit } from "@angular/core";
import { ExcelService } from "../../services/excel-service";
import { Router } from "@angular/router";
import { EventsService } from "../../services/events.service";
import { map } from "rxjs/operators";
import * as _ from 'lodash'

@Component({
  selector: "app-events",
  templateUrl: "./events.component.html",
  styleUrls: ["./events.component.css"]
})
export class EventsComponent implements OnInit {
  events: any;
  batch = 10         // size of each query
  lastKey = ''      // key to offset next query from
  finished = false  // boolean when end of database is reached
  nextKey: any; // for next button
  prevKeys: any[] = []; // for prev button

  constructor(
    private excelService: ExcelService,
    private router: Router,
    private svc: EventsService
  ) {}

  ngOnInit() {
    this.svc
      .getAllEvents(this.batch, this.lastKey)
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      )
      .subscribe(events => {
        this.events = _.slice(events, 0, this.batch);
        console.log(this.events);
        this.events.sort((n1, n2) => {
          if (n1.eventDatetime < n2.eventDatetime) {
            return 1;
          }
          if (n1.eventDatetime > n2.eventDatetime) {
            return -1;
          }
          return 0;
        });
        console.log(this.events[this.batch-1].key);
        this.nextKey =this.events[this.batch-1].key;
        console.log(this.nextKey);
      });
  }

  exportToExcel() {
    this.excelService.exportAsExcelFile(this.events, "door-events");
  }

  back() {
    this.router.navigate(["/"]);
  }

  toFeedback(){
    
  }

  onScroll() {
    console.log('scrolled!!');
    console.log('this.nextKey!!' + this.nextKey);
    console.log('this.batch!!' + this.batch);
    this.svc
      .getAllEvents(this.batch, this.nextKey)
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      )
      .subscribe(events => {
        let nextEvents = _.slice(events, 0, this.batch);
        console.log(nextEvents);
        console.log(nextEvents.length)
        console.log(this.events.length)
        let previousEvents  = this.events;
        this.events = null;
        this.events = _.concat(previousEvents, nextEvents)
        console.log(this.events.length)
        this.events.sort((n1, n2) => {
          if (n1.eventDatetime < n2.eventDatetime) {
            return 1;
          }
          if (n1.eventDatetime > n2.eventDatetime) {
            return -1;
          }
          return 0;
        });
        this.nextKey =this.events[this.events.length-1].key;
        //console.log(this.nextKey);
        console.log(this.events.length);
      });
  }
}
