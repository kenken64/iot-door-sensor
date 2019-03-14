'use strict';

require("dotenv").config();
const http = require("http");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const _ = require("lodash");
const BLYNK_API_URL = process.env.BLYNK_API_URL;
var accountSid = process.env.TWILIO_SSID;
var authToken = process.env.TWILIO_AUTH_TOKEN;

var client = new twilio(accountSid, authToken);

const credFile = process.env.FIREBASE_SVC_ACC_FILE || "./iot-door-sensor.json";
var serviceAccount = require(credFile);
const fromEmail = process.env.SMTP_GMAIL_ACC;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

var db = admin.database();
var doorRef = db.ref("door");
var eventsRef = db.ref("events");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: fromEmail,
    pass: process.env.SMTP_GMAIL_PASSWORD
  }
});

var sendOk = process.env.NOTIFICATION_ENABLE == "true";

function sendEmail(fromEmail, toEmail, subject, htmlcontent) {
  const mailOptions = {
    from: fromEmail, // sender address
    to: toEmail, // list of receivers
    subject: subject, // Subject line
    html: htmlcontent
  };
  transporter.sendMail(mailOptions, function(err, info) {
    if (err) console.log(err);
    else console.log(info);
  });
}

async function pollVirtualPort2(value) {
  await http
    .get(`${BLYNK_API_URL}${value.data.sensor_auth}/get/V2`, resp => {
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
    });
}

async function pollVirtualPort1(value) {
  await http
    .get(`${BLYNK_API_URL}${value.data.sensor_auth}/get/V1`, resp => {
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
    }); // end V1 request
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
                client.messages
                  .create({
                    body: `INFO ! ${
                      changedDoors.name
                    } is closed on ${new Date().toLocaleString("en-US", {
                      timeZone: "Asia/Singapore"
                    })}`,
                    to: snapshot.val().mobileNo, // Text this number
                    from: process.env.TWILIO_NUMBER // From a valid Twilio number
                  })
                  .then(message => {
                    sendEmail(
                      fromEmail,
                      snapshot.val().email,
                      `${changedDoors.name} is CLOSED`,
                      `<p>${changedDoors.name} is CLOSED on ${new Date().toLocaleString("en-US", {
                        timeZone: "Asia/Singapore"
                      })}</p>`
                    );
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
                client.messages
                  .create({
                    body: `ALERT ! ${
                      changedDoors.name
                    } is open please follow up with an inspection`,
                    to: snapshot.val().mobileNo, // Text this number
                    from: process.env.TWILIO_NUMBER // From a valid Twilio number
                  })
                  .then(message => {
                    sendEmail(
                      fromEmail,
                      snapshot.val().email,
                      `${changedDoors.name} is OPEN`,
                      `<p>${changedDoors.name} is OPEN on ${new Date().toLocaleString("en-US", {
                        timeZone: "Asia/Singapore"
                      })}</p>`
                    );
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
    changedDoors.battery == 1 ||
    changedDoors.battery == 0)
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
              client.messages
                .create({
                  body: `ALERT ! ${changedDoors.name} device battery is running low (${
                    changedDoors.battery
                  }%). ${UndefinedToEmptyStr(changedDoors.additionalMessage)}`,
                  to: snapshot.val().mobileNo, // Text this number
                  from: process.env.TWILIO_NUMBER // From a valid Twilio number
                })
                .then(message => {
                  sendEmail(
                    fromEmail,
                    snapshot.val().email,
                    `${value.name} battery is running low on ${new Date().toLocaleString("en-US", {
                      timeZone: "Asia/Singapore"
                    })}`,
                    `<p>Device battery is running low (${
                      changedDoors.battery
                    }%). ${UndefinedToEmptyStr(
                      changedDoors.additionalMessage
                    )}</p>`
                  );
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

setInterval(() => {
  doorRef.on(
    "value",
    async function(snapshot) {
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
          await http.get(`${BLYNK_API_URL}${door.data.sensor_auth}/isHardwareConnected`, resp =>{
          let data = "";

          resp.on("data", chunk => {
            data += chunk;
          });
    
          resp.on("end", () => {
              var updRef = doorRef.child(door.key);
              if(data === 'true'){
                pollVirtualPort1(door);
                pollVirtualPort2(door);
              }else if(data ==='false'){
                updRef.update({
                  battery: 0
                });
              }else{
                console.log("Other protocol door!");
                // TODO 
              }
            });
          })
          .on("error", err => {
            console.error("Error: " + err.message);
          });
        });
      }
    },
    function(errorObject) {
      console.error("The read failed: " + errorObject.code);
    }
  );
}, parseInt(process.env.JOB_INTERVAL));
