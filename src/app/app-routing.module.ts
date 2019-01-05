import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DoorComponent } from "./components/door/door.component";
import { AddDoorComponent } from "./components/door/add/add.component";
import { AddGuardComponent } from "./components/guard/add/add.component";

import { GuardComponent } from "./components/guard/guard.component";

const routes: Routes = [
  { path: "", component: DoorComponent },
  { path: "door", component: DoorComponent },
  { path: "addDoor", component: AddDoorComponent },
  { path: "addGuard", component: AddGuardComponent },
  { path: "guard/:id", component: GuardComponent },
  { path: "**", redirectTo: "/", pathMatch: 'full' }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
