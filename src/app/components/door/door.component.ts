import { Component, OnInit } from '@angular/core';
import { DoorService } from '../../services/door.service';
import { Door } from '../../model/door';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material';

@Component({
  selector: 'app-door',
  templateUrl: './door.component.html',
  styleUrls: ['./door.component.css']
})
export class DoorComponent implements OnInit {
  doors: Door[] = [];
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
    this.doorSvc.getAllDoor().subscribe((result)=>{
      console.log(result);
      result.sort((n1 , n2)=>{
        if (n1.name > n2.name) {
            return 1;
        }
        if (n1.name < n2.name) {
            return -1;
        }
        return 0;
      });
      this.doors = result;
    });
  }

}
