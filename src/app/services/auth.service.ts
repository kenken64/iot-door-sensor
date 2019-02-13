import { Injectable } from '@angular/core';
import { MatSnackBar } from "@angular/material";
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
  
  constructor(private afAuth: AngularFireAuth, 
    private snackBar: MatSnackBar) { 
  }

  loginWithEmail(email, password){
    return this.fromFirebaseAuthPromise(this.afAuth.auth.signInWithEmailAndPassword(email, password))
    .pipe(
        catchError(this.handleError('login', AuthInfo))
    );
  }

  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(JSON.stringify(error));
      let snackBarRef = this.snackBar.open(
        JSON.stringify(error),
        "Done"
      );  
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
            this.saveToken(idToken, this.afAuth.auth.currentUser.email);
        });
    }

    getToken(): String {
        return window.localStorage['firebaseToken'];
    }

    getEmail(): String {
        return window.localStorage['email'];
    }

    saveToken(token: String,  email: String) {
        console.log("Firebase token ! > " + token);
        console.log("Firebase email ! > " + email);
        window.localStorage['firebaseToken'] = token;
        window.localStorage['email'] = email;
    }

    destroyToken() {
        window.localStorage.removeItem('firebaseToken');
        window.localStorage.removeItem('email');
    } 
}