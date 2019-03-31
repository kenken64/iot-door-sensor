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
var doorRef = db.ref("door");
var j = schedule.scheduleJob(process.env.CLEAN_UP_SCHEDULE, function(){
    eventsRef.orderByValue().once('value', (snapshot) => {
        snapshot.forEach((child) => {
            child.ref.set(null);
        });
    });
    doorRef.orderByValue().once('value', (snapshot) => {
        snapshot.forEach((child) => {
            if(typeof(child.val().name) === 'undefined'){
                child.ref.set(null);
            }
        });
    });
});