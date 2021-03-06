import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { DoorComponent } from "./components/door/door.component";

import { AddDoorComponent } from "./components/door/add/add.component";
import { EditDoorComponent } from "./components/door/edit/edit.component";
import { AddGuardComponent } from "./components/guard/add/add.component";
import { EventsComponent } from "./components/events/events.component";
import { FeedbackComponent } from "./components/events/feedback/feedback.component";
import { AddFeedbackComponent } from "./components/events/feedback/add/add.component";

import { GuardComponent } from "./components/guard/guard.component";
import { BatteryComponent } from "./components/battery/battery.component";
import { OtaComponent } from "./components/ota/ota.component";

import { FeedbackSolver } from './components/events/feedback/add/feedback.resolver';

const routes: Routes = [
  { path: "", component: DoorComponent },
  { path: "door", component: DoorComponent },
  { path: "editDoor/:value/:name", component: EditDoorComponent },
  { path: "events", component: EventsComponent },
  { path: "feedback/:key", component: FeedbackComponent },
  { path: "addFeedback/:key", component: AddFeedbackComponent, resolve: { email: FeedbackSolver } },
  { path: "battery/:value/:name", component: BatteryComponent },
  { path: "ota/:value/:name", component: OtaComponent },
  { path: "addDoor", component: AddDoorComponent },
  { path: "addGuard", component: AddGuardComponent },
  { path: "guard/:key", component: GuardComponent },
  { path: "", redirectTo: "/", pathMatch: "full" },
  { path: "**", redirectTo: "/", pathMatch: "full" }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    FeedbackSolver
  ]
})
export class AppRoutingModule {}
