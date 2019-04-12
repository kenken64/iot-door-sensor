// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firmware_api_url: 'http://localhost:3005/api/',
  firebase: {
    apiKey: "AIzaSyB1GiFDJas7GgftbAuFgkNAajm4e0DLoMM",
    authDomain: "door-sensor-proj.firebaseapp.com",
    databaseURL: "https://door-sensor-proj.firebaseio.com",
    projectId: "door-sensor-proj",
    storageBucket: "door-sensor-proj.appspot.com",
    messagingSenderId: "60505252179"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
