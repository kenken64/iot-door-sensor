import { Injectable } from "@angular/core";
import { AngularFireDatabase, AngularFireList } from "@angular/fire/database";
import { Observable, of } from "rxjs";
import { Events } from "../model/events";
import { Feedback } from "../model/feedback";

@Injectable({
  providedIn: "root"
})
export class EventsService {
  eventsRef: AngularFireList<Events> = null;
  feedbackRef: AngularFireList<Feedback> = null;
  limitofRecords: number = 500;
  events: Observable<any[]>;
  events$: Observable<Events>;
  feedback$: Observable<Feedback>;
  private dbPath = "/events";
  private feedbackDbPath = "/feedback";
  private historicaldbPath = "events-history";

  constructor(private db: AngularFireDatabase) {
    this.eventsRef = db.list(this.dbPath);
    this.feedbackRef = db.list(this.dbPath);
  }

  saveEvents(events) {
    return of(this.eventsRef.push(events));
  }

  saveFeedback(events) {
    return of(this.feedbackRef.push(events));
  }

  updateFeedback(feedback) {
    const path = `/events/${feedback.id}`;
    feedback = this.db.object<Feedback>(path);
    console.log(this.events$);
    return feedback.set(feedback);
  }

  getAllFeedback(): AngularFireList<Feedback> {
    return this.db.list(this.feedbackDbPath, ref =>
      ref.limitToFirst(this.limitofRecords)
    );
  }

  getFeedback(id): Observable<Feedback> {
    const path = `/feedback/${id}`;
    this.feedback$ = this.db.object<Feedback>(path).valueChanges();
    console.log(this.feedback$);
    return this.feedback$;
  }

  getFeedbackByEventsTime(feedbackDateTime): AngularFireList<Feedback> {
    this.feedbackRef = this.db.list("/feedback", ref =>
      ref.orderByChild("feedbackDatetime").equalTo(feedbackDateTime)
    );
    return this.feedbackRef;
  }

  getAllEvents(): AngularFireList<Events> {
    return this.db.list(this.dbPath, ref =>
      ref.limitToFirst(this.limitofRecords)
    );
  }

  getAllHistoricalEvents(): AngularFireList<Events> {
    return this.db.list(this.historicaldbPath);
  }

  getEvents(id): Observable<Events> {
    const path = `/events/${id}`;
    this.events$ = this.db.object<Events>(path).valueChanges();
    console.log(this.events$);
    return this.events$;
  }

  getEventsByEventsTime(eventTime): AngularFireList<Events> {
    this.eventsRef = this.db.list("/events", ref =>
      ref.orderByChild("eventDatetime").equalTo(eventTime)
    );
    return this.eventsRef;
  }
}
