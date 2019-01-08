require("dotenv").config();
const http = require("http");
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
var accountSid = process.env.TWILIO_SSID;
var authToken = process.env.TWILIO_AUTH_TOKEN;

var alreadySentBefore = false;
var alreadySentBeforeCnt = 0;
var client = new twilio(accountSid, authToken);

const credFile = process.env.FIREBASE_SVC_ACC_FILE || "./iot-door-sensor.json";
var serviceAccount = require(credFile);
const fromEmail = process.env.SMTP_GMAIL_ACC;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DB_URL
});

var db = admin.firestore();
const settings = { /* your settings... */ timestampsInSnapshots: true };
db.settings(settings);

var doorCollection = db.collection("door");
var notificationCol = db.collection("notification");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: fromEmail,
    pass: process.env.SMTP_GMAIL_PASSWORD
  }
});

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

async function pollVirtualPort2(value, doc) {
  await http
    .get(`http://blynk-cloud.com/${value.sensor_auth}/get/V2`, resp => {
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
          if (
            parseInt(JSON.parse(data)) != 50 ||
            parseInt(JSON.parse(data)) != 20 ||
            parseInt(JSON.parse(data)) != 2
          ) {
            alreadySentBefore = false;
            alreadySentBeforeCnt = 0;
          }
          if (
            parseInt(JSON.parse(data)) == 50 ||
            parseInt(JSON.parse(data)) == 20 ||
            parseInt(JSON.parse(data)) == 2
          ) {
            let additionalMessage = "";
            if (parseInt(JSON.parse(data)) == 2) {
              additionalMessage = "Device probably went offline";
            }

            if (!alreadySentBefore && alreadySentBeforeCnt != 1) {
              sendEmail(
                fromEmail,
                doc.data().email,
                `${value.name} device battery running low`,
                `<p>Device battery is running low (${parseInt(
                  JSON.parse(data)
                )}%). ${additionalMessage}</p>`
              );

              alreadySentBefore = true;
              alreadySentBeforeCnt = 1;
              console.log("Battery is runnig low...");
              let notifyRef = notificationCol.doc(
                `Email/battery_low/${doc.data().email}`
              );
              notifyRef.set({
                transportType: "Email",
                type: "battery_low",
                fromEmail: fromEmail,
                toEmail: doc.data().email,
                subject: `${value.name} device battery running low`,
                emailContent: `<p>Device battery is running low (${parseInt(
                  JSON.parse(data)
                )}%). ${additionalMessage}</p>`,
                sentTimestamp: new Date()
              });
            }
          }
        }
      });
    })
    .on("error", err => {
      console.log("Error: " + err.message);
    });
}

async function pollVirtualPort1(value, doc) {
  await http
    .get(`http://blynk-cloud.com/${value.sensor_auth}/get/V1`, resp => {
      let data = "";

      // A chunk of data has been recieved.
      resp.on("data", chunk => {
        data += chunk;
      });

      // The whole response has been received. Print out the result.
      resp.on("end", () => {
        if (typeof data !== "undefined") {
          if (data === "Invalid token.") return;
          console.log("pollVirtualPort1 : > " + JSON.parse(data));
          console.log("pollVirtualPort1 : > " + JSON.parse(data));
          if (parseInt(JSON.parse(data)) == 1) {
            console.log(doc.data().mobileNo);
            console.log(process.env.TWILIO_NUMBER);
            client.messages
              .create({
                body: `ALERT ! ${
                  value.name
                } is open please follow up with an inspection`,
                to: doc.data().mobileNo, // Text this number
                from: process.env.TWILIO_NUMBER // From a valid Twilio number
              })
              .then(message => {
                console.log("SMS sent : > " + message.sid);
                console.log(`SEND SMS DOOR OPEN!  ${value.name}`);
                sendEmail(
                  fromEmail,
                  doc.data().email,
                  `${value.name} is OPEN`,
                  `<p>${value.name} is OPEN</p>`
                );
                console.log("< @#@@!@!#@ doorRef : > ");
                db.collection("door")
                  .where("sensor_auth", "==", value.sensor_auth)
                  .get()
                  .then(function(querySnapshot) {
                    querySnapshot.forEach(function(doc) {
                      console.log(doc.id, " => ", doc.data());
                      // Build doc ref from doc.id
                      console.log("< @#@@!@!#@ doorRef : > " + doc.data());
                      db.collection("door")
                        .doc(doc.id)
                        .update({ status: "Open" });
                    });
                  });

                let notifyRef = notificationCol.doc(
                  `Email/door_open/${doc.data().email}`
                );
                notifyRef.set({
                  transportType: "Email",
                  type: "door_open",
                  fromEmail: fromEmail,
                  toEmail: doc.data().email,
                  subject: `${value.name} is OPEN`,
                  emailContent: `<p>${value.name} is OPEN</p>`,
                  sentTimestamp: new Date()
                });

                notifyRef = notificationCol.doc(
                  `SMS/door_open/${doc.data().mobileNo}`
                );
                notifyRef.set({
                  transportType: "Sms",
                  type: "door_open",
                  fromPhone: process.env.TWILIO_NUMBER,
                  toPhone: doc.data().mobileNo,
                  message: `ALERT ! ${
                    value.name
                  } is open please follow up with an inspection`,
                  sentTimestamp: new Date()
                });
              });
          } else {
            sendEmail(
              fromEmail,
              doc.data().email,
              `${value.name} is CLOSED`,
              `<p>${value.name} is CLOSED</p>`
            );

            console.log(`SEND EMAIL DOOR CLOSED!  ${value.name}`);
            db.collection("door")
              .where("sensor_auth", "==", value.sensor_auth)
              .get()
              .then(function(querySnapshot) {
                querySnapshot.forEach(function(doc) {
                  console.log(doc.id, " => ", doc.data());
                  // Build doc ref from doc.id
                  db.collection("door")
                    .doc(doc.id)
                    .update({ status: "Closed" });
                });
              });

            let notifyRef = notificationCol.doc(
              `Email/door_closed/${doc.data().email}`
            );
            notifyRef.set({
              transportType: "Email",
              type: "door_closed",
              fromEmail: fromEmail,
              toEmail: doc.data().email,
              subject: `${value.name} is CLOSED`,
              emailContent: `<p>${value.name} is CLOSED</p>`,
              sentTimestamp: new Date()
            });
          }
        }
      });
    })
    .on("error", err => {
      console.log("Error: " + err.message);
    }); // end V1 request
}

setInterval(() => {
  doorCollection.get().then(snapshot => {
    let snapshotPromises = snapshot.docs.map(doc => {
      let doorData = doc.data();
      console.log("GET doorData --> " + JSON.stringify(doorData));
      return doorData;
    });

    Promise.all(snapshotPromises).then(results => {
      results.forEach(doorValue => {
        console.log("Checking for door NAME --> " + doorValue.name);
        if (typeof doorValue.guards !== "undefined") {
          doorValue.guards.forEach(guardVal => {
            let guardDoc = db.doc("guard/" + guardVal);
            guardDoc.get().then(doc => {
              if (!doc.exists) {
                console.log("No such document!");
              } else {
                console.log("Polling for V1 and V2");
                // V1 request
                pollVirtualPort1(doorValue, doc);
                // v2 request
                pollVirtualPort2(doorValue, doc);
              }
            });
          });
        } else {
          console.log("No guards assign to the door !");
        }
      });
    });
  });
}, parseInt(process.env.INTERVAL));
