import { Component, OnInit, OnDestroy } from '@angular/core';
import { GuardService } from '../../../services/guard.service';
import  { Guard } from '../../../model/guard';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.css']
})
export class AddGuardComponent implements OnInit, OnDestroy {
  guardForm :FormGroup;
  SG_MOBILE_NO = /(6|8|9)\d{7}/g;
  USA_MOBILE_NO = /(?:\d{1}\s)?\(?(\d{3})\)?-?\s?(\d{3})-?\s?(\d{4})/g;
  MSIA_MOBILE_NO = /^(\+601[0123456789])?-?([2-9]\d{6,7})|(01[0123456789]-)([2-9]\d{6,7})$/g;
  HK_MOBILE_NO = /^[2|3|5|6|9]\d{7}/g;
  CHINA_MOBILE_NO = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/;
  UK_MOBILE_NO = /((\+{0,1}[1-9]{1,3})|([0-9]{2,5})){0,1}[ ]{0,1}(\(0\)){0,1}[ ]{0,1}[0-9]{4,5}[ ]{0,1}[0-9]{6}/;
  private saveGuardSub: Subscription;
  
  constructor(private fb: FormBuilder,
    private guardSvc: GuardService,
    private snackSvc:  MatSnackBar) { 
    this.guardForm = fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      mobileNo: ['', [Validators.required, Validators.pattern(this.SG_MOBILE_NO)]],
      countryCode: ['', [Validators.required]],
    });
  }

  ngOnInit() {
    this.guardForm.get("countryCode").valueChanges.subscribe(diffCode => {
      console.log(diffCode);
      if(diffCode === '+65'){
        const validators = [ Validators.required, Validators.pattern(this.SG_MOBILE_NO) ];
        this.guardForm.get("mobileNo").setValidators(validators);
      }else if(diffCode === '+1'){
        const validators = [ Validators.required, Validators.pattern(this.USA_MOBILE_NO) ];
        this.guardForm.get("mobileNo").setValidators(validators);
      }else if(diffCode === '+60'){
        const validators = [ Validators.required, Validators.pattern(this.MSIA_MOBILE_NO) ];
        this.guardForm.get("mobileNo").setValidators(validators);
      }else if(diffCode === '+86'){
        const validators = [ Validators.required, Validators.pattern(this.CHINA_MOBILE_NO) ];
        this.guardForm.get("mobileNo").setValidators(validators);
      }else if(diffCode === '+853'){
        const validators = [ Validators.required, Validators.pattern(this.HK_MOBILE_NO) ];
        this.guardForm.get("mobileNo").setValidators(validators);
      }else if(diffCode === '+44'){
        const validators = [ Validators.required, Validators.pattern(this.UK_MOBILE_NO) ];
        this.guardForm.get("mobileNo").setValidators(validators);
      }
    });

    this.guardForm.updateValueAndValidity();
  }

  ngOnDestroy(){
    if(typeof(this.saveGuardSub) !== 'undefined'){
      this.saveGuardSub.unsubscribe();
    }
  }

  onSave(){
    let name = this.guardForm.get("name").value;
    let email = this.guardForm.get("email").value;
    let mobileNo = this.guardForm.get("mobileNo").value;
    let countryCode = this.guardForm.get("countryCode").value;
    
    let guardValue: Guard = {
      email: email,
      name: name,
      mobileNo: `${countryCode}${mobileNo}`,
    }
    //first hash to the server side
    if(this.guardForm.valid){
      this.saveGuardSub = this.guardSvc.saveGuard(guardValue).subscribe((result)=>{
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
