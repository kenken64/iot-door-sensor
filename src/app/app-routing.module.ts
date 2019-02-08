import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DoorComponent } from "./components/door/door.component";
import { AddDoorComponent } from "./components/door/add/add.component";
import { AddGuardComponent } from "./components/guard/add/add.component";
import { EventsComponent } from "./components/events/events.component";
import { GuardComponent } from "./components/guard/guard.component";
import { BatteryComponent } from "./components/battery/battery.component";

const routes: Routes = [
  { path: "", component: DoorComponent },
  { path: "door", component: DoorComponent },
  { path: "events", component: EventsComponent },
  { path: "battery/:value/:name", component: BatteryComponent },
  { path: "addDoor", component: AddDoorComponent },
  { path: "addGuard", component: AddGuardComponent },
  { path: "guard/:key", component: GuardComponent },
  { path: "", redirectTo: "/", pathMatch: "full" },
  { path: "**", redirectTo: "/", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
