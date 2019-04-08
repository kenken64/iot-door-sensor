import { EventsService } from './events.service';
import { TestBed, inject } from '@angular/core/testing';
import { PlatformRef, NgModule, CompilerFactory } from '@angular/core';
import { FirebaseApp, AngularFireModule } from '@angular/fire';
import { Subscription } from 'rxjs';
import { COMMON_CONFIG } from './test-config';
import { BrowserModule } from '@angular/platform-browser';
import { database } from 'firebase/app';
describe('EventsService', () => {
  let subscription:Subscription;
  let app: FirebaseApp;
  let rootRef: database.Reference;
  let defaultPlatform: PlatformRef;
  const APP_NAME = 'door-sensor-proj';

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [AngularFireModule.initializeApp(COMMON_CONFIG, APP_NAME)]
    });

    inject([FirebaseApp, PlatformRef], (_app: FirebaseApp, _platform: PlatformRef) => {
      app = _app;
      rootRef = app.database!().ref();
      defaultPlatform = _platform;
    })();

  });

  it('should be created', () => {
    const service: EventsService = TestBed.get(EventsService);
    expect(service).toBeTruthy();
  });
});
