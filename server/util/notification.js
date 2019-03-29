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
const whatsAppNumber = process.env.TWILIO_WHATSAPP_NO;

const client = new twilio(accountSid, authToken);
class Email {
    constructor(){
        //console.log("Email");
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
        //console.log("SMS");
    }

    async send(body, toMobile){
        console.log("Send SMS & WhatsApp..." + toMobile);
        if(typeof(toMobile) !== 'undefined'){
            await client.messages
            .create({
                body: body,
                to: toMobile, // Text this number
                from: process.env.TWILIO_NUMBER // From a valid Twilio number
            }).then((message)=>{
                //console.info(message);
            }).catch((error)=>{
                console.warn(error);
            });
            console.log("WHATSAPP !!>>> "  +whatsAppNumber);
            await client.messages
            .create({
                body: body,
                from: `whatsapp:${whatsAppNumber}`,
                to: `whatsapp:${toMobile}`
            })
            .then(message => console.log("WHATSAPP !!!" + message.sid))
            .done();
        }
        
    }
    
}

module.exports = { Email, SMS };