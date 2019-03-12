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
var eventsHistoryRef = db.ref("events-history");
eventsRef.orderByChild("eventDatetime").on("child_added", function(snapshot) {
    eventsHistoryRef.child(snapshot.key).set(snapshot.val());
});