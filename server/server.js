'use strict';

require("dotenv").config();
const http = require("http");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const _ = require("lodash");
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
    console.log("EMAIL SENT!");
  });
}

async function pollVirtualPort2(value) {
  await http
    .get(`http://blynk-cloud.com/${value.data.sensor_auth}/get/V2`, resp => {
      let data = "";

      // A chunk of data has been recieved.
      resp.on("data", chunk => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on("end", () => {
        if (typeof data !== "undefined") {
          if (data === "Invalid token.") return;
          console.log(
            "pollVirtualPort2 : battery level > " + JSON.parse(data) + "%"
          );
          var updRef = doorRef.child(value.key);
          let additionalMessage = "";
          if (parseInt(JSON.parse(data)) == 2) {
            additionalMessage = "Device probably went offline";
          }
          updRef.update({
            battery: parseInt(JSON.parse(data)),
            additionalMessage: additionalMessage
          });
        }
      });
    })
    .on("error", err => {
      console.log("Error: " + err.message);
    });
}

async function pollVirtualPort1(value) {
  await http
    .get(`http://blynk-cloud.com/${value.data.sensor_auth}/get/V1`, resp => {
      let data = "";

      // A chunk of data has been recieved.
      resp.on("data", chunk => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on("end", () => {
        console.log("pollVirtualPort1 : > " + data);
        console.log("pollVirtualPort1 : > " + value.data.sensor_auth);
        if (typeof data !== "undefined") {
          if (data === "Invalid token.") return;
          console.log("pollVirtualPort1 : > " + JSON.parse(data));
          if(typeof(doorRef) !=='undefined'){
            console.log("doorRef : > " + doorRef);
            console.log("value.key : > " + value.key);
            var updRef = doorRef.child(value.key);
            updRef.once(
              "value",
              function(snapshot) {
                console.log("111");
                if(!(_.isNil(snapshot)) && !(_.isNil(snapshot.val()))){
                  console.log("1112");
                  let doorRefVal = snapshot.val();
                  if(!(_.isNil(doorRefVal))){
                    console.log("1www11");
                    console.log(doorRefVal);
                    let statusOfNightMare = "";
                    if (typeof doorRefVal.status === "undefined") {
                      statusOfNightMare = "Closed";
                    } else {
                      statusOfNightMare = doorRefVal.status;
                      console.log(
                        "ARE WE FLIPPING THE STATUS > " + statusOfNightMare
                      );
                      console.log(
                        "ARE WE FLIPPING THE STATUS CURRENT > " + doorRefVal.status
                      );
                      console.log(
                        "ARE WE FLIPPING THE STATUS PREV > " + doorRefVal.prev_status
                      );
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
                console.log("The read failed: " + errorObject.code);
              }
            );
          }
        }
      });
    })
    .on("error", err => {
      console.log("Error: " + err.message);
    }); // end V1 request
}

doorRef.on("child_changed", function(snapshot) {
  console.log(snapshot.val());
  var changedDoors = snapshot.val();
  console.log("The updated door guards is " + changedDoors.guards);
  if (changedDoors.status === "Closed" && changedDoors.prev_status === "Open") {
    eventsRef.push({
      doorName: changedDoors.name,
      device: changedDoors.sensor_auth,
      type: "DoorClosed",
      message: "Door is closed",
      eventDatetime: new Date().getTime()
    });
    console.log(typeof changedDoors.guards);
    if (
      typeof changedDoors.guards !== "undefined" &&
      changedDoors.guards.length > 0
    ) {
      changedDoors.guards.forEach(guardVal => {
        console.log("GUARD REF ? " + guardVal);
        db.ref("guard/" + guardVal)
          .once("value")
          .then(function(snapshot) {
            console.log("GUARD REF >>>" + snapshot.val());
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
                    console.log("SMS sent : > " + message.sid);
                    console.log(`SEND SMS DOOR CLOSED!  ${changedDoors.name}`);
                    sendEmail(
                      fromEmail,
                      snapshot.val().email,
                      `${changedDoors.name} is CLOSED`,
                      `<p>${changedDoors.name} is CLOSED on ${new Date().toLocaleString("en-US", {
                        timeZone: "Asia/Singapore"
                      })}</p>`
                    );
                    console.log(
                      `SEND EMAIL DOOR CLOSED!  ${changedDoors.name}`
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
    console.log(process.env.TWILIO_NUMBER);
    if (
      typeof changedDoors.guards !== "undefined" &&
      changedDoors.guards.length > 0
    ) {
      changedDoors.guards.forEach(guardVal => {
        console.log("GUARD guardVal ? " + guardVal);
        db.ref("guard/" + guardVal)
          .once("value")
          .then(function(snapshot) {
            console.log("GUARD REF >>>" + snapshot.val());
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
                    console.log("SMS sent : > " + message.sid);
                    console.log(`SEND SMS DOOR OPEN!  ${changedDoors.name}`);
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
  console.log(" BATTERY ! changedDoors.battery" + changedDoors.battery);
  if (
    changedDoors.battery == 50 ||
    changedDoors.battery == 49 ||
    changedDoors.battery == 20 ||
    changedDoors.battery == 19 ||
    changedDoors.battery == 2 ||
    changedDoors.battery == 1 ||
    changedDoors.battery == 0
  ) {
    eventsRef.push({
      doorName: changedDoors.name,
      device: changedDoors.sensor_auth,
      type: "Battery",
      message: "Battery level : " + changedDoors.battery + "%",
      eventDatetime: new Date().getTime()
    });
    console.log("send battery notification");
    if (
      typeof changedDoors.guards !== "undefined" &&
      changedDoors.guards.length > 0
    ) {
      changedDoors.guards.forEach(guardVal => {
        db.ref("guard/" + guardVal)
          .once("value")
          .then(function(snapshot) {
            console.log("GUARD REF >>>" + snapshot.val());
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
                  console.log("SMS : " + message.sid);
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
    function(snapshot) {
      let arrOfDoors = [];
      if(!(_.isNil(snapshot)) && !(_.isNil(snapshot.val()))){
        console.log("xxx" + _.isNil(snapshot));
        console.log("xxx" + _.isNil(snapshot.val()));
        for (let k of Object.keys(snapshot.val())) {
          let d = {
            key: k,
            data: snapshot.val()[k]
          };
          arrOfDoors.push(d);
        }
        arrOfDoors.forEach((door, index) => {
          pollVirtualPort1(door);
          pollVirtualPort2(door);
        });
      }
    },
    function(errorObject) {
      console.log("The read failed: " + errorObject.code);
    }
  );
}, parseInt(process.env.JOB_INTERVAL));
