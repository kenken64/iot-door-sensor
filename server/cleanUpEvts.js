require("dotenv").config();
const admin = require("firebase-admin");
const _ = require("lodash");

const credFile = process.env.FIREBASE_SVC_ACC_FILE || "./iot-door-sensor.json";
var serviceAccount = require(credFile);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

var db = admin.database();
var eventsRef = db.ref("events");
eventsRef.once('value', (snapshot) => {
    snapshot.forEach((child) => {
        console.log(child);
        child.ref.set(null);
    });
});
