import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  QueryList
} from "@angular/core";
import { GuardService } from "../../services/guard.service";
import { Guard, GuardId } from "../../model/guard";
import { DoorService } from "../../services/door.service";
import { Door } from "../../model/door";
import { MatSnackBar } from "@angular/material";
import { ActivatedRoute, Router } from "@angular/router";
import * as _ from "lodash";
import { COMMA, ENTER } from "@angular/cdk/keycodes";

@Component({
  selector: "app-guard",
  templateUrl: "./guard.component.html",
  styleUrls: ["./guard.component.css"]
})
export class GuardComponent implements OnInit {
  guards: GuardId[] = [];
  @ViewChild("guardz")
  guardz: QueryList<ElementRef>;
  selectedGuard: Guard[] = [];
  doorName: String = "";
  doorId: String = "";
  roomId: String;
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private guardSvc: GuardService,
    private doorSvc: DoorService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.roomId = this.activatedRoute.snapshot.params.id;
    console.log(this.roomId);
    this.doorSvc.getDoor(this.roomId).subscribe(result => {
      console.log(">>> " + JSON.stringify(result));
      console.log(">>> ID ??? " + this.roomId);
      this.doorName = result.name;
      this.doorId = this.roomId;
      result.guards.forEach(value => {
        console.log(value);
        this.guardSvc.getGuard(value).subscribe(guardVal => {
          console.log(guardVal);
          this.selectedGuard.push(guardVal);
        });
      });
    });
    this.guardSvc.getAllGuard().subscribe(result => {
      console.log(result);
      this.guards = result;
    });
  }

  back() {
    this.router.navigate(["/"]);
  }

  add($event) {}

  getValue($event) {
    console.log(">>>" + $event.email);
    console.log(this.selectedGuard.indexOf($event));
    let guard = this.selectedGuard.find(x => x.email == $event.email);
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
      console.log("GUARD ID > ?" + guard.id);
      updateGuards.push(guard.id);
    });
    console.log(updateGuards);
    console.log(this.doorId);
    this.selectedGuard = [];
    this.doorSvc.updateDoor(this.doorId, updateGuards);
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
