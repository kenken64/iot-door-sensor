import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { MatSnackBar } from "@angular/material";
import { ActivatedRoute } from "@angular/router";
import { OTAService } from "../../services/ota.service";

@Component({
  selector: 'app-ota',
  templateUrl: './ota.component.html',
  styleUrls: ['./ota.component.css']
})
export class OtaComponent implements OnInit {

  uploadAPI: string = `${environment.firmware_api_url}firmware-upload`
  currentUploadURL: string;
  value = 50;
  spinnerFlag: boolean = false;
  flashFlag: boolean = false;
  multipleFilesUpload = [];
  doorName: String = "";
  sensor_auth: String = "";
  firmwareVersion: String = "";
  isDisabled: boolean = false;

  constructor(private activatedRoute: ActivatedRoute, 
    private snackBar: MatSnackBar, private otaSvc: OTAService ) { 

  }

  ngOnInit() {
    this.sensor_auth = this.activatedRoute.snapshot.params.value;
    this.doorName = this.activatedRoute.snapshot.params.name;
    this.otaSvc.getFirmwareVersion(this.sensor_auth).then((result)=>{
      console.log(JSON.stringify(result));
      this.firmwareVersion = result.version;
    }).catch(error=>console.warn(error));
  }

  flashDevice() {
    this.isDisabled = true;
    this.otaSvc.flashDevice(this.sensor_auth, 1).then((result)=>{
      console.log(result);  
    }).catch(error=>console.warn(error));
    setTimeout(()=>{
      console.log("flashing ... in progress");
      this.isDisabled = false;
      this.otaSvc.getFirmwareVersion(this.sensor_auth).then((result)=>{
        console.log(JSON.stringify(result));
        this.firmwareVersion = result.version;
        this.otaSvc.flashDevice(this.sensor_auth, 0).then((result)=>{
          console.log(result);  
        }).catch(error=>console.warn(error));
      }).catch(error=>console.warn(error));
    },25000)
  }

  doneUpload(evt){
    console.log(evt.file);
    console.log(">>>" + JSON.stringify(evt.event));
    let evtObj = {... evt.event};
    console.log(">>>" + evtObj);
    this.spinnerFlag = true;
    if(typeof(evtObj.body) !== 'undefined'){
      console.log(evtObj.body);
        this.currentUploadURL = evtObj.body;
        console.log("!!!this.currentUploadURL "  +this.currentUploadURL);
        this.multipleFilesUpload.push(this.currentUploadURL);
        this.spinnerFlag = false;
        let snackBarRef = this.snackBar.open("Firmware Uploaded", "Done", {
          duration: 3000
        });
    }
    
  }

}
