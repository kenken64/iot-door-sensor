#include <FS.h> 
#include "ESPBattery.h";
#define BLYNK_PRINT Serial
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266httpUpdate.h>

//needed for library
#include <DNSServer.h>
#include <ESP8266WebServer.h>
#include <WiFiManager.h>          //https://github.com/tzapu/WiFiManager

#include <ArduinoJson.h>   

// You should get Auth Token in the Blynk App.
// Go to the Project Settings (nut icon).
char blynk_token[33] = "166fff24ab4f4a52a31a936369d0a1cc";

//flag for saving data
bool shouldSaveConfig = false;

const int doorSensor = 12;
const int greenLED = 2;
// Time to sleep (in seconds):
const int sleepTimeS = 10;

BlynkTimer timer;
ESPBattery battery = ESPBattery();
const char* fwUrlBase = "https://ota-firmware.kennethphang.asia/firmware/";
const int FW_VERSION = 107;

//callback notifying us of the need to save config
void saveConfigCallback () {
  Serial.println("Should save config");
  shouldSaveConfig = true;
}

BLYNK_CONNECTED() {
  Blynk.syncAll();
}

BLYNK_WRITE(V0) //Button Widget is writing to pin V0
{
  int pinData = param.asInt();
  Serial.println("nothing to flash >> firmware " + pinData);
  if(pinData == 1){
    Serial.println("flash firmware...is 1");
    checkForUpdates();
    Blynk.virtualWrite(V4, FW_VERSION);
  }
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
    Blynk.virtualWrite(V4, FW_VERSION);
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
    Blynk.virtualWrite(V4, FW_VERSION);
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
    Blynk.virtualWrite(V4, FW_VERSION);
    delay(30);
  }else {
    Serial.println("Door Closed");
    Serial.print("Percentage: ");
    Serial.println(battery.getPercentage());
    Blynk.virtualWrite(V1, 0);
    Blynk.virtualWrite(V2, battery.getPercentage());
    Blynk.virtualWrite(V3, battery.getLevel());
    Serial.println("ESP8266 in sleep mode");
    Blynk.virtualWrite(V4, FW_VERSION);
    ESP.deepSleep(10e6, WAKE_RF_DEFAULT);
  }*/
}

void checkForUpdates() {
  String mac = getMAC();
  String fwURL = String( fwUrlBase );
  String fwVersionURL = fwURL;
  fwVersionURL.concat( blynk_token );

  Serial.println( "Checking for firmware updates." );
  Serial.print( "MAC address: " );
  Serial.println( mac );
  Serial.print( "Firmware version URL: " );
  fwVersionURL.concat( ".bin" );
  Serial.println( fwVersionURL );

  HTTPClient httpClient;
  
  httpClient.begin( fwVersionURL, "49 4A 1D 7E F2 CD 58 36 2D BE 59 A3 0B 92 74 5A 90 FE 21 4E" );
  int httpCode = httpClient.GET();
  Serial.println( httpCode );
  if( httpCode == 200 ) {
    Serial.println( "Preparing to update" );
    t_httpUpdate_return ret = ESPhttpUpdate.update( fwVersionURL );
    Serial.println( ret );
    switch(ret) {
      case HTTP_UPDATE_FAILED:
        Serial.printf("HTTP_UPDATE_FAILD Error (%d): %s", ESPhttpUpdate.getLastError(), ESPhttpUpdate.getLastErrorString().c_str());
        break;

      case HTTP_UPDATE_NO_UPDATES:
        Serial.println("HTTP_UPDATE_NO_UPDATES");
        break;
    }
  }
  else {
    Serial.print( "Firmware version check failed, got HTTP response code " );
    Serial.println( httpCode );
  }
  httpClient.end();
}


String getMAC()
{
  uint8_t mac[6];
  char result[14];
  snprintf( result, sizeof( result ), "%02x%02x%02x%02x%02x%02x", mac[ 0 ], mac[ 1 ], mac[ 2 ], mac[ 3 ], mac[ 4 ], mac[ 5 ] );
  return String( result );
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
  while (WiFi.status() != WL_CONNECTED) {
    Serial.println("Connecting to WIFI ...");
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
