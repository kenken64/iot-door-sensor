// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyABRqzd6DghdCP182ZtZfiKUBDMJ9Ismvc",
    authDomain: "iot-door-sensor.firebaseapp.com",
    databaseURL: "https://iot-door-sensor.firebaseio.com",
    projectId: "iot-door-sensor",
    storageBucket: "iot-door-sensor.appspot.com",
    messagingSenderId: "456975313157"
  },
  apiUrl: "http://localhost:3000/api/",
  uploadUrl: "http://localhost:3000/api/upload"
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
