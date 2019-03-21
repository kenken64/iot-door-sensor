'use strict';
require('events').EventEmitter.defaultMaxListeners = 0
require("dotenv").config();
const http = require("http"),
      admin = require("firebase-admin"),
      notification = require('./util/notification'),
      Agent = require('agentkeepalive'),
      kue = require('kue'),
      fs = require('fs'),
      nano = require('nanoseconds'),
      _ = require("lodash");

const BLYNK_API_URL = process.env.BLYNK_API_URL;
const credFile = process.env.FIREBASE_SVC_ACC_FILE || "./iot-door-sensor.json";
var serviceAccount = require(credFile);

const keepaliveAgent = new Agent({
  maxSockets: 100,
  maxFreeSockets: 10,
  timeout: 60000, // active socket keepalive for 60 seconds
  freeSocketTimeout: 30000, // free socket keepalive for 30 seconds
  forever: true
});

var processWorkerName = "";

process.argv.forEach((val, index) => {
  if(index ==2){
    let workernameArr = val.split('=');
    processWorkerName = workernameArr[1];
  }
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

function pollVirtualPort2(value) {
  try{
    console.log(pollVirtualPort2);
    let req = http.get(`${BLYNK_API_URL}${value.data.sensor_auth}/get/V2`, options, resp => {
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
      });

      req.on("error", err => {
        console.error("Error: pollVirtualPort2 " + err.message);
        return;
      })
      
      req.end();
    }catch(error){
      console.warn(error);
      return;
    }
}

function pollVirtualPort1(value) {
  try{
    console.log("pollVirtualPort1");
    let req = http.get(`${BLYNK_API_URL}${value.data.sensor_auth}/get/V1`, options,resp => {
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
            console.log(JSON.parse(data));
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
    });

    req.on("error", err => {
      console.error("Error: pollVirtualPort2 " + err.message);
      return;
    })
    
    req.end(); // end V1 request
  }catch(error){
    console.warn(error);
    return;
  }
}

doorRef.on("child_changed", function(snapshot) {
  var changedDoors = snapshot.val();
  
  if(changedDoors.workerName === processWorkerName && changedDoors.locked == 0){
    console.log("CORRECT SAME WORKER ! > " + processWorkerName);
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
                      let sms = new notification.SMS();
                      let email = new notification.Email();
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
                      let sms = new notification.SMS();
                      let email = new notification.Email();
                      sms.send(`ALERT ! ${
                          changedDoors.name
                      } is open. Please follow up with an inspection. ${new Date().toLocaleString("en-US", {timeZone: "Asia/Singapore"
                        })}`,snapshot.val().mobileNo);
                      
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
                let sms = new notification.SMS();
                let email = new notification.Email();
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
  }
});

function UndefinedToEmptyStr(val) {
  if (typeof val === "undefined") {
    return "";
  }
  return val;
}

function checkDoorSensors(done, door, workerName){
  try{
        let req = http.get(`${BLYNK_API_URL}${door.data.sensor_auth}/isHardwareConnected`, options,resp =>{
          let data = "";

          resp.on("data", chunk => {
              data += chunk;
          });

          resp.on("end", () => {
              try {
                  if(data === 'true'){
                    var updRef = doorRef.child(door.key);
                    updRef.once(
                      "value",
                      async function(snapshot) {
                        if(!(_.isNil(snapshot)) && !(_.isNil(snapshot.val()))){
                          let doorRefVal = snapshot.val();
                          let lockedtimstamp = new Date().getTime();
                          console.log(">>> lockedtimstamp !" + lockedtimstamp);
                          console.log(">>> doorRefVal.lockedDate !" + doorRefVal.lockedDate);
                          console.log(">>> doorRefVal.lockedDate ?" + (doorRefVal.lockedDate < lockedtimstamp));
                          console.log(">>> doorRefVal.lockedDate ?" + (lockedtimstamp - doorRefVal.lockedDate));  
                          if(doorRefVal.lockedDate < lockedtimstamp){
                            updRef.update({
                              lockedDate: admin.database.ServerValue.TIMESTAMP,
                              workerName: workerName
                            });
                            console.log(">>> IS NOT LOCK !" + doorRefVal.locked+ ' ' + door.key);
                            let [pollStat1, pollStat2] = await Promise.all([
                                pollVirtualPort1(door),
                                pollVirtualPort2(door)
                            ]);
                          }else{
                            console.log(">>> IS LOCKED !!" + doorRefVal.locked + ' '+ door.key);
                          }
                        }
                      }
                    );
                    
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
                  done();
              }
              //console.log("done ...");
              done();
          });
        });

        req.on("error", err => {
            console.error("Error: checkDoorSensors " + err.message);
            done();
            return;
        });
        
        req.end();
    }catch(error){
        console.warn(error);
        done();
        return;
    }  
}

const queue = kue.createQueue();
console.log('WORKER CONNECTED');
queue.process('checkSensor', (job, done) => {
    let door = job.data.door;
    let rawdata = fs.readFileSync('./worker-config.json');  
    let workerConfig = JSON.parse(rawdata);
    workerConfig.forEach((data)=>{
        let workername = data.workerName;
        
        if(processWorkerName === workername){
            let doorsInWorker = data.doors;
            let doorObj = JSON.parse(door);
            if(doorsInWorker.includes(doorObj.data.sensor_auth)){
                console.log("WORKER NAME ??" + processWorkerName);
                console.log("DOOR AUTH ??" + doorObj.data.sensor_auth);
                checkDoorSensors(done, doorObj, processWorkerName); 
            }else{
                done();
            }
        }
    });
});
