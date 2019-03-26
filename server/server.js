'use strict';
require('events').EventEmitter.defaultMaxListeners = 100
require("dotenv").config();
const admin = require("firebase-admin"),
      urlExists = require('./util/url-exists-deep'),
      kue = require('kue'),
      async = require("async"),
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

const keepaliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
  forever: true
});

var options = {agent: false};

function createQueueJob(){
  let doorRef = db.ref("door");
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
              async.forEachOf(arrOfDoors, function (door, key, callback) {
                console.log(key);
                const used = process.memoryUsage().heapUsed / 1024 / 1024;
                console.log(`Server uses approximately ${Math.round(used * 100) / 100} MB`);
                counter++;
                console.log("counter > " + counter);
                if(counter == 100){
                  console.log("counter >> " + counter);
                  setTimeout(function(){
                    console.log("delaying .... before resume...")
                  },30000);
                  counter = 0;
                }
                const queue = kue.createQueue();
                //console.log('CHECK DOOR SENSORS CONNECTED');
                const job = queue.create('checkSensor', {
                  title: 'checkSensor',
                  door: JSON.stringify(door),
                  index: arrOfDoors.indexOf(door)
                })
                .removeOnComplete(true)
                .save((err) => {
                  if (err) {
                    console.log('CHECK DOOR SENSORS JOB SAVE FAILED');
                    doorRef = null;
                    return;
                  }
                  job.on('complete', (result) => {
                    console.log('<CHECK DOOR SENSORS JOB COMPLETE>');
                    //console.log(result);
                    if(indicator == 0){
                      if(intervalValue >= 14000){
                        indicator = 1;
                      }
                      intervalValue = intervalValue + 4000;
                    }else if(indicator == 1){
                      if(intervalValue <= 3000){
                        indicator = 0;
                      }
                      intervalValue = intervalValue - 4000;
                    }
                    console.log("intervalValue > " + intervalValue);
                    if(intervalValue > 0){
                      setTimeout(createQueueJob,intervalValue);
                    }
                    doorRef = null;
                    arrOfDoors = null;
                  });
                  job.on('failed', (errorMessage) => {
                    console.log('CHECK DOOR SENSORS JOB FAILED');
                    console.log(errorMessage);
                    doorRef = null;
                    return;
                  });
                });
              }, (err) => {
                console.warn(err);
                return; 
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
}

createQueueJob();
//var intervalObj = setInterval(createQueueJob, parseInt(process.env.JOB_INTERVAL));

function forceGC(){
   if(global.gc){
      global.gc();
   } else {
      console.warn('No GC hook! Start your program as `node --expose-gc file.js`.');
   }
}