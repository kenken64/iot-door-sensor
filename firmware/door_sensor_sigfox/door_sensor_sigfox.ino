#include "SIGFOX.h"
//#include <JeeLib.h>

#define DOOR1 2
#define RED_LED   9
#define GREEN_LED 8

int triggerDoorSensor = 1;
int prevTriggerDoorSensor = 1;

//int doorState = LOW;
//  Get temperature and voltage of the SIGFOX module.
float voltage;
//  IMPORTANT: Check these settings with UnaBiz to use the SIGFOX library correctly.
static const String device = "g88pi";  //  Set this to your device name if you're using UnaBiz Emulator.
static const bool useEmulator = false;  //  Set to true if using UnaBiz Emulator.
static const bool echo = true;  //  Set to true if the SIGFOX library should display the executed commands.
static const Country country = COUNTRY_SG;  //  Set this to your country to configure the SIGFOX transmission frequencies.
static UnaShieldV2S transceiver(country, useEmulator, device, echo);  //  Uncomment this for UnaBiz UnaShield V2S / V2S2 Dev Kit
// static UnaShieldV1 transceiver(country, useEmulator, device, echo);  //  Uncomment this for UnaBiz UnaShield V1 Dev Kit

//ISR(WDT_vect) { Sleepy::watchdogEvent(); } // Setup for low power waiting

/*
void doorChange() {
  doorState = !doorState;
}*/

void setup() {  //  Will be called only once.
  //  Initialize console so we can see debug messages (9600 bits per second).
  Serial.begin(9600);  Serial.println(F("Running setup..."));  
  pinMode(RED_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(DOOR1 , INPUT_PULLUP);
  //attachInterrupt(digitalPinToInterrupt(DOOR1), doorChange, CHANGE);
  //  Check whether the SIGFOX module is functioning.
  if (!transceiver.begin()) stop(F("Unable to init SIGFOX module, may be missing"));  //  Will never return.
  digitalWrite(RED_LED , HIGH);
  digitalWrite(GREEN_LED , LOW);
}

void loop() {  //  Will be called repeatedly.
  int val = digitalRead(DOOR1);
  //  Send message counter, temperature and voltage as a structured SIGFOX message, up to 10 times.
  Serial.print(F("\nRunning loop #")); 
  Serial.println(val);
  
  
  if(val == 1){
    digitalWrite(RED_LED , HIGH);
    digitalWrite(GREEN_LED , LOW);
    Serial.println(prevTriggerDoorSensor);  
    Serial.println(triggerDoorSensor);  
    if(prevTriggerDoorSensor != triggerDoorSensor){
      transceiver.getVoltage(voltage);
      float percent = ((voltage-3)/0.7)*100;
      Message msg(transceiver);  //  Will contain the structured sensor data.
      msg.addField("id", "sf01");  //  4 bytes for the id.
      msg.addField("bat", percent);  //  4 bytes for the voltage.
      msg.addField("dor", val); //  1 bytes for the door state.
      msg.send();
      Serial.println(F("SENT ! for door closed"));  
      triggerDoorSensor = 1;
    }
  }else if(val == 0){
    digitalWrite(RED_LED , LOW);
    digitalWrite(GREEN_LED , HIGH);
    if(triggerDoorSensor != 0){
      prevTriggerDoorSensor = triggerDoorSensor;
      triggerDoorSensor = val;
      transceiver.getVoltage(voltage);
      float percent = ((voltage-3)/0.7)*100;
      Message msg(transceiver);  //  Will contain the structured sensor data.
      msg.addField("id", "sf01");  //  4 bytes for the id.
      msg.addField("bat", percent);  //  4 bytes for the voltage.
      msg.addField("dor", val); //  1 bytes for the id.
      msg.send();
      Serial.println(F("SENT ! for door open"));  
    }
  } 
  delay(10000);
  //Sleepy::loseSomeTime(120000);
}
