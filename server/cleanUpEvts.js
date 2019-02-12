require("dotenv").config();
const admin = require("firebase-admin");
const _ = require("lodash");
var schedule = require('node-schedule');

const credFile = process.env.FIREBASE_SVC_ACC_FILE || "./iot-door-sensor.json";
var serviceAccount = require(credFile);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DB_URL
});

var db = admin.database();
var eventsRef = db.ref("events");
console.log(process.env.CLEAN_UP_SCHEDULE);
var j = schedule.scheduleJob(process.env.CLEAN_UP_SCHEDULE, function(){
    console.log('Clean up events records...');
    eventsRef.orderByValue().once('value', (snapshot) => {
        snapshot.forEach((child) => {
            console.log(child);
            child.ref.set(null);
        });
    });
});
console.log(j);