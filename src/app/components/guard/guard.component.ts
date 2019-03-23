import {
  Component,
  OnInit,
  OnDestroy,
  ViewChild,
  ElementRef,
  QueryList
} from "@angular/core";
import { Subscription } from 'rxjs';
import { GuardService } from "../../services/guard.service";
import { Guard } from "../../model/guard";
import { DoorService } from "../../services/door.service";
import { MatSnackBar } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { map } from "rxjs/operators";

@Component({
  selector: "app-guard",
  templateUrl: "./guard.component.html",
  styleUrls: ["./guard.component.css"]
})
export class GuardComponent implements OnInit, OnDestroy {
  guards: any;
  @ViewChild("guardz")
  guardz: QueryList<ElementRef>;
  selectedGuard: Guard[] = [];
  doorName: String = "";
  doorId: String = "";
  doorBatteryValue: String = "";
  roomId: String;
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  
  private doorsSub: Subscription;
  private allguardsSub: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private guardSvc: GuardService,
    private doorSvc: DoorService,
    private snackBar: MatSnackBar
  ) {}

  ngOnDestroy(){
    this.doorsSub.unsubscribe();
    this.allguardsSub.unsubscribe();
  }

  ngOnInit() {
    this.roomId = this.activatedRoute.snapshot.params.key;
    console.log("roomId" + this.roomId);
    this.doorsSub = this.doorSvc.getDoor(this.roomId).subscribe(result => {
      console.log(">>> result " + JSON.stringify(result));
      console.log(">>> ID ??? " + this.roomId);
      this.doorName = result.name;
      this.doorId = this.roomId;
      this.doorBatteryValue = result.battery;
      if (typeof result.guards !== "undefined") {
        this.selectedGuard = [];
        result.guards.forEach(value => {
          console.log(value);
          this.guardSvc.getGuard(value).subscribe(guardVal => {
            console.log(guardVal);
            this.selectedGuard.push(guardVal);
          });
        });
      }
    });

    this.allguardsSub = this.guardSvc
      .getAllGuard()
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      )
      .subscribe(guards => {
        this.guards = guards;
        this.guards.sort((n1, n2) => {
          if (n1.name > n2.name) {
            return 1;
          }
          if (n1.name < n2.name) {
            return -1;
          }
          return 0;
        });
      });
  }

  back() {
    this.router.navigate(["/"]);
  }

  showBattery() {
    console.log(this.doorBatteryValue);
    console.log(this.doorName);

    this.router.navigate(["/battery", this.doorBatteryValue, this.doorName]);
  }

  editDoor() {
    console.log(this.doorId);
    console.log(this.doorName);
    this.router.navigate(["/editDoor", this.doorId, this.doorName]);
  }

  add($event) {}

  getValue($event) {
    console.log(">>>" + $event.email);
    console.log(this.selectedGuard.indexOf($event));
    let guard = this.selectedGuard.find(x => x.email == $event.email);
    console.log("???" + guard);
    console.log("???" + JSON.stringify(guard));
    if (typeof guard === "undefined") {
      this.selectedGuard.push($event);
    }
  }

  current_selected: string;

  onSelection(e) {
    this.current_selected = e.option.value;
  }

  save() {
    let updateGuards = [];
    let selectedGuardCloned = _.cloneDeep(this.selectedGuard);
    selectedGuardCloned.forEach(value => {
      console.log(value.email);
      let guard = this.guards.find(x => x.email == value.email);
      if (typeof guard === "undefined") {
        console.log("guard is undefined");
      }
      console.log("GUARD ID > ?" + guard.key);
      updateGuards.push(guard.key);
    });
    console.log(updateGuards);
    console.log(this.doorId);
    this.selectedGuard = [];
    this.doorSvc.updateDoorWithGuards(this.doorId, updateGuards);
    let snackBarRef = this.snackBar.open(
      "Guard added to door sensor.",
      "Done",
      {
        duration: 3000
      }
    );
  }

  remove(i) {
    console.log("remove ..." + i);
    console.log("ARR > " + this.selectedGuard);
    var index = this.selectedGuard.indexOf(i);
    if (index > -1) {
      this.selectedGuard.splice(index, 1);
    }

    let snackBarRef = this.snackBar.open("Guard assignment removed.", "Done", {
      duration: 3000
    });
  }
}
