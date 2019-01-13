import { Component, OnInit } from '@angular/core';
import { DoorService } from '../../services/door.service';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material';
import { map } from 'rxjs/operators';
import {Howl, Howler} from 'howler';

@Component({
  selector: "app-door",
  templateUrl: "./door.component.html",
  styleUrls: ["./door.component.css"]
})
export class DoorComponent implements OnInit {
  doors: any;

  constructor(
    private doorSvc: DoorService,
    iconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer
  ) {
    iconRegistry.addSvgIcon(
      "door_open",
      sanitizer.bypassSecurityTrustResourceUrl("assets/door_open.svg")
    );

    iconRegistry.addSvgIcon(
      "door_closed",
      sanitizer.bypassSecurityTrustResourceUrl("assets/door_closed.svg")
    );
  }

  sound = new Howl({
      src: ['../../assets/door-open.mp3'],
      loop: true
  });

  ngOnInit() {
    this.getDoorList();
  }

  getDoorList() {
    // Use snapshotChanges().map() to store the key
    this.doorSvc
      .getAllDoor()
      .snapshotChanges()
      .pipe(
        map(changes =>
          changes.map(c => ({ key: c.payload.key, ...c.payload.val() }))
        )
      )
    .subscribe(doors => {
      this.doors = doors;
      console.log("door data changed !")
      let item1 = this.doors.find(i => i.status === 'Open');
      console.log("at least one door is open");
      console.log(item1);
      if(typeof(item1) === 'undefined' ){
        // Play the sound.
        this.sound.stop();
      }else{
        this.sound.stop();
        // Play the sound.
        this.sound.play();
        // Change global volume.
        Howler.volume(0.3);
      }
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
