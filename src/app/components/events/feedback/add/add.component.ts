import { Component, OnInit } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { EventsService } from '../../../../services/events.service';
import  { Feedback } from '../../../../model/feedback';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css'],
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class AddFeedbackComponent implements OnInit {
  feedbackForm :FormGroup;
  doorName: String;
  eventId: String;
  device: String;
  data: any;

  constructor(private location: Location,
    private fb: FormBuilder,
    private eventsSvc: EventsService,
    private snackSvc:  MatSnackBar,
    private activatedRoute: ActivatedRoute,
    private authSvc: AuthService,
    private router: Router) { 
      this.feedbackForm = fb.group({
        eventId: ['', [Validators.required]],
        doorName: ['', [Validators.required]],
        device: ['', [Validators.required]],
        comment: ['', [Validators.required]],
        feedbackDate: ['', [Validators.required]],
        feedbackTime: ['', [Validators.required]],
        feedbackcnt: [''],
      })
  }

  ngOnInit() {
    this.data = this.activatedRoute.snapshot.data;
    console.log(this.data);
    this.eventId = this.activatedRoute.snapshot.params.key;
    this.eventsSvc.getEvents(this.eventId).subscribe((result)=>{
      this.feedbackForm.patchValue({
        eventId: this.eventId,
        doorName: result.doorName,
        device: result.device,
        feedbackcnt: result.feedbackcnt,
      })
      console.log(this.eventId);
      this.feedbackForm.get('eventId').disable();
      this.feedbackForm.get('doorName').disable();
      this.feedbackForm.get('device').disable();
    })
  }

  onSave(){
    let eventId = this.feedbackForm.get("eventId").value;
    let doorName = this.feedbackForm.get("doorName").value;
    let device = this.feedbackForm.get("device").value;
    let feedbackcnt = this.feedbackForm.get("feedbackcnt").value;
    let comment = this.feedbackForm.get("comment").value;
    let feedbackDate = this.feedbackForm.get("feedbackDate").value;
    let feedbackTime = this.feedbackForm.get("feedbackTime").value;
    console.log(feedbackDate);
    let guardEmail = this.data.email.guardEmail;
    console.log(guardEmail);
    if(typeof(guardEmail) === 'undefined' ){
      let snackBarRef = this.snackSvc.open("Invalid security guard email. Please relogin!", 'Done', {
        duration: 3000
      });
      return;
    }
    console.log(feedbackcnt);
    if(typeof(feedbackcnt) === 'undefined'){
      feedbackcnt = 1;
    }else{
      feedbackcnt++;
    }
    let feedbackValue: Feedback = {
      eventId: eventId,
      doorName: doorName,
      device: device,
      comment: comment,
      feedbackDate: feedbackDate.getTime(),
      feedbackTime: feedbackTime,
      guardEmail: guardEmail
    }
    //first hash to the server side
    if(this.feedbackForm.valid){
      console.log(">>>?feedbackDate "  +  feedbackValue.feedbackDate);
      this.eventsSvc.saveFeedback(feedbackValue).subscribe((result)=>{
        console.log(result);
        this.eventsSvc.updateFeedbackCount(eventId ,feedbackcnt);
        let snackBarRef = this.snackSvc.open("Feedback added!", 'Done', {
          duration: 3000
        });
      })
    }else{
      let snackBarRef = this.snackSvc.open("Invalid!", 'Done', {
        duration: 3000
      });
    }
  }

  goBack() {
    this.location.back();
  }
  
}
