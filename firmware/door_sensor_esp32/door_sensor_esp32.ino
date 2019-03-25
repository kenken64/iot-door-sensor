#define BLYNK_PRINT Serial
#define DEBUG 1

#include <WiFi.h>
#include <WiFiClient.h>
#include <BlynkSimpleEsp32.h>
#include <esp_wifi.h>
#include <esp_bt.h>

// You should get Auth Token in the Blynk App.
// Go to the Project Settings (nut icon).
char auth[] = "980f92ef13db430594a89315d86dd77b";

// Your WiFi credentials.
// Set password to "" for open networks.
char ssid[] = "kenken64";
char pass[] = "7730112910100";
const int doorSensor = 4;
const int greenLED = 2;
// Timer: Auxiliary variables
unsigned long now = millis();
unsigned long lastTrigger = 0;
boolean startTimer = false;

void IRAM_ATTR detectsDoorState() {
  Serial.println("Door Open");
  digitalWrite(greenLED,HIGH);
  Blynk.virtualWrite(V1, 1);
  startTimer = true;
  lastTrigger = millis();
}

void setup()
{
  esp_log_level_set("*", ESP_LOG_VERBOSE);
  // Debug console
  Serial.begin(115200);
  pinMode(doorSensor,INPUT_PULLUP);
  pinMode(greenLED, OUTPUT);
  digitalWrite(greenLED, LOW);
  WiFi.enableSTA(true);
  WiFi.persistent(false); 
  WiFi.begin(ssid, pass);
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print("l");
  }
  Serial.println("Connected to the WiFi network");
  Blynk.config(auth);
  Blynk.connect();
  Blynk.syncAll();
  esp_sleep_enable_ext0_wakeup(GPIO_NUM_4,1); //1 = High, 0 = Low
  attachInterrupt(digitalPinToInterrupt(GPIO_NUM_4), detectsDoorState, RISING);
}

void loop()
{
  if(!Blynk.connected())
  {
    Serial.println("Reconnecting blynk... ");
    Blynk.config(auth);
    Blynk.connect();
  }else{
    int state = digitalRead(doorSensor);
    //Serial.println(state);
    if (isnan(state) || isnan(state)) {
      Serial.println("Failed to read from door sensor!");
      return;
    }
    if(state == LOW){
      Serial.println("Door Closed");
      Blynk.virtualWrite(V1, 0);
      digitalWrite(greenLED, LOW);
      delay(800);
      esp_wifi_stop();
      esp_bt_controller_disable();
      esp_deep_sleep_start();
    }else{
      Serial.println("Door Open");
      digitalWrite(greenLED, HIGH);
      Blynk.virtualWrite(V1, 1);
    }
    Blynk.run();
  }
}
