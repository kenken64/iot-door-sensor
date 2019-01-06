
#include "ESPBattery.h";
#define BLYNK_PRINT Serial
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>

// You should get Auth Token in the Blynk App.
// Go to the Project Settings (nut icon).
char auth[] = "f7e4f6e265354cbca4cdaa3420a63aea";

// Your WiFi credentials.
// Set password to "" for open networks.
char ssid[] = "kenken64";
char pass[] = "7730112910100";

const int doorSensor = 12;
const int greenLED = 2;
// Time to sleep (in seconds):
const int sleepTimeS = 10;

WidgetLED led1(V1);
BlynkTimer timer;
ESPBattery battery = ESPBattery();

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
    Serial.println("Door Open");
    Serial.print("Percentage: ");
    Serial.println(battery.getPercentage());
    analogWrite(greenLED,1023);
    led1.on();
    Blynk.virtualWrite(V2, battery.getPercentage());
    delay(30);
  }else {
    Serial.println("Door Closed");
    led1.off();
    Serial.print("Percentage: ");
    Serial.println(battery.getPercentage());
    Blynk.virtualWrite(V2, battery.getPercentage());
    ESP.deepSleep(10e6);
  }
}


void setup() {
  Serial.begin(9600);
  pinMode(doorSensor,INPUT_PULLUP);
  pinMode(greenLED, OUTPUT);
  battery.setLevelChargingHandler(stateHandler);
  Serial.println("\n\nLevel charging Handler");
  stateHandler(battery);
  Serial.println("ESP8266 in sleep mode");
  Blynk.begin(auth, ssid, pass);
  timer.setInterval(1000L, doorSensorWidget);
}

void loop() {
  battery.loop();
  Blynk.run();
  timer.run();
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
}
