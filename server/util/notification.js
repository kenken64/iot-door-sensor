'use strict';

require("dotenv").config();
const twilio = require("twilio");
const nodemailer = require("nodemailer");
const fromEmail = process.env.SMTP_GMAIL_ACC;

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: fromEmail,
      pass: process.env.SMTP_GMAIL_PASSWORD
    }
  });
const accountSid = process.env.TWILIO_SSID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const client = new twilio(accountSid, authToken);
class Email {
    constructor(){
        console.log("Email");
    }

    send(toEmail, subject, htmlcontent){
        console.log("Send Email..." + toEmail);
        if(typeof(toEmail) !== 'undefined'){
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
    }
}

class SMS {
    constructor(){
        console.log("SMS");
    }

    send(body, toMobile){
        console.log("Send SMS..." + toMobile);
        if(typeof(toMobile) !== 'undefined'){
            client.messages
            .create({
                body: body,
                to: toMobile, // Text this number
                from: process.env.TWILIO_NUMBER // From a valid Twilio number
            }).then((message)=>{
                console.info(message);
            }).catch((error)=>{
                console.warn(error);
            });
        }
        
    }
    
}

module.exports = { Email, SMS };