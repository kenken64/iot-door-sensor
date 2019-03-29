'use strict';
require('events').EventEmitter.defaultMaxListeners = 0
require("dotenv").config();
const http = require("http"),
      admin = require("firebase-admin"),
      notification = require('./util/notification'),
      Agent = require('agentkeepalive'),
      kue = require('kue'),
      fs = require('fs'),
      colors = require('colors'),
      clonedeep = require('lodash.clonedeep'),
      async = require('async'),
      _ = require("lodash");

const BLYNK_API_URL = process.env.BLYNK_API_URL;
const credFile = process.env.FIREBASE_SVC_ACC_FILE || "./iot-door-sensor.json";
var serviceAccount = require(credFile);

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
var notificationRef = db.ref("notification");
var eventsRef = db.ref("events");

var sendOk = process.env.NOTIFICATION_ENABLE == "true";
var options = {agent: false};

function pollVirtualPort2(value) {
  var p2 = new Promise(async(resolve, reject) => {
    try{
      console.log(pollVirtualPort2);
      let req = await http.get(`${BLYNK_API_URL}${value.data.sensor_auth}/get/V2`, options, resp => {
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
              resolve(1);
            }
          });
        });
  
        req.on("error", err => {
          console.error("Error: pollVirtualPort2 " + err.message);
          reject(err);
        }).end(); 
        
        req.end();
      }catch(error){
        console.warn("WARNING ERROR>" +  error);
        reject(error);
      }
  });

  return p2;
}

function pollVirtualPort1(value) {
  var p1 = new Promise(async(resolve, reject) => {
    try{
      console.log("pollVirtualPort1");
      console.log("pollVirtualPort1" + value.data.sensor_auth);
      console.log(`${BLYNK_API_URL}${value.data.sensor_auth}/get/V1`);
      let req = await http.get(`${BLYNK_API_URL}${value.data.sensor_auth}/get/V1`, options,resp => {
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
                async function(snapshot) {
                  if(!(_.isNil(snapshot)) && !(_.isNil(snapshot.val()))){
                    let doorRefVal = snapshot.val();
                    if(!(_.isNil(doorRefVal))){
                      if (parseInt(JSON.parse(data)) == 1) {
                        if(doorRefVal.status == 'Closed' 
                        && doorRefVal.prev_status == 'Open' 
                        ){
                          setTimeout(()=>console.log(""),3000);
                          doorRefVal.status = "Open";
                          doorRefVal.prev_status = "Closed";
                          /*
                          const copied = {
                            name: doorRefVal.name,
                            sensor_auth: doorRefVal.sensor_auth,
                            battery: doorRefVal.battery,
                            locked: doorRefVal.locked,
                            additionalMessage: doorRefVal.additionalMessage,
                            guards: doorRefVal.guards,
                            status: doorRefVal.status,
                            prev_status: doorRefVal.prev_status,
                            workerName: doorRefVal.workerName
                          };*/
                          let newObj = {};
                          let copied = Object.assign(newObj, doorRefVal);
                          notificationRef.push(copied);
                          updRef.update({
                            status : "Open",
                            prev_status : "Closed"
                          });
                          
                        }
                      } else {
                        if(doorRefVal.status == 'Open' 
                        && doorRefVal.prev_status == 'Closed' 
                        ){
                          setTimeout(()=>console.log(""),3000);
                          doorRefVal.status = "Closed";
                          doorRefVal.prev_status = "Open";
                          /*
                          const copied = {
                            name: doorRefVal.name,
                            status: doorRefVal.status,
                            sensor_auth: doorRefVal.sensor_auth,
                            battery: doorRefVal.battery,
                            locked: doorRefVal.locked,
                            additionalMessage: doorRefVal.additionalMessage,
                            guards: doorRefVal.guards,
                            prev_status: doorRefVal.prev_status,
                            workerName: doorRefVal.workerName
                          };*/
                          let newObj = {};
                          let copied = Object.assign(newObj, doorRefVal);
                          notificationRef.push(copied);
                          updRef.update({
                            status : "Closed",
                            prev_status : "Open"
                          });
                        }
                      }  
                    }
                    resolve(doorRefVal);
                  }
                  
                },
                function(errorObject) {
                  console.error("The read failed: " + errorObject.code);
                  reject(errorObject);
                }
              );
            }
          }
        });
      });
  
      req.on("error", err => {
        console.error("Error: pollVirtualPort2 " + err.message);
        reject(err);
      }).end(); 
      
      req.end(); // end V1 request
    }catch(error){
      console.warn(error);
      req.end();
      reject(error);
    }
  });

  return p1;
}

notificationRef.on("child_added", function(snapshot) {
  
  console.log(`%c ________________________________________
< mooooooooooooooooooooooooooooooooooooo >
 ----------------------------------------
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
|| ||`, "font-family:monospace".bgCyan);
  async.waterfall([
      function(callback) {
        var changedDoors = snapshot.val();
        console.log("changedDoors.workerName")
        if(changedDoors.workerName === processWorkerName){
          console.log(`CORRECT SAME WORKER 11! > ${processWorkerName} ${changedDoors.sensor_auth}`.bgRed);
          if ((changedDoors.status === "Closed" && changedDoors.prev_status === "Open")) {
            console.log(`CORRECT SAME WORKER !111 > ${processWorkerName} ${changedDoors.sensor_auth}`.bgRed);
            console.log(`CORRECT SAME WORKER !1111111 > ${changedDoors.guards}`.bgRed);
            eventsRef.push({
              doorName: changedDoors.name,
              device: changedDoors.sensor_auth,
              type: "DoorClosed",
              message: "Door is closed",
              eventDatetime: new Date().getTime()
            });
            if (
              typeof changedDoors.guards !== "undefined" ||
              (changedDoors.guards.length ||
              changedDoors.guards.length > 0)
              ) {
              console.log(`GUARDS ! CORRECT SAME WORKER ! 1111> ${processWorkerName} ${changedDoors.sensor_auth}`.bgRed);
              console.log(changedDoors.guards.length);
              changedDoors.guards.forEach(guardVal => {
                db.ref("guard/" + guardVal)
                  .once("value")
                  .then(async function(snapshot2) {
                    if (sendOk) {
                        console.log(`CORRECT SAME WORKER ! 1111> ${processWorkerName} ${changedDoors.sensor_auth}`.bgRed);
                        if (await changedDoors.status !== changedDoors.prev_status) {
                          if(await changedDoors.locked == 0){
                            setTimeout(()=>console.log(""),1000);
                            console.log(`CORRECT SAME WORKER ! 112211> ${processWorkerName} ${changedDoors.sensor_auth}`.bgRed);
                            let key = snapshot.key;
                            let updRef = doorRef.child(key);
                            await updRef.update({
                              locked: 1
                            });
                            let sms = new notification.SMS();
                            let email = new notification.Email();
                            console.log(`Closed - Open`.rainbow);
                            console.log(`${snapshot2.val().mobileNo}`.rainbow);
                            console.log(`${snapshot2.val().email}`.rainbow);
                            console.log(`SMS${processWorkerName}`.bgBlue);
                            console.log(`EMAIL${processWorkerName}`.bgBlue);
                            console.log(`WHATSAPP${processWorkerName}`.bgBlue);
                            sms.send(`INFO ! ${
                                changedDoors.name
                            } is closed on ${new Date().toLocaleString("en-US", {
                                timeZone: "Asia/Singapore"
                            })}`,snapshot2.val().mobileNo);
                            console.log("SEND SMS" + processWorkerName);
                            email.send(
                                snapshot2.val().email,
                                `${changedDoors.name} is CLOSED`,
                                `<p>${changedDoors.name} is CLOSED on ${new Date().toLocaleString("en-US", {
                                timeZone: "Asia/Singapore"
                            })}</p>`);
                            console.log(`SMS${processWorkerName}`.bgBlue);
                            console.log(`EMAIL${processWorkerName}`.bgBlue);
                            console.log(`WHATSAPP${processWorkerName}`.bgBlue);
                            console.log(`SEND EMAIL ${processWorkerName} ${changedDoors.sensor_auth}`.blue);
                            await updRef.update({
                              locked: 0,
                            });
                          }
                        }
                      }
                  });
              });
            }
            let key = snapshot.key;
            let notifyRef = notificationRef.child(key);
            notifyRef.remove();
          } //status closed
        
          if ((changedDoors.status === "Open" && changedDoors.prev_status === "Closed")) {
            eventsRef.push({
              doorName: changedDoors.name,
              device: changedDoors.sensor_auth,
              type: "DoorOpen",
              message: "Door is open",
              eventDatetime: new Date().getTime()
            });
            if (
              typeof changedDoors.guards !== "undefined" ||
              (changedDoors.guards.length ||
              changedDoors.guards.length > 0)
            ) {
              console.log(`CORRECT SAME WORKER !2 > ${processWorkerName} ${changedDoors.sensor_auth}`.bgRed);
              changedDoors.guards.forEach(guardVal => {
                db.ref("guard/" + guardVal)
                  .once("value")
                  .then(async function(snapshot2) {
                    if (sendOk) {
                        if (await changedDoors.status !== changedDoors.prev_status) {
                            if(changedDoors.locked == 0 ){
                              let key = snapshot.key;
                              let updRef = doorRef.child(key);
                              console.log(`CORRECT SAME WORKER !332223 > ${processWorkerName} ${changedDoors.sensor_auth}`.bgRed);
                              console.log(`CORRECT SAME WORKER !333 > ${processWorkerName} ${changedDoors.sensor_auth}`.bgRed);
          
                              updRef.update({
                                locked: 1
                              });
                              let sms = new notification.SMS();
                              let email = new notification.Email();
                              console.log(`Open - Closed`.rainbow);
                              console.log(`${snapshot2.val().mobileNo}`.rainbow);
                              console.log(`${snapshot2.val().email}`.rainbow);
                              console.log(`SMS${processWorkerName}`.bgBlue);
                              console.log(`EMAIL${processWorkerName}`.bgBlue);
                              console.log(`WHATSAPP${processWorkerName}`.bgBlue);
                              sms.send(`ALERT ! ${
                                  changedDoors.name
                              } is open. Please follow up with an inspection. ${new Date().toLocaleString("en-US", {timeZone: "Asia/Singapore"
                                })}`,snapshot2.val().mobileNo);
                              console.log("SEND SMS" + processWorkerName);
                              email.send(
                                  snapshot2.val().email,
                                  `${changedDoors.name} is OPEN`,
                                  `<p>${changedDoors.name} is OPEN on ${new Date().toLocaleString("en-US", {
                                  timeZone: "Asia/Singapore"
                                  })}. Please follow up with an inspection</p>`);
                              console.log("SEND EMAIL" + processWorkerName);
                              console.log(`SMS${processWorkerName}`.bgBlue);
                              console.log(`EMAIL${processWorkerName}`.bgBlue);
                              console.log(`WHATSAPP${processWorkerName}`.bgBlue);
                              updRef.update({
                                locked: 0,
                              });
                            }
                        }
                    }
                  });
              });
            }
            let key = snapshot.key;
            let notifyRef = notificationRef.child(key);
            notifyRef.remove();
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
            console.log("Bettery health check ....")
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
        callback(null, 'send notification');
      }
  ],
  // optional callback
  function(err, results) {
      // results is now equal to ['one', 'two']
  });

  
});

function UndefinedToEmptyStr(val) {
  if (typeof val === "undefined") {
    return "";
  }
  return val;
}

function checkDoorSensors(door, done){
  var p3 = new Promise(async(resolve, reject) => {
    try{
        let req = await http.get(`${BLYNK_API_URL}${door.data.sensor_auth}/isHardwareConnected`, options,resp =>{
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
                          Promise.all([
                              pollVirtualPort1(door),
                              pollVirtualPort2(door)
                          ]).then(function(values) {
                            console.log("><><><" + JSON.stringify(values));
                            resolve(values);
                            done();
                          }).catch(err=>{
                            console.log(err);
                            done();
                          });
                        }
                      }
                    );
                    
                    resp.removeAllListeners('data');
                  }else if(data ==='false'){
                      resp.removeAllListeners('data');
                      resolve(data);
                      done();
                  }else{
                      resp.removeAllListeners('data');
                      resolve(data);
                      done();
                  }
              }catch(error){
                  resp.removeAllListeners('data');
                  console.warn(error);
                  done();
                  reject(error);
              }
          });
        });

        req.on("error", err => {
            console.error("Error: checkDoorSensors " + err.message);
            done();
            reject(err);
        });
        
        req.end();
    }catch(error){
        console.warn(error);
        done();
        reject(error);
    }  
  });
  return p3;
}

const queue = kue.createQueue();
console.log('Worker for door/window sensors connected.');
queue.process('checkSensor', (job, done) => {
    let door = job.data.door;
    let rawdata = fs.readFileSync('./worker-config.json');  
    let workerConfig = JSON.parse(rawdata);
    workerConfig.forEach((data)=>{
      let workername = data.workerName;
      console.log("1WORKER NAME ??" + workername);
      if(processWorkerName === workername){
          console.log("2MATCH !??" + workername);
          let doorsInWorker = data.doors;
          let doorObj = JSON.parse(door);
          console.log("3MATCH !??" + doorsInWorker);
          console.log("4MATCH !??" + doorsInWorker.includes(doorObj.data.sensor_auth));
          if(doorsInWorker.includes(doorObj.data.sensor_auth)){
              console.log("5WORKER NAME ??" + processWorkerName);
              console.log("6DOOR AUTH ??" + doorObj.data.sensor_auth);
              checkDoorSensors(doorObj, done).then((result)=>{
                console.log(result);
              }).catch(err=>console.warn(err));
          }else{
              done();
          }
      }
    });
    //global.gc();
    const used = process.memoryUsage().heapUsed / 1024 / 1024;
    //console.log(`Worker uses approximately ${Math.round(used * 100) / 100} MB`);
});