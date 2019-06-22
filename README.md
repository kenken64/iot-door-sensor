# Door/Window Sensor - Internet of Things

## Tindie Store - Order the device here https://bit.ly/2L2vBSy 

### If you would like to see further enhancement of this whole iot platform kindly donate to my BTC account

<img src="docs/btc.png" width="300px" height="300px">

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/pYRvByaGBP0/0.jpg)](https://www.youtube.com/watch?v=pYRvByaGBP0)

[![IMAGE ALT TEXT HERE](https://img.youtube.com/vi/cuYwMgwrSvQ/0.jpg)](https://youtu.be/cuYwMgwrSvQ)

Nothing spells security than being notified or alerted if somebody has entered your premises without your permission. It also helps when even before someone can gain entry, you already know who he or she is. The main idea of this door/window sensor is to simply provide you information if someone has gone through any of your property entry points.

## Works with Many Entry Points

The door/window sensor is primarily used to detect people or objects that have passed through the doors, but it’s also compatible to windows and any enclosures that could be opened.

## Small to Notice

The door/window sensor is a very unassuming device so it blends well with the rest of the commonly found items or appliances in your home. It is also quite small you can easily hide it well, away from the prying eyes of potential intruders, and it doesn’t get in the way with the actual functions of the entry points.

The device is a magnetic switch that allows it to accurately determine location and direction. In other words, there are no false alarms and leads.

## Very Easy and Fast Installation

As a magnetic device, it doesn’t require any intricate tools to install. In fact, you simply need to snap it into any metal part of your entryway, and you can already properly and quickly configure the door sensor. If not, you can conveniently attached even a small piece of metal at any part of the door and window.

## Works on the cloud

A connected home brings devices and services together for an integrated, autonomous experience that improves a consumer’s life. Connected home experiences include everything from window/door sensor , voice-controlled lights, house-cleaning robots, machine learning-enabled security cameras, and WiFi routers that troubleshoot for you. Thanks to decreasing costs and increasing options for connectivity, these smart home devices, sensors, and tools can be interlinked to create real-time, contextual, and smart experiences for consumers.

IoT powers the connected home by bringing new features and capabilities to smart devices, like interconnectivity, security, offline communication, predictive maintenance, analytics for consumer insights, and machine learning. Each of these capabilities play a different role in key connected home use cases such as home automation, home security and monitoring, and home networking.


# Multiple version
- Wifi version
- Sigfox version
- Lorawan version require an existing lorawan gateway (Prototype, too expensive)

# Pre-requisite Lora Gateway
- Use the raspi-config tool (with sudo raspi-config) to enable SPI on the Raspberry Pi
- Install wiringpi (sudo apt-get install wiringpi)

# Pre-requisite microcontroller and parts
- Adafruit Huzzah ESP8266/TTGO ESP32 Wifi/Arduino UNO
- 2-way connector
- LED
- 47k Ohm Resistor
- 10k Ohm Resistor
- 220 Ohm Resistor
- Magnetic Door Sensor
- Jumper
- Custom made PCB by kenken64
- Lipo Battery/ 18650 battery
- Headers 
- UnaShield Sigfox for Arduino UNO

## 3D printed Casing/Housing
- ESP8266/ESP32 STL 3d Design
- Sigfox STL 3d Design


# PCB Design (Eagle and Fritzing)
- WIFI Version 1 (Custom made PCB)
<br>
<img src="docs/pcb3.jpg" width="300px" height="300px">

- WIFI Version 2 (Custom made PCB)
<br>
<img src="docs/pcb_design.png" width="300px" height="400px">

<img src="docs/pcb_design2.png" width="500px" height="400px">

- Sigfox version (Shield from UnaBiz)


# Pre-requisite software & library

- Microsoft Visual Studio Code
- Node JS
- Ubuntu/Windows 10 ( 2 CPU and 2GB ram )
- Angular 7 Cli
- Arduino IDE
- ESPBattery
- ESP 8266/32 Arduino library
- Unashield Sigfox library

# Pre-requisite Cloud account

- Twilio (require your own credit to send out SMS/WhatsApp)
- Gmail https://mail.google.com/mail/u/0/
- Google Firebase Realtime Database https://console.firebase.google.com/u/0/?pli=1
- Blynk Cloud Service ( Mobile App) 

# Twilio - SMS and WhatsApp Notification

- Create a twilio account and top up with the credits.
- Note down the twilio SSID and AUTH TOKEN.
- Purchase a number from Twilio
- Also note down the WhatsApp from number

![Image of Twilio](docs/twilio.png)

# SMTP or Gmail account Email notification

- Create gmail account. Please do not use personal gmail account for this.
- Enable unsecure access to this account [Gmail API setting](https://support.google.com/accounts/answer/6010255?hl=en)

# Backend Server Side (AWS Lightsail/ DO / Azure / Google Cloud)
- Detect door is open and closed.
- Send SMS using twilio to the configure recipient mobile number
- Send notification email to the configure recipient email address
- Detect battery is low send notification via SMS and email
- Log all events to the door's device
- Provide exportable reporting of all doors 

# Environment variable

| Env variables        | Description           | 
| ------------- |:-------------:| 
| SMTP_GMAIL_ACC      | Gmail SMTP account that use to send email to security guard  | 
| SMTP_GMAIL_PASSWORD     | Password for the above email account      |  
| TWILIO_SSID | SSID for the twilio sms APIs      |   
| TWILIO_AUTH_TOKEN | Security token for the twilio sms APIs      | 
| TWILIO_NUMBER | You need a twilio phone number in order to send SMS to the receipient      | 
| FIREBASE_DB_URL | NoSQL Database url     | 
| JOB_INTERVAL | Interval period where the job poll for the changes from firebase and the blynk APIs      | 
| JOB_TIMEOUT | Tiemout period where the job poll for the changes from firebase and the blynk APIs      | 
| NOTIFICATION_ENABLE | Disable and enable notification when door is open and closed      | 
| FIREBASE_SVC_ACC_FILE | Firebase credential file to perform admin operations e.g.  https://door-sensor-proj.firebaseio.com  | 
| CLEAN_UP_SCHEDULE | Schedule timing to cleanup events logs     | 
| BLYNK_API_URL | Blynk IOT API URL  e.g. http://blynk-cloud.com/   | 
| SIGFOX_SERVER_PORT | Sigfox callback backend server port number     |
| TWILIO_WHATSAPP_NO | Twilio WhatsApp from number     |

# Door/Window sensor Web App

## List of door/window installed with sensor

![List of doors](docs/list.png)

## Add new door/window sensor
<img src="docs/add_new_door_sensor.png" width="400px" height="600px">

## Add new security personel to the system
![Add guard to the system](docs/associate_guard_to_sensor.png)

## Associate multiple security guard to the sensors
![Associate guard to the door sensors](docs/configure_guard_door.png)


## Provide feedback on door/window events
![feedback on events](docs/feedback_door_closed.png)

## SMS Notification
<img src="docs/screenshot_7.png" width="400px" height="600px">

## Email Notification
<img src="docs/screenshot_8.png" width="400px" height="600px">

## WhatsApp Notification
<img src="docs/twilio_whatsapp.png" width="400px" height="600px">

## Export as Excel Spreadsheet
<img src="docs/spreadsheet.png" width="400px" height="600px">

# Setup Instructions for the PWA Web App and Backend

Kindly create a Azure/AWS/Google Cloud account to deploy all this component on a Ubuntu 18.04 distribution

After creating a cloud instance, ssh/login into the instance install git software and node js. Please follow the links below with all the installation steps 

https://www.digitalocean.com/community/tutorials/how-to-install-git-on-ubuntu-18-04-quickstart

https://www.digitalocean.com/community/tutorials/how-to-install-node-js-on-ubuntu-18-04


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.1.4.

## Logon to the newly created cloud server and pull down the github source codes using the below linux command

```
cd ~
git clone https://github.com/kenken64/iot-door-sensor.git
```
## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).

## Install PWA from dist directory to Nginx 

Use the link below for the nginx installation

https://www.digitalocean.com/community/tutorials/how-to-install-nginx-on-ubuntu-18-04

Right after the web server is installed, install free SSL certificate using Let's Encrypt 

https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-18-04

Lastly, copy all the files from the angular app /dist directory to the nginx web server root directory e.g. /var/www/html

## Google Firebase

It is must to have Google account in order to create a firebase account for this project

1. Create a firebase real time database project following this link https://firebase.google.com/

## Install and start redis server

1. Install redis server

```
sudo apt-get update
sudo apt-get install redis
```

2. Start Redis server

```
sudo service redis-server start
```
3. Check redis server status
```
sudo service redis-server status
```

4. if only there is a crash on the worker process then run flush

```
redis-cli FLUSHALL
```

## Start Backend server
How to start the sms and email backend server that poll the devices.

```
$ cd server/
$ npm i 
$ pm2 start server.js --name server --max-memory-restart 1G --restart-delay 10000 --node-args="--expose-gc --max-old-space-size=4096"
```

## Start Door Sensor Worker Engine to poll door's state
Worker consumes the job from the delegator to check the door sensors and send out notification via SMS/WhatsApp/Email.

Each worker is configured with its own designated door sensor's blynk auth key. Refer to the server/worker-config.json

```
[
    {
        "workerName": "worker1",
        "doors": ["b40605f4f5d5484bbe7b9a3cb78f1376",
                "962d1f57311e47c7bb71697b8051de30",
                "980f92ef13db430594a89315d86dd37b"
                
                
        ]
    },
    {
        "workerName": "worker2",
        "doors": [ "185333bfb0d14a2a9365fdc3bd37966a",
                "953b351b1ba4428bb781c40bec29a300",
                "194eab22d2bd49c0a580c01d7d19ce34"
        ]
    },
    {
        "workerName": "worker3",
        "doors": [ "166fff24ab4f4a52a31a936369d3a1cc",
                "2dde80b00cf342c1b6977e91dd9b6039"
        ]
    },
    {
        "workerName": "worker4",
        "doors": [ "c56c9a1ab4b1415998c06173786354f2",
                "2f0b7bd399a54a839e976a09bee2463a"
        ]
    }
]
```

```
$ cd server/
$ pm2 start worker.js --name worker --max-memory-restart 500M -- --workername=worker1 --node-args="--expose-gc
$ pm2 start worker.js --name worker2 --max-memory-restart 500M -- --workername=worker2 --node-args="--expose-gc
$ pm2 start worker.js --name worker3 --max-memory-restart 500M -- --workername=worker3 --node-args="--expose-gc
$ pm2 start worker.js --name worker4 --max-memory-restart 500M -- --workername=worker4 --node-args="--expose-gc
```

## Blynk Configuration

Go to your Google App Store/Apple store search for Blynk, install it

Register an account with Blynk

Create a new project, choose device as ESP8266 WIFI send the auth key to your email address


<img src="docs/Blynk2.jpg" width="400px" height="600px">

<img src="docs/Blynk3.jpg" width="400px" height="600px">

<img src="docs/Blynk4.jpg" width="400px" height="600px">

<img src="docs/Blynk5.jpg" width="400px" height="600px">

<img src="docs/Blynk6.jpg" width="400px" height="600px">

## Restful API for Blynk

Below is the link to test out the API using your REST client
https://blynkapi.docs.apiary.io/#

<img src="docs/blynk1.png" width="400px" height="600px">


<img src="docs/blynk2.png" width="400px" height="700px">


<img src="docs/blynk3.png" width="400px" height="600px">



## Install firmware to the ESP8266/ESP32

1. Plug the ESP8266 to your computer
2. Launch Arduino IDE , open up the Arduino sketch from the directory /firmware/door_sensor/door_sensor.ino
3. Search for the codes, replace the double quote values according to the auth code from the blynk email from your mailbox
```
char blynk_token[33] = "166fff24ab4f4a52a31a936369d0a1cc";
```
4. Make sure ESP8266 board are installed using the board manager.

![arduino board](docs/arduino_1.jpg)

5. Select the configuration properly before compiling and flashing the ESP8266. Take note the flash size and port.

![config](docs/arduino_3.jpg)

5. The following libraries is amust to be installed before sync the firmware to the ESP8266 board
  - ArduinoJson (Take note do not use the latest version)
  ![arduino Json](docs/arduino_6.jpg)

  - FS
  ![SPI Flash](docs/arduino_4.jpg)
  ![unified sensor](docs/arduino_5.jpg)

  - ESPBattery (https://github.com/LennartHennigs/ESPBattery)
  - Blynk
  ![blynk](docs/arduino_7.jpg)

  - WifiManager
  ![wifimanager](docs/arduino_8.jpg)  


6. Compile and sync the firmware to the microcontroller board

![compile sync](docs/arduino_2.jpg)


## Once everything is setup and up running on the cloud


Last thing to do is to power up the door sensor using a micro usb cable, at first if there isn't any wifi setting being configure. the device  will act as an wireless access point with the SSID stated as "AutoAPDoorSensor" Access the portal via the following web address htttp://192.168.244.1

Configure the door sensor device to connect to your own wifi router with credential. Do not change the blynk auth key.

<img src="docs/ap_wifi.jpg" width="400px" height="600px">

<img src="docs/ap_wifi3.jpg" width="400px" height="600px">

<img src="docs/ap_wifi2.jpg" width="400px" height="600px">



## Check the health of all processes
```
pm2 list
```
![pm2 list](docs/pm2list.png)

## Debug memory leakage
- Use ChromeDev Tools
- Dynatrace (https://www.dynatrace.com/)
- Sentry io (https://sentry.io/welcome/)

## Future work - Integrate with ElectricMagnetic lock 

Most of the EM lock in the market uses 12v AC likely need to enhance the PCB board

https://shopee.sg/Hot-DC-DC-Converter-Output-Power-Adapter-24V-12V-To-5V-USB-Step-Down-Module-i.10885840.691201434?gclid=Cj0KCQjwnKHlBRDLARIsAMtMHDFC6E65QBD9bycE3Slw0D0tBNxFKR-Vn5mH1KITMRHCil_hmbI2bzYaAmgOEALw_wcB