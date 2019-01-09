import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/database';
import { Observable, of } from 'rxjs';
import { Guard, GuardId } from '../model/guard';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GuardService {
  guardsRef: AngularFireList<Guard> = null;
  guardsIdRef: AngularFireList<GuardId> = null;
  private guardCollection: AngularFirestoreCollection<Guard>;
  private guardDoc: AngularFirestoreDocument<Guard>;
  guard$: Observable<Guard>;
  guards: Observable<GuardId[]>;
  private dbPath = '/guard';

  constructor(private db: AngularFireDatabase) { 
    this.guardsRef = db.list(this.dbPath);         
  }
  
  saveGuard(guard) {
    return of(this.guardsRef.push(guard))
  }
  
  getAllGuard(): AngularFireList<GuardId>{
    this.guardsIdRef = this.db.list(this.dbPath);    
    return this.guardsIdRef;
  }

  getGuard(id): Observable<Guard>{
    const path = `/guard/${id}`;
    this.guard$ = this.db.object<Guard>(path).valueChanges();
    console.log(this.guard$);
    return this.guard$;
  }

  getGuardByEmail(email): AngularFireList<Guard>{
    this.guardsIdRef = this.db.list('/guard', ref => ref.orderByChild('email').equalTo(email))
    return this.guardsIdRef;
  }

  getGuardByMobileNo(mobileNo): AngularFireList<Guard>{
    this.guardsIdRef = this.db.list('/guard', ref => ref.orderByChild('mobileNo').equalTo(mobileNo))
    return this.guardsIdRef;
  }

  updateGuard(guard) {
    const path = `/${guard.id}`; 
    const itemRef = this.db.object(`guard/${path}`);
    itemRef.update(guard);
  }
}
