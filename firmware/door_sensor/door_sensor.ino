#include <FS.h> 
#include "ESPBattery.h";
#define BLYNK_PRINT Serial
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>

//needed for library
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>          //https://github.com/tzapu/WiFiManager

#include <ArduinoJson.h>   

// You should get Auth Token in the Blynk App.
// Go to the Project Settings (nut icon).
//166fff24ab4f4a52a31a936369d0a1cc
// b40605f4f5d5484bbe7b9a3cb78f1976
// 166fff24ab4f4a52a31a936369d0a1cc
char blynk_token[33] = "166fff24ab4f4a52a31a936369d0a1cc";

//flag for saving data
bool shouldSaveConfig = false;

const int doorSensor = 12;
const int greenLED = 2;
// Time to sleep (in seconds):
const int sleepTimeS = 10;

//WidgetLED led1(V3);
BlynkTimer timer;
ESPBattery battery = ESPBattery();

//callback notifying us of the need to save config
void saveConfigCallback () {
  Serial.println("Should save config");
  shouldSaveConfig = true;
}


void doorSensorWidget()
{
  int state = digitalRead(doorSensor);
  int batterPct  = battery.getPercentage();
  Serial.println(state);
  digitalWrite(greenLED, LOW);

  if (isnan(state) || isnan(state)) {
    Serial.println("Failed to read from door sensor!");
    return;
  }
  
  if (isnan(batterPct) || isnan(batterPct)) {
    Serial.println("Failed to read from battery pct!");
    return;
  }

  
  if(state == HIGH){
    Serial.println("Door Closed");
    Serial.print("Percentage: ");
    Serial.println(battery.getPercentage());
    Blynk.virtualWrite(V1, 0);
    Blynk.virtualWrite(V2, battery.getPercentage());
    Blynk.virtualWrite(V3, battery.getLevel());
    Serial.println("ESP8266 in sleep mode");
    ESP.deepSleep(10e6, WAKE_RF_DEFAULT);
  }else {
    Serial.println("Door Open");
    Serial.print("Percentage: ");
    Serial.println(battery.getPercentage());
    analogWrite(greenLED,1023);
    Blynk.virtualWrite(V1, 1);
    Blynk.virtualWrite(V2, battery.getPercentage());
    Blynk.virtualWrite(V3, battery.getLevel());
    delay(30);
  }

  /*
   if(state == HIGH){
    Serial.println("Door Open");
    Serial.print("Percentage: ");
    Serial.println(battery.getPercentage());
    analogWrite(greenLED,1023);
    Blynk.virtualWrite(V1, 1);
    Blynk.virtualWrite(V2, battery.getPercentage());
    Blynk.virtualWrite(V3, battery.getLevel());
    delay(30);
  }else {
    Serial.println("Door Closed");
    Serial.print("Percentage: ");
    Serial.println(battery.getPercentage());
    Blynk.virtualWrite(V1, 0);
    Blynk.virtualWrite(V2, battery.getPercentage());
    Blynk.virtualWrite(V3, battery.getLevel());
    Serial.println("ESP8266 in sleep mode");
    ESP.deepSleep(10e6, WAKE_RF_DEFAULT);
  }*/
}


void setup() {
  Serial.begin(9600);
  Serial.println();
  
  // enable this for testing
  //SPIFFS.format();
  
  Serial.println("mounting FS...");
  if (SPIFFS.begin()) {
    Serial.println("mounted file system");
    if (SPIFFS.exists("/config.json")) {
      //file exists, reading and loading
      Serial.println("reading config file");
      File configFile = SPIFFS.open("/config.json", "r");
      if (configFile) {
        Serial.println("opened config file");
        size_t size = configFile.size();
        // Allocate a buffer to store contents of the file.
        std::unique_ptr<char[]> buf(new char[size]);

        configFile.readBytes(buf.get(), size);
        DynamicJsonBuffer jsonBuffer;
        JsonObject& json = jsonBuffer.parseObject(buf.get());
        json.printTo(Serial);
        if (json.success()) {
          Serial.println("\nparsed json");

          strcpy(blynk_token, json["blynk_token"]);
        } else {
          Serial.println("failed to load json config");
        }
      }
    }
  } else {
    Serial.println("failed to mount FS");
  }
  //end read
  Serial.println(blynk_token);

  
  //WiFiManager
  //Local intialization. Once its business is done, there is no need to keep it around
  WiFiManager wifiManager;
  // enable this for testing
  //wifiManager.resetSettings();
  wifiManager.setSaveConfigCallback(saveConfigCallback);
  //set config save notify callback
  WiFiManagerParameter custom_blynk_token("blynk", "blynk token", blynk_token, 34);
  //add all your parameters here
  wifiManager.addParameter(&custom_blynk_token);

  //fetches ssid and pass and tries to connect
  //if it does not connect it starts an access point with the specified name
  //here  "AutoConnectAP"
  //and goes into a blocking loop awaiting configuration
  if (!wifiManager.autoConnect("AutoAPDoorSensor", "password1234")) {
    Serial.println("failed to connect and hit timeout");
    delay(3000);
    //reset and try again, or maybe put it to deep sleep
    ESP.reset();
    delay(5000);
  }

  //read updated parameters
  strcpy(blynk_token, custom_blynk_token.getValue());

  //save the custom parameters to FS
  if (shouldSaveConfig) {
    Serial.println("saving config");
    DynamicJsonBuffer jsonBuffer;
    JsonObject& json = jsonBuffer.createObject();
    json["blynk_token"] = blynk_token;

    File configFile = SPIFFS.open("/config.json", "w");
    if (!configFile) {
      Serial.println("failed to open config file for writing");
    }

    json.prettyPrintTo(Serial);
    json.printTo(configFile);
    configFile.close();
    //end save
  }

  Serial.println("local ip");
  Serial.println(WiFi.localIP());
  Serial.println(WiFi.gatewayIP());
  Serial.println(WiFi.subnetMask());
  
  pinMode(doorSensor,INPUT_PULLUP);
  pinMode(greenLED, OUTPUT);
  Serial.println(blynk_token);
  Blynk.config(blynk_token);
  Blynk.connect();
  Serial.println("BLYNK Connected ? " + Blynk.connected());
  battery.setLevelChangedHandler(stateHandler);
  Serial.println("\n\nLevel charging Handler");
  stateHandler(battery);
  timer.setInterval(1000L, doorSensorWidget);
}

void loop() {
  battery.loop();
  Blynk.run();
  timer.run();
  static unsigned long last = millis();
  if (millis() - last > 5000) {
      last = millis();
      Serial.printf("[MAIN] Free heap: %d bytes\n", ESP.getFreeHeap());
  }
}

void stateHandler(ESPBattery& b) {
  int state = b.getState();
  int level = b.getLevel();
  Serial.print("\nCurrent state: ");
  Serial.println(b.stateToString(state));
  Serial.print("Current level: ");
  Serial.println(b.getLevel());
  Serial.print("Percentage: ");
  Serial.println(b.getPercentage());
  Serial.print("Voltage: ");
  Serial.println(b.getVoltage());
}
