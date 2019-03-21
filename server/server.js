'use strict';
require('events').EventEmitter.defaultMaxListeners = 0
require("dotenv").config();
const admin = require("firebase-admin"),
      urlExists = require('./util/url-exists-deep'),
      kue = require('kue'),
      Agent = require('agentkeepalive'),
      _ = require("lodash");

const BLYNK_API_URL = process.env.BLYNK_API_URL;
const credFile = process.env.FIREBASE_SVC_ACC_FILE || "./iot-door-sensor.json";
var serviceAccount = require(credFile);
var indicator = 0;
var counter = 0;
var intervalValue = parseInt(process.env.JOB_INTERVAL);
  
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

var db = admin.database();
var doorRef = db.ref("door");

const keepaliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
  forever: true
});

var options = {agent: false};

function createQueueJob(){
  urlExists(`${BLYNK_API_URL}`, options)
    .then(function(response){
      if (response) {
        //console.log("Url exists", response.href);
        doorRef.on(
          "value",
          function(snapshot) {
            let arrOfDoors = [];
            if(!(_.isNil(snapshot)) && !(_.isNil(snapshot.val()))){
              for (let k of Object.keys(snapshot.val())) {
                let d = {
                  key: k,
                  data: snapshot.val()[k]
                };
                arrOfDoors.push(d);
              }
              arrOfDoors.forEach((door, index) => {
                const queue = kue.createQueue();
                //console.log('CHECK DOOR SENSORS CONNECTED');
                const job = queue.create('checkSensor', {
                  title: 'checkSensor',
                  door: JSON.stringify(door),
                  index: index
                })
                .removeOnComplete(true)
                .save((err) => {
                  if (err) {
                    console.log('CHECK DOOR SENSORS JOB SAVE FAILED');
                    return;
                  }
                  job.on('complete', (result) => {
                    //console.log('CHECK DOOR SENSORS JOB COMPLETE');
                    //console.log(result);
                  });
                  job.on('failed', (errorMessage) => {
                    console.log('CHECK DOOR SENSORS JOB FAILED');
                    console.log(errorMessage);
                  });
                });
              });
            }
          },
          function(errorObject) {
            console.error("The read failed: " + errorObject.code);
          }
        );
      } else {
        console.log("Blynk does not exists!");
      }
    }).catch(error=> console.warn(error));

  if(indicator == 0){
    if(intervalValue > 12000){
      indicator = 1;
    }
    intervalValue = intervalValue + 1000;
  }else if(indicator == 1){
    if(intervalValue < 3000){
      indicator = 0;
    }
    intervalValue = intervalValue - 1000;
  }
  console.log("intervalValue > " + intervalValue);
  counter++;
  console.log("counter > " + counter);
  setInterval(createQueueJob,intervalValue);
}

createQueueJob();
//var intervalObj = setInterval(createQueueJob, parseInt(process.env.JOB_INTERVAL));