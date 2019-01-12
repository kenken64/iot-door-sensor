import { Injectable } from "@angular/core";
import { AngularFireDatabase, AngularFireList } from "@angular/fire/database";
import { Observable, of } from "rxjs";
import { Door } from "../model/door";

@Injectable({
  providedIn: "root"
})
export class DoorService {
  doorsRef: AngularFireList<Door> = null;
  doors: Observable<any[]>;
  //private doorDoc: AngularFirestoreDocument<Door>;
  door$: Observable<Door>;
  private dbPath = "/door";

  constructor(private db: AngularFireDatabase) {
    this.doorsRef = db.list(this.dbPath);
  }

  saveDoor(door) {
    return of(this.doorsRef.push(door));
  }

  getAllDoor(): AngularFireList<Door> {
    this.doorsRef = this.db.list(this.dbPath);
    return this.doorsRef;
  }

  getDoor(id): Observable<Door> {
    const path = `/door/${id}`;
    this.door$ = this.db.object<Door>(path).valueChanges();
    console.log(this.door$);
    return this.door$;
  }

  getDoorBySensorAuth(sensorAuth): AngularFireList<Door> {
    this.doorsRef = this.db.list("/door", ref =>
      ref.orderByChild("sensor_auth").equalTo(sensorAuth)
    );
    return this.doorsRef;
  }

  updateDoor(doorId, guards) {
    const path = `/${doorId}`;
    const itemRef = this.db.object(`door/${path}`);
    itemRef.update({ guards: guards });
  }
}
