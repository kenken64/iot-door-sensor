import { Injectable } from '@angular/core';

import { Resolve } from '@angular/router';

import { Observable } from 'rxjs';
import { of} from 'rxjs';
import { AuthService } from '../../../../services/auth.service';

@Injectable()
export class FeedbackSolver implements Resolve<Observable<any>> {
  
  constructor(private authSvc: AuthService) {}

  resolve() : Observable<any>{
    return of({guardEmail: this.authSvc.getEmail()});
  }
}