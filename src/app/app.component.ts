import { Component, OnDestroy } from '@angular/core';
import { AuthService } from './services/auth.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { AngularFireAuth } from '@angular/fire/auth';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnDestroy{
  title = 'iot-door-sensor';
  PASSWORD_PATTERN = /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{12,}$/;
  loginForm :FormGroup;
  isLoading = false;
  private loginWithEmailSub: Subscription;

  constructor(private snackBar: MatSnackBar,
    private fb: FormBuilder,
    public afAuth: AngularFireAuth,
    private authService: AuthService){
    this.loginForm = fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.pattern(this.PASSWORD_PATTERN)]],
    })
  }

  ngOnDestroy(){
    if(typeof(this.loginWithEmailSub) !== 'undefined'){
      this.loginWithEmailSub.unsubscribe();
    }
  }

  loginWithEmail(){
    const formValue = this.loginForm.value;
    this.isLoading = true;
    try{
      this.loginWithEmailSub = this.authService.loginWithEmail(formValue.email, formValue.password)
          .subscribe(
              (result) => {
                console.log(result);
                
                this.authService.setFirebaseTokenToLocalstorage();
                
                setTimeout(function() {
                    console.log("delay ...");
                    this.isLoading = false;
                }.bind(this), 5000);
                
              },
              (error) => {
                console.log(error)
                this.isLoading = false; // error path
              }
          )
    }catch(e){
      this.isLoading = false;
      console.log(">>>>" + e);
    }
  }

  logout(){
    this.isLoading = false;
    this.afAuth.auth.signOut().then(result=>this.authService.destroyToken());
  }
}
