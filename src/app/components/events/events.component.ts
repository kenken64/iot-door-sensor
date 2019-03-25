import { Component, OnInit, ViewChild, OnDestroy } from "@angular/core";
import { ExcelService } from "../../services/excel-service";
import { Router } from "@angular/router";
import { EventsService } from "../../services/events.service";
import { map } from "rxjs/operators";
import * as _ from "lodash";
import { InfiniteScrollDirective } from "ngx-infinite-scroll";
import {MatBottomSheet, MatBottomSheetRef} from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
  selector: 'filterstatus',
  templateUrl: 'filterstatus.html',
})
export class BottomSheetFilterStatusSheet {
  constructor(private eventsSvc: EventsService,
    private bottomSheetRef: MatBottomSheetRef<BottomSheetFilterStatusSheet>) {}

  openLink(event: MouseEvent, indicator: string): void {
    console.log(">>>>>" + indicator);
    this.eventsSvc.toggleFilter(indicator);
    this.bottomSheetRef.dismiss();
    event.preventDefault();
  }
}

@Component({
  selector: "app-events",
  templateUrl: "./events.component.html",
  styleUrls: ["./events.component.css"]
})
export class EventsComponent implements OnInit , OnDestroy{
  @ViewChild(InfiniteScrollDirective) infiniteScroll: InfiniteScrollDirective;
  events: any;
  allevents: any;
  batch = 200; // size of each query
  lastKey = ""; // key to offset next query from
  finished = false; // boolean when end of database is reached
  nextKey: any; // for next button
  prevKeys: any[] = []; // for prev button
  indicator: string;
  userTriggerExport: boolean;
  private alleventsSub: Subscription;
  private allhistoricalEvtSub: Subscription;

  constructor(
    private excelService: ExcelService,
    private router: Router,
    private svc: EventsService,
    private bottomSheet: MatBottomSheet
  ) {}

  openBottomSheet(): void {
    this.bottomSheet.open(BottomSheetFilterStatusSheet);
  }

  ngOnDestroy(){
    this.alleventsSub.unsubscribe();
    this.allhistoricalEvtSub.unsubscribe();
  }

  sortByEventDateTime(events){
    events.sort((n1, n2) => {
      if (n1.eventDatetime < n2.eventDatetime) {
        return 1;
      }
      if (n1.eventDatetime > n2.eventDatetime) {
        return -1;
      }
      return 0;
    });
  }

  ngOnInit() {
    this.userTriggerExport = false;
    this.alleventsSub = this.svc
      .getAllEvents()
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      )
      .subscribe(events => {
        this.events = events;
        this.allevents = Object.assign([], this.events);
        this.sortByEventDateTime(this.events);
        this.svc.filterEvt.subscribe(indicator => {
          this.indicator = indicator;
          console.log("Indicator >" + this.indicator);
          if(this.indicator === 'A'){
            this.events = Object.assign([], this.allevents);
          }else if(this.indicator === 'C'){
            this.events = Object.assign([], this.allevents);
            this.events = this.events.filter(event => event.type === 'DoorClosed');
          }else if(this.indicator === 'O'){
            this.events = Object.assign([], this.allevents);
            this.events = this.events.filter(event => event.type === 'DoorOpen');
          }else if(this.indicator === 'B'){
            this.events = Object.assign([], this.allevents);
            this.events = this.events.filter(event => event.type === 'Battery');
          }
          this.sortByEventDateTime(this.events);
        });    
      });
  }

  exportToExcel() {
    this.userTriggerExport = true;
    
      this.allhistoricalEvtSub = this.svc
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
        if(this.userTriggerExport){
          this.excelService.exportAsExcelFile(events, "door-events");
          this.userTriggerExport = false;
        }
      });
    
  }

  back() {
    this.router.navigate(["/"]);
  }

  onScroll() {
    console.log("scrolled!!");
    console.log("this.nextKey!!" + this.nextKey);
    console.log("this.batch!!" + this.batch);

    this.alleventsSub = this.svc
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