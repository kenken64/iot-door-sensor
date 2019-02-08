import { Injectable } from "@angular/core";
import { AngularFireDatabase, AngularFireList } from "@angular/fire/database";
import { Observable, of } from "rxjs";
import { Events } from "../model/events";

@Injectable({
  providedIn: "root"
})
export class EventsService {
  eventsRef: AngularFireList<Events> = null;
  events: Observable<any[]>;
  events$: Observable<Events>;
  private dbPath = "/events";

  constructor(private db: AngularFireDatabase) {
    this.eventsRef = db.list(this.dbPath);
  }

  saveEvents(events) {
    return of(this.eventsRef.push(events));
  }

  getAllEvents() : AngularFireList<Events> {
    return this.db.list(this.dbPath);
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
