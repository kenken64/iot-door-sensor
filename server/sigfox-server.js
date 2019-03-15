'use strict';
require("dotenv").config();
console.log("Sigfox device server");
const express = require("express"),
  bodyParser = require("body-parser"),
  admin = require("firebase-admin"),
  structuredMessage = require("./structuredMessage"),
  _ = require("lodash"),
  notification = require('./util/notification'),
  http = require("http"),
  path = require("path");

const BLYNK_API_URL = process.env.BLYNK_API_URL;
var app = express();
const credFile = process.env.FIREBASE_SVC_ACC_FILE || "./iot-door-sensor.json";
var serviceAccount = require(credFile);
const sms = new notification.SMS();
const email = new notification.Email();
var sendOk = process.env.NOTIFICATION_ENABLE == "true";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

var db = admin.database();
var doorRef = db.ref("door");
// init router

app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.static(path.join(__dirname, "public")));

var router = express.Router();

app.use("/", router);

router.post("/sigfox-callback-data", (req, res, next) => {
  console.log("/sigfox-callback-data");
  //console.log(req);
  console.log(req.body.data);
  if (!req.body || !req.body.data)
    res.status(500).json(Object.assign({}, req.body));
  try {
    const decodedData = structuredMessage.decodeMessage(req.body.data);
    console.log(decodedData);
    const result = Object.assign({}, req.body, decodedData);
    console.log(">>>>" + result.id);
    console.log(">>>>" + JSON.stringify(result));
    doorRef.once(
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
                  
                }else if(data ==='false'){
                  updRef.update({
                    battery: 0
                  });
                }else{
                  console.log("Other protocol door!");
                  // TODO
                  console.log(door.data.sensor_auth);
                  let statusOfNightMare = "";
                  console.log(door.data.status);
                  if (typeof door.data.status === "undefined") {
                    statusOfNightMare = "Closed";
                  } else {
                    statusOfNightMare = door.data.status;
                  }
                  console.log(result.dor);
                  if (parseInt(JSON.parse(result.dor)) == 0) {
                    updRef.update({
                      status: "Open",
                      prev_status: statusOfNightMare
                    });

                    if (
                      typeof door.data.guards !== "undefined" &&
                      door.data.guards.length > 0
                    ) {
                      door.data.guards.forEach(guardVal => {
                        db.ref("guard/" + guardVal)
                          .once("value")
                          .then(function(snapshot) {
                            if (sendOk) {
                              if (door.data.status !== door.data.prev_status) {
                                  sms.send(`ALERT ! ${
                                    door.data.name
                                  } is open. Please follow up with an inspection`,snapshot.val().mobileNo);
                                  
                                  email.send(
                                    snapshot.val().email,
                                    `${door.data.name} is OPEN`,
                                    `<p>${door.data.name} is OPEN on ${new Date().toLocaleString("en-US", {
                                      timeZone: "Asia/Singapore"
                                    })}. Please follow up with an inspection</p>`);
                              }
                            }
                          });
                      });
                    }
                  } else {
                    updRef.update({
                      status: "Closed",
                      prev_status: statusOfNightMare
                    });

                    if (
                      typeof door.data.guards !== "undefined" &&
                      door.data.guards.length > 0
                    ) {
                      door.data.guards.forEach(guardVal => {
                        db.ref("guard/" + guardVal)
                          .once("value")
                          .then(function(snapshot) {
                            if (sendOk) {
                              if (door.data.status !== door.data.prev_status) {
                                sms.send(`INFO ! ${
                                  door.data.name
                                } is closed on ${new Date().toLocaleString("en-US", {
                                  timeZone: "Asia/Singapore"
                                })}`,snapshot.val().mobileNo);
              
                                email.send(
                                  snapshot.val().email,
                                  `${door.data.name} is CLOSED`,
                                  `<p>${door.data.name} is CLOSED on ${new Date().toLocaleString("en-US", {
                                    timeZone: "Asia/Singapore"
                                })}</p>`);
                              }
                            }
                          });
                      });
                    }
                  }  
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
    res.status(200).json(result);
  } catch (error) {
    //  In case of error, return the original message.
    res.status(500).json(req.body);
  }
  console.log("------------------------");
});

router.post("/sigfox-error", (req, res, next) => {
  console.log("/sigfox-error");
  console.log(req.body);
  res.json({});
});

router.post("/sigfox-service", (req, res, next) => {
  console.log("/sigfox-service");
  console.log(req.body);
  res.json({});
});
const PORT_NUMBER=process.env.SIGFOX_SERVER_PORT;
app.listen(PORT_NUMBER, function() {
  console.log(`Sigfox Callback Server is running on port ${PORT_NUMBER}`);
});
