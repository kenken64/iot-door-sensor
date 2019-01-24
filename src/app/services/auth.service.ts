import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AngularFireAuth } from '@angular/fire/auth';
import { Observable, Subject, BehaviorSubject} from "rxjs";
import { catchError } from 'rxjs/operators';
import { AuthInfo } from "../model/authinfo";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
 static UNKNOWN_USER = new AuthInfo(null, null);
 authInfo$: BehaviorSubject<AuthInfo> = new BehaviorSubject<AuthInfo>(AuthService.UNKNOWN_USER);
 authState: any = null;
  
  constructor(private afAuth: AngularFireAuth, private http: HttpClient) { 
  }

  loginWithEmail(email, password){
    return this.fromFirebaseAuthPromise(this.afAuth.auth.signInWithEmailAndPassword(email, password))
    .pipe(
        catchError(this.handleError('login', AuthInfo))
    );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(JSON.stringify(error))
      return Observable.throw(error  || 'backend server error');
    };
  }

  fromFirebaseAuthPromise(promise):Observable<any> {
        const subject = new Subject<any>();
        promise
            .then(res => {
                    const authInfo = new AuthInfo(
                            this.afAuth.auth.currentUser.uid, 
                            this.afAuth.auth.currentUser.email);
                    this.authInfo$.next(authInfo);
                    subject.next(res);
                    subject.complete();
                
                },
                err => {
                    this.authInfo$.error(err);
                    console.log("err1 " + err);
                    subject.error(err);
                    subject.complete();
                });
        return subject.asObservable();
    }

    setFirebaseTokenToLocalstorage(){
        this.afAuth.auth.currentUser.getIdToken().then(idToken => {
            console.log("FIREBASE TOKEN !!!! " + idToken);
            this.saveToken(idToken);
        });
    }

    getToken(): String {
        return window.localStorage['firebaseToken'];
    }

    saveToken(token: String) {
        console.log("Firebase token ! > " + token);
        window.localStorage['firebaseToken'] = token;
    }

    destroyToken() {
        window.localStorage.removeItem('firebaseToken');
    } 
}