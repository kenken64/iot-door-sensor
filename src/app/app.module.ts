import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from './material.module';
import { DoorService } from './services/door.service';
import { GuardService } from './services/guard.service';
import { DoorComponent } from "./components/door/door.component";
import { GuardComponent } from "./components/guard/guard.component";
import { AddDoorComponent } from "./components/door/add/add.component";
import { AddGuardComponent } from "./components/guard/add/add.component";

import { AngularFontAwesomeModule } from 'angular-font-awesome';
// firebase dependencies 
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    DoorComponent,
    GuardComponent,
    AddDoorComponent,
    AddGuardComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    BrowserAnimationsModule,
    AngularFontAwesomeModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireStorageModule,
    AngularFireMessagingModule,
    AngularFireAuthModule,
    ReactiveFormsModule
  ],
  providers: [AngularFirestore, DoorService ,GuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
