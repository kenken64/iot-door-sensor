'use strict';
require('events').EventEmitter.defaultMaxListeners = 0
require("dotenv").config();
const http = require("http"),
      admin = require("firebase-admin"),
      notification = require('./util/notification'),
      Agent = require('agentkeepalive'),
      kue = require('kue'),
      _ = require("lodash");

const BLYNK_API_URL = process.env.BLYNK_API_URL;
const sms = new notification.SMS();
const email = new notification.Email();
const credFile = process.env.FIREBASE_SVC_ACC_FILE || "./iot-door-sensor.json";
var serviceAccount = require(credFile);

const keepaliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
  forever: true
});

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

var db = admin.database();
var doorRef = db.ref("door");
var eventsRef = db.ref("events");

var sendOk = process.env.NOTIFICATION_ENABLE == "true";
var options = {agent: false};

async function pollVirtualPort2(value) {
  try{
    await http
      .get(`${BLYNK_API_URL}${value.data.sensor_auth}/get/V2`, options, resp => {
        let data = "";

        // A chunk of data has been recieved.
        resp.on("data", chunk => {
          data += chunk;
        });

        // The whole response has been received. Print out the result.
        resp.on("end", () => {
          if (typeof data !== "undefined") {
            if (data === "Invalid token.") return;
            var updRef = doorRef.child(value.key);
            let additionalMessage = "";
            if (parseInt(JSON.parse(data)) == 2) {
              additionalMessage = "Device probably went offline";
            }
            if(typeof(JSON.parse(data)) !== 'number'){
              updRef.update({
                battery: 100,
                locked: 0,
                additionalMessage: additionalMessage
              });
            }else{
              updRef.update({
                battery: parseInt(JSON.parse(data)),
                locked: 0,
                additionalMessage: additionalMessage
              });
            }
            
          }
        });
      })
      .on("error", err => {
        console.error("Error: " + err.message);
      }).end();
    }catch(error){
      console.warn(error);
    }
}

async function pollVirtualPort1(value) {
  try{
    await http
    .get(`${BLYNK_API_URL}${value.data.sensor_auth}/get/V1`, options,resp => {
      let data = "";

      // A chunk of data has been recieved.
      resp.on("data", chunk => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on("end", () => {
        if (typeof data !== "undefined") {
          if (data === "Invalid token.") return;
          if(typeof(doorRef) !=='undefined'){
            var updRef = doorRef.child(value.key);
            updRef.once(
              "value",
              function(snapshot) {
                if(!(_.isNil(snapshot)) && !(_.isNil(snapshot.val()))){
                  let doorRefVal = snapshot.val();
                  if(!(_.isNil(doorRefVal))){
                    let statusOfNightMare = "";
                    if (typeof doorRefVal.status === "undefined") {
                      statusOfNightMare = "Closed";
                    } else {
                      statusOfNightMare = doorRefVal.status;
                    }
    
                    if (parseInt(JSON.parse(data)) == 1) {
                      updRef.update({
                        status: "Open",
                        prev_status: statusOfNightMare
                      });
                    } else {
                      updRef.update({
                        status: "Closed",
                        prev_status: statusOfNightMare
                      });
                    }  
                  }
                }
              },
              function(errorObject) {
                console.error("The read failed: " + errorObject.code);
              }
            );
          }
        }
      });
    })
    .on("error", err => {
      console.error("Error: " + err.message);
    }).end(); // end V1 request
  }catch(error){
    console.warn(error);
  }
}

doorRef.on("child_changed", function(snapshot) {
  var changedDoors = snapshot.val();
  if (changedDoors.status === "Closed" && changedDoors.prev_status === "Open") {
    eventsRef.push({
      doorName: changedDoors.name,
      device: changedDoors.sensor_auth,
      type: "DoorClosed",
      message: "Door is closed",
      eventDatetime: new Date().getTime()
    });
    if (
      typeof changedDoors.guards !== "undefined" &&
      changedDoors.guards.length > 0
    ) {
      changedDoors.guards.forEach(guardVal => {
        db.ref("guard/" + guardVal)
          .once("value")
          .then(function(snapshot) {
            if (sendOk) {
                if (changedDoors.status !== changedDoors.prev_status) {
                    var updRef = doorRef.child(changedDoors.key);
                    sms.send(`INFO ! ${
                        changedDoors.name
                    } is closed on ${new Date().toLocaleString("en-US", {
                        timeZone: "Asia/Singapore"
                    })}`,snapshot.val().mobileNo);
                    email.send(
                        snapshot.val().email,
                        `${changedDoors.name} is CLOSED`,
                        `<p>${changedDoors.name} is CLOSED on ${new Date().toLocaleString("en-US", {
                        timeZone: "Asia/Singapore"
                    })}</p>`);
                    updRef.update({
                        locked: 0
                    });
                }
              }
          });
      });
    }
  } //status closed

  if (changedDoors.status === "Open" && changedDoors.prev_status === "Closed") {
    eventsRef.push({
      doorName: changedDoors.name,
      device: changedDoors.sensor_auth,
      type: "DoorOpen",
      message: "Door is open",
      eventDatetime: new Date().getTime()
    });
    if (
      typeof changedDoors.guards !== "undefined" &&
      changedDoors.guards.length > 0
    ) {
      changedDoors.guards.forEach(guardVal => {
        db.ref("guard/" + guardVal)
          .once("value")
          .then(function(snapshot) {
            if (sendOk) {
                if (changedDoors.status !== changedDoors.prev_status) {
                    var updRef = doorRef.child(changedDoors.key);
                    sms.send(`ALERT ! ${
                        changedDoors.name
                    } is open. Please follow up with an inspection`,snapshot.val().mobileNo);
                    
                    email.send(
                        snapshot.val().email,
                        `${changedDoors.name} is OPEN`,
                        `<p>${changedDoors.name} is OPEN on ${new Date().toLocaleString("en-US", {
                        timeZone: "Asia/Singapore"
                        })}. Please follow up with an inspection</p>`);
                    updRef.update({
                        locked: 0
                    });
                }
            }
          });
      });
    }
  }
  // check battery section
  if (
    (changedDoors.battery == 50 ||
    changedDoors.battery == 49 ||
    changedDoors.battery == 20 ||
    changedDoors.battery == 19 ||
    changedDoors.battery == 2 ||
    changedDoors.battery == 1 )
  ) {
    eventsRef.push({
      doorName: changedDoors.name,
      device: changedDoors.sensor_auth,
      type: "Battery",
      message: "Battery level : " + changedDoors.battery + "%",
      eventDatetime: new Date().getTime()
    });
    if (
      typeof changedDoors.guards !== "undefined" &&
      changedDoors.guards.length > 0
    ) {
      changedDoors.guards.forEach(guardVal => {
        db.ref("guard/" + guardVal)
          .once("value")
          .then(function(snapshot) {
            if (sendOk) {
                var updRef = doorRef.child(changedDoors.key);
                sms.send(`ALERT ! ${changedDoors.name} device battery is running low (${
                    changedDoors.battery
                }%). on ${new Date().toLocaleString("en-US", {
                    timeZone: "Asia/Singapore"
                })} ${UndefinedToEmptyStr(changedDoors.additionalMessage)}`,snapshot.val().mobileNo);
                
                email.send(
                    snapshot.val().email,
                    `${value.name} battery is running low on ${new Date().toLocaleString("en-US", {
                    timeZone: "Asia/Singapore"
                    })}`,
                    `<p>Device battery is running low (${
                    changedDoors.battery
                    }%). ${UndefinedToEmptyStr(
                    changedDoors.additionalMessage
                    )}</p>`);
                console.log("unlock ...");
                updRef.update({
                    locked: 0
                });
            }
          });
      });
    }
  }
});

function UndefinedToEmptyStr(val) {
  if (typeof val === "undefined") {
    return "";
  }
  return val;
}

function checkDoorSensors(done, door, index){
  try{
        http.get(`${BLYNK_API_URL}${door.data.sensor_auth}/isHardwareConnected`, options,resp =>{
        let data = "";

        resp.on("data", chunk => {
            data += chunk;
        });

        resp.on("end", async () => {
            try {
                if(data === 'true'){
                    var updRef = await doorRef.child(door.key);
                    console.log(updRef.locked);
                    if(typeof(updRef.locked ==='undefined') || updRef.locked == 0){
                        console.log("is unlocked");
                        updRef.update({
                            locked: 1
                        });
                        let [stat1, stat2] = await Promise.all([
                            pollVirtualPort1(door),
                            pollVirtualPort2(door)
                        ]);
                    }else{
                        console.log("blocked from checking the door");
                    }
                    resp.removeAllListeners('data');
                }else if(data ==='false'){
                    /*
                    var updRef = doorRef.child(door.key);
                    updRef.update({
                    battery: 0
                    });*/
                    resp.removeAllListeners('data');
                }else{
                    //console.info("Other protocol door!");
                    //console.info("Sigfox/Lorawan sensor...");
                    resp.removeAllListeners('data');
                }
            }catch(error){
                resp.removeAllListeners('data');
                console.warn(error);
            }
            done();
        });
        })
        .on("error", err => {
            console.error("Error: " + err.message);
        }).end();
    }catch(error){
        console.warn(error);
    }  
}

const queue = kue.createQueue();
console.log('WORKER CONNECTED');
queue.process('checkSensor', (job, done) => {
    //console.log("check ...");
    let door = job.data.door;
    let index = job.data.index;
    checkDoorSensors(done, JSON.parse(door), index); 
});
