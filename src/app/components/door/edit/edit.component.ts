import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { DoorService } from "../../../services/door.service";
import { Door } from "../../../model/door";
import { MatSnackBar } from "@angular/material";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditDoorComponent implements OnInit, OnDestroy {
  doorId: any;
  doorName: string;
  private doorSub: Subscription;

  editDoorForm = new FormGroup({
    name: new FormControl("", Validators.required),
    sensorAuth: new FormControl("", Validators.required),
    triggerAuth: new FormControl(""),
    rechargeableBat: new FormControl(""),
    workerName: new FormControl("")
  });
  constructor(private activatedRoute: ActivatedRoute,
    private svc: DoorService, private snackBar: MatSnackBar) { }

  ngOnDestroy(){
    this.doorSub.unsubscribe();
  }

  ngOnInit() {
    console.log("EditDoorComponent >>")
    this.doorId = this.activatedRoute.snapshot.params.value;
    this.doorName = this.activatedRoute.snapshot.params.name;
    this.doorSub = this.svc.getDoor(this.doorId).subscribe((result)=>{
      console.log(result);
      this.editDoorForm.get('name').setValue(result.name);
      this.editDoorForm.get('sensorAuth').setValue(result.sensor_auth);
      this.editDoorForm.get('triggerAuth').setValue(result.trigger_auth);
      this.editDoorForm.get('rechargeableBat').setValue(result.rechargeableBat);
      this.editDoorForm.get('workerName').setValue(result.workerName);
    });
  }

  saveDoor(){
    let name = this.editDoorForm.get("name").value;
    let sensorAuth = this.editDoorForm.get("sensorAuth").value;
    let triggerAuth = this.editDoorForm.get("triggerAuth").value;
    let rechargeableBat = this.editDoorForm.get("rechargeableBat").value;
    let workerName = this.editDoorForm.get("workerName").value;
    let d: Door = {
      name: name,
      sensor_auth: sensorAuth,
      trigger_auth: triggerAuth,
      rechargeableBat: rechargeableBat,
      workerName: workerName
    };
    this.svc.updateDoor(this.doorId, d);
    let snackBarRef = this.snackBar.open(
      "Door updated.",
      "Done",
      {
        duration: 3000
      }
    );
  }

}
