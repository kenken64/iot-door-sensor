import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { Guard, GuardId } from '../model/guard';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GuardService {

  private guardCollection: AngularFirestoreCollection<Guard>;
  private guardDoc: AngularFirestoreDocument<Guard>;
  guard: Observable<Guard>;
  guards: Observable<GuardId[]>;
  
  constructor(private db: AngularFirestore) { 
    this.guardCollection = db
           .collection<Guard>('guard', ref => ref.orderBy('name', 'asc'));
  }
  
  saveGuard(guard) {
    return of(this.guardCollection.add(guard));
  }
  
  getAllGuard(): Observable<GuardId[]>{
    this.guardCollection = this.db.collection<Guard>('guard');
    this.guards = this.guardCollection.snapshotChanges().pipe(
      map(actions => actions.map(a => {
        const data = a.payload.doc.data() as Guard;
        const id = a.payload.doc.id;
        return { id, ...data };
      }))
    );
    return this.guards;
  }

  getGuard(id): Observable<Guard>{
    const path = `guard/${id}`;
    this.guardDoc = this.db.doc<Guard>(path);
    this.guard = this.guardDoc.valueChanges();
    return this.guard;
  }

  updateGuard(guard) {
    const path = `guard/${guard.id}`; 
    this.db.collection<Guard>('guard').doc(path).update(guard);
  }
}
