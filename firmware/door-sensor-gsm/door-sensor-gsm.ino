#include <GPRS_Shield_Arduino.h>
#include <SoftwareSerial.h>
#include <Wire.h>

#define DOOR1 2
#define RED   10
#define GREEN 9

#define PIN_TX    7
#define PIN_RX    8
#define BAUDRATE  9600
#define PHONE_NUMBER "+6591450517"
#define DOOR_OPEN_MESSAGE  "DOOR_OPEN"
#define DOOR_CLOSED_MESSAGE  "DOOR_CLOSED"

GPRS gprs(PIN_TX,PIN_RX,BAUDRATE);//RX,TX,BaudRate

unsigned long t1 = 0;
unsigned long timer = millis();
String d1;
int send = 0, s1 = 0;
int triggerDoorSensor = LOW;
int prevTriggerDoorSensor = LOW;

int doorState = LOW;

void doorChange() {
  doorState = !doorState;
  Serial.println("1 Interrupt !");
  Serial.println(doorState);
  Serial.println("2 Interrupt !");
  digitalWrite(RED , LOW);
  digitalWrite(GREEN , HIGH);
  if(doorState == HIGH){
    SendTextMessage(DOOR_OPEN_MESSAGE);
    prevTriggerDoorSensor = triggerDoorSensor;
    triggerDoorSensor = doorState;  
  }
  
}

void setup() {
  //gprs.checkPowerUp();
  pinMode(9, OUTPUT);
  pinMode(10, OUTPUT);
  pinMode(DOOR1 , INPUT_PULLUP);
  Serial.println("digitalPinToInterrupt...");
  attachInterrupt(digitalPinToInterrupt(DOOR1), doorChange, FALLING);
  Serial.begin(9600);
  /*
  while(!gprs.init()) {
      delay(1000);
      Serial.println("Initialization failed!");
  }  

  while(!gprs.isNetworkRegistered())
  {
    delay(1000);
    Serial.println("Network has not registered yet!");
  }

  Serial.println("gprs initialize done!");
  Serial.println("ready to send message ...");*/
}

void loop() {
  int val = digitalRead(DOOR1);
  Serial.println(val);
  if(val == 1){
    digitalWrite(RED , HIGH);
    digitalWrite(GREEN , LOW);
    if(prevTriggerDoorSensor != triggerDoorSensor){
      Serial.println("send sms for close");
      SendTextMessage(DOOR_CLOSED_MESSAGE);
      triggerDoorSensor = LOW;
    }
  }
  delay(250);
  
}

void SendTextMessage(char message)
{
  Serial.println("SEND SMS");
  /*
  if(gprs.sendSMS(PHONE_NUMBER,message)) //define phone number and text
  {
    Serial.print("Send SMS Succeed!\r\n");
  }
  else {
    Serial.print("Send SMS failed!\r\n");
  }*/
}
