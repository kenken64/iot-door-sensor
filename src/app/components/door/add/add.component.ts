import { Component, OnInit, OnDestroy } from "@angular/core";
import { DoorService } from "../../../services/door.service";
import { Door } from "../../../model/door";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material";
import { map } from "rxjs/operators";
import { Subscription } from 'rxjs';

@Component({
  selector: "app-add",
  templateUrl: "./add.component.html",
  styleUrls: ["./add.component.css"]
})
export class AddDoorComponent implements OnInit, OnDestroy {
  constructor(private svc: DoorService, private snackBar: MatSnackBar) {}
  private doorSub: Subscription;

  doorForm = new FormGroup({
    name: new FormControl("", Validators.required),
    sensorAuth: new FormControl("", Validators.required),
    triggerAuth: new FormControl("")
  });

  ngOnInit() {}

  ngOnDestroy(){
    if(typeof(this.doorSub) !== 'undefined'){
      this.doorSub.unsubscribe();
    } 
  }

  saveDoor() {
    let name = this.doorForm.get("name").value;
    let sensorAuth = this.doorForm.get("sensorAuth").value;
    let triggerAuth = this.doorForm.get("triggerAuth").value;
    let d: Door = {
      name: name,
      sensor_auth: sensorAuth,
      trigger_auth: triggerAuth,
      status: "Closed",
      prev_status: "Closed",
      battery: "0"
    };

    this.doorSub = this.svc
      .getDoorBySensorAuth(sensorAuth)
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      )
      .subscribe(doors => {
        if (doors.length == 0) {
          this.svc.saveDoor(d).subscribe(result => {
            console.log("snack time !" + result);
            let snackBarRef = this.snackBar.open("Door Added", "Done", {
              duration: 3000
            });
          });
        } else {
          let snackBarRef = this.snackBar.open("Door already exist.", "Done", {
            duration: 3000
          });
        }
      });
  }
}
