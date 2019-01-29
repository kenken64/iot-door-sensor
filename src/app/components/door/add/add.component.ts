import { Component, OnInit } from "@angular/core";
import { DoorService } from "../../../services/door.service";
import { Door } from "../../../model/door";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { MatSnackBar } from "@angular/material";
import { map } from "rxjs/operators";

@Component({
  selector: "app-add",
  templateUrl: "./add.component.html",
  styleUrls: ["./add.component.css"]
})
export class AddDoorComponent implements OnInit {
  constructor(private svc: DoorService, private snackBar: MatSnackBar) {}

  doorForm = new FormGroup({
    name: new FormControl("", Validators.required),
    sensorAuth: new FormControl("", Validators.required)
  });

  ngOnInit() {}

  saveDoor() {
    let name = this.doorForm.get("name").value;
    let sensorAuth = this.doorForm.get("sensorAuth").value;
    let d: Door = {
      name: name,
      sensor_auth: sensorAuth,
      status: "Closed",
      prev_status: "Closed",
      battery: "0"
    };

    let unsub = this.svc
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
            unsub.unsubscribe();
          });
        } else {
          let snackBarRef = this.snackBar.open("Door already exist.", "Done", {
            duration: 3000
          });
        }
      });
  }
}
