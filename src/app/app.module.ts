import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { HttpClientModule } from "@angular/common/http";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MaterialModule } from "./material.module";
import { DoorService } from "./services/door.service";
import { GuardService } from "./services/guard.service";
import { ExcelService } from "./services/excel-service";

import { DoorComponent } from "./components/door/door.component";
import { GuardComponent } from "./components/guard/guard.component";
import { EventsComponent, BottomSheetFilterStatusSheet } from "./components/events/events.component";

import { AddDoorComponent } from "./components/door/add/add.component";
import { AddGuardComponent } from "./components/guard/add/add.component";
import { BatteryComponent } from "./components/battery/battery.component";
import { FeedbackComponent } from "./components/events/feedback/feedback.component";
import { AddFeedbackComponent } from "./components/events/feedback/add/add.component";

import { AngularFontAwesomeModule } from "angular-font-awesome";
// firebase dependencies
import { AngularFirestore } from "@angular/fire/firestore";
import { AngularFireDatabaseModule } from "@angular/fire/database";
import { AngularFireAuthModule } from "@angular/fire/auth";

import { AngularFireModule } from "@angular/fire";
import { AngularFireStorageModule } from "@angular/fire/storage";
import { AngularFireMessagingModule } from "@angular/fire/messaging";
import { ReactiveFormsModule } from "@angular/forms";

import { ChartModule, HIGHCHARTS_MODULES } from "angular-highcharts";
import * as more from "highcharts/highcharts-more.src";
import * as solidGauge from "highcharts/modules/solid-gauge.src";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

@NgModule({
  entryComponents: [EventsComponent, BottomSheetFilterStatusSheet],
  declarations: [
    AppComponent,
    DoorComponent,
    GuardComponent,
    AddDoorComponent,
    AddGuardComponent,
    EventsComponent,
    BatteryComponent,
    FeedbackComponent,
    AddFeedbackComponent,
    BottomSheetFilterStatusSheet
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    MaterialModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production
    }),
    BrowserAnimationsModule,
    AngularFontAwesomeModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    AngularFireStorageModule,
    AngularFireMessagingModule,
    AngularFireAuthModule,
    ReactiveFormsModule,
    ChartModule,
    InfiniteScrollModule,
    NgxMaterialTimepickerModule.forRoot()
  ],
  providers: [
    AngularFirestore,
    DoorService,
    GuardService,
    ExcelService,
    { provide: HIGHCHARTS_MODULES, useFactory: () => [more, solidGauge] }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
