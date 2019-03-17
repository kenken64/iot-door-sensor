'use strict';
require('events').EventEmitter.defaultMaxListeners = 0
require("dotenv").config();
const http = require("http"),
      admin = require("firebase-admin"),
      notification = require('./util/notification'),
      urlExists = require('url-exists-deep'),
      _ = require("lodash");

const BLYNK_API_URL = process.env.BLYNK_API_URL;
const sms = new notification.SMS();
const email = new notification.Email();
const credFile = process.env.FIREBASE_SVC_ACC_FILE || "./iot-door-sensor.json";
var serviceAccount = require(credFile);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

var db = admin.database();
var doorRef = db.ref("door");
var eventsRef = db.ref("events");

var sendOk = process.env.NOTIFICATION_ENABLE == "true";
var options = {headers: { "user-agent": "curl/7.47.0"}, agent: false, pool: {maxSockets: 100}};

async function pollVirtualPort2(value) {
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
              additionalMessage: additionalMessage
            });
          }else{
            updRef.update({
              battery: parseInt(JSON.parse(data)),
              additionalMessage: additionalMessage
            });
          }
          
        }
      });
    })
    .on("error", err => {
      console.error("Error: " + err.message);
    }).end();
}

async function pollVirtualPort1(value) {
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
                  sms.send(`ALERT ! ${
                    changedDoors.name
                  } is open. Please follow up with an inspection`,snapshot.val().mobileNo);
                  
                  email.send(
                    snapshot.val().email,
                    `${changedDoors.name} is OPEN`,
                    `<p>${changedDoors.name} is OPEN on ${new Date().toLocaleString("en-US", {
                      timeZone: "Asia/Singapore"
                    })}. Please follow up with an inspection</p>`);
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

function checkDoorSensors(){
  urlExists(`${BLYNK_API_URL}`)
    .then(function(response){
      if (response) {
        console.log("Url exists", response.href);
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
              arrOfDoors.forEach(async (door, index) => {
                await http.get(`${BLYNK_API_URL}${door.data.sensor_auth}/isHardwareConnected`, options,resp =>{
                let data = "";

                resp.on("data", chunk => {
                  data += chunk;
                });
          
                resp.on("end", async () => {
                    console.log(data);
                    try {
                      if(data === 'true'){
                        console.log("in....")
                        console.log("in...." + door.data.name)
                        let [stat1, stat2] = await Promise.all([
                          pollVirtualPort1(door),
                          pollVirtualPort2(door)
                        ]);
                        resp.removeAllListeners('data');
                      }else if(data ==='false'){
                        /*
                        var updRef = doorRef.child(door.key);
                        updRef.update({
                          battery: 0
                        });*/
                        resp.removeAllListeners('data');
                      }else{
                        console.info("Other protocol door!");
                        console.info("Sigfox/Lorawan sensor...");
                        resp.removeAllListeners('data');
                      }
                    }catch(error){
                      resp.removeAllListeners('data');
                      console.warn(error);
                    }
                  });
                })
                .on("error", err => {
                  console.error("Error: " + err.message);
                }).end();
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
    });
}

var intervalObj = setInterval(checkDoorSensors, parseInt(process.env.JOB_INTERVAL));