import { Component, OnInit } from '@angular/core';
import { DoorService } from '../../services/door.service';
import { Door } from '../../model/door';

@Component({
  selector: 'app-door',
  templateUrl: './door.component.html',
  styleUrls: ['./door.component.css']
})
export class DoorComponent implements OnInit {
  doors: Door[] = [];
  constructor(private doorSvc: DoorService) { }

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
