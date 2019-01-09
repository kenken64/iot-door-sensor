import { Component, OnInit } from '@angular/core';
import { DoorService } from '../../services/door.service';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-door',
  templateUrl: './door.component.html',
  styleUrls: ['./door.component.css']
})
export class DoorComponent implements OnInit {
  doors: any;

  constructor(private doorSvc: DoorService,
    iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) 
  { 
    iconRegistry.addSvgIcon(
      'door_open',
      sanitizer.bypassSecurityTrustResourceUrl('assets/door_open.svg'));

      iconRegistry.addSvgIcon(
        'door_closed',
        sanitizer.bypassSecurityTrustResourceUrl('assets/door_closed.svg'));
  }

  ngOnInit() {
    this.getDoorList();
  }

  getDoorList() {
    // Use snapshotChanges().map() to store the key
    this.doorSvc.getAllDoor().snapshotChanges().pipe(
      map(changes =>
        changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
      )
    ).subscribe(doors => {
      this.doors = doors;
      this.doors.sort((n1 , n2)=>{
        if (n1.name > n2.name) {
            return 1;
        }
        if (n1.name < n2.name) {
            return -1;
        }
        return 0;
      });
    });
  }

}
