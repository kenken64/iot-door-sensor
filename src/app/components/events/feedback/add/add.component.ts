import { Component, OnInit, OnDestroy } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';
import { EventsService } from '../../../../services/events.service';
import  { Feedback } from '../../../../model/feedback';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css'],
  providers: [Location, {provide: LocationStrategy, useClass: PathLocationStrategy}]
})
export class AddFeedbackComponent implements OnInit, OnDestroy {
  feedbackForm :FormGroup;
  doorName: String;
  eventId: String;
  device: String;
  data: any;
  private saveFeedbackSub: Subscription;
  private geteFeedbackSub: Subscription;

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

  formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0'+minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }

  ngOnInit() {
    this.data = this.activatedRoute.snapshot.data;
    this.eventId = this.activatedRoute.snapshot.params.key;
    this.geteFeedbackSub = this.eventsSvc.getEvents(this.eventId).subscribe((result)=>{
      this.feedbackForm.patchValue({
        eventId: this.eventId,
        doorName: result.doorName,
        device: result.device,
        feedbackcnt: result.feedbackcnt,
        feedbackTime: this.formatAMPM(new Date)
      })
      this.feedbackForm.get('eventId').disable();
      this.feedbackForm.get('doorName').disable();
      this.feedbackForm.get('device').disable();
    })
  }

  ngOnDestroy(){
    if(typeof(this.saveFeedbackSub) !== 'undefined'){
      this.saveFeedbackSub.unsubscribe();
    }

    if(typeof(this.geteFeedbackSub) !== 'undefined'){
      this.geteFeedbackSub.unsubscribe();
    }
  }

  onSave(){
    let eventId = this.feedbackForm.get("eventId").value;
    let doorName = this.feedbackForm.get("doorName").value;
    let device = this.feedbackForm.get("device").value;
    let feedbackcnt = this.feedbackForm.get("feedbackcnt").value;
    let comment = this.feedbackForm.get("comment").value;
    let feedbackDate = this.feedbackForm.get("feedbackDate").value;
    let feedbackTime = this.feedbackForm.get("feedbackTime").value;
    console.log(feedbackTime);
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
      this.saveFeedbackSub = this.eventsSvc.saveFeedback(feedbackValue).subscribe((result)=>{
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
