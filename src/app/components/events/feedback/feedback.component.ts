import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EventsService } from '../../../services/events.service';
import { map } from "rxjs/operators";
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent implements OnInit, OnDestroy {
  eventId: String;
  feedbacks: any;
  private alleventsSub: Subscription;
  
  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private eventsSvc: EventsService) { }

  ngOnInit() {
    this.eventId = this.activatedRoute.snapshot.params.key;
    console.log(this.eventId);
    this.alleventsSub = this.eventsSvc
      .getAllFeedback(this.eventId)
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      )
      .subscribe(feedbacks => {
        this.feedbacks = feedbacks;
        console.log(feedbacks);
        this.feedbacks.sort((n1, n2) => {
          if (n1.feedbackDate > n2.feedbackDate && n1.feedbackTime > n2.feedbackTime) {
            return 1;
          }
          if (n1.feedbackDate < n2.feedbackDate && n1.feedbackTime < n2.feedbackTime) {
            return -1;
          }
          return 0;
        });
      });
  }

  ngOnDestroy(){
    if(typeof(this.alleventsSub) !== 'undefined'){
      this.alleventsSub.unsubscribe();
    }
  }

  back(){
    this.router.navigate(["/events"]);
  }

  addFeedback(){
    this.router.navigate(["/addFeedback", this.eventId]);
  }

}
