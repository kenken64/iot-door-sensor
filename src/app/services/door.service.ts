import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Door } from '../model/door';
@Injectable({
  providedIn: 'root'
})
export class DoorService {

  private doorCollection: AngularFirestoreCollection<Door>;
  doors: Observable<Door[]>;
  private doorDoc: AngularFirestoreDocument<Door>;
  door: Observable<Door>;
  
  constructor(private db: AngularFirestore) { 
    this.doorCollection = db
           .collection<Door>('door', ref => ref.orderBy('name', 'asc'));
  }
  
  saveDoor(door) {
    return of(this.doorCollection.add(door));
  }
  
  getAllDoor(): Observable<Door[]>{
    this.doors = this.doorCollection.snapshotChanges()
    .pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Door;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
  
    return this.doors;
  }

  getDoor(id): Observable<Door>{
    const path = `door/${id}`;
    this.doorDoc = this.db.doc<Door>(path);
    this.door = this.doorDoc.valueChanges();
    return this.door;
  }

  updateDoor(doorId, guards) {
    const path = `/${doorId}`; 
    this.db.collection<Door>('door').doc(path).update({
        guards: guards
    });
  }

}
