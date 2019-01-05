import { Component, OnInit } from '@angular/core';
import { GuardService } from '../../../services/guard.service';
import  { Guard } from '../../../model/guard';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddGuardComponent implements OnInit {
  guardForm :FormGroup;
  SG_MOBILE_NO = /(6|8|9)\d{7}/g;

  constructor(private fb: FormBuilder,
    private guardSvc: GuardService,
    private snackSvc:  MatSnackBar,) { 
    this.guardForm = fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobileNo: ['', [Validators.required, Validators.pattern(this.SG_MOBILE_NO)]],
      countryCode: ['', [Validators.required]],
    })
  }

  ngOnInit() {
  }

  onSave(){
    let name = this.guardForm.get("name").value;
    let email = this.guardForm.get("email").value;
    let mobileNo = this.guardForm.get("mobileNo").value;
    let countryCode = this.guardForm.get("countryCode").value;
    
    let guardValue: Guard = {
      email: email,
      name: name,
      mobileNo: `+${countryCode}${mobileNo}`,
    }
    //first hash to the server side
    if(this.guardForm.valid){
      console.log(">>>?")
      this.guardSvc.saveGuard(guardValue).subscribe((result)=>{
        console.log(result);
        let snackBarRef = this.snackSvc.open("Guard added!", 'Done', {
          duration: 3000
        });
        //this.router.navigate(['/Article']);
      })
    }else{
      let snackBarRef = this.snackSvc.open("Invalid!", 'Done', {
        duration: 3000
      });
    }
  }
}
